// @vitest-environment jsdom
//
// Behavioural tests for the inline <script> of index.html. The script is a
// browser-only IIFE-less blob, so we mount the page's markup into jsdom, stub
// fetch, and evaluate the script for real — assertions look at rendered DOM and
// at the JSON bodies the code actually posts.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom replaces the global URL, which node:fs won't accept — resolve by path.
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'index.html'), 'utf8');
const SCRIPT_OPEN = '<script>';
const scriptStart = html.indexOf(SCRIPT_OPEN);
const script = html.slice(scriptStart + SCRIPT_OPEN.length, html.lastIndexOf('</script>'));
const bodyMarkup = html.slice(html.indexOf('</style>') + '</style>'.length, scriptStart);

// ---- fixtures ----
const NEP = { id: 11, name: 'Nep Orshiso' };
const AVA = { id: 22, name: 'Ava Stone' };
const KIM = { id: 33, name: 'Kim Rao' };

// Shape mirrors what load() consumes: columns/projects/cards/project_order/people/trays.
const boardFixture = () => ({
  columns: ['To Do', 'Doing', 'Done'],
  projects: [
    { id: 1, name: 'Alpha', todolists: [{ id: 101, title: 'Backlog' }] },
    { id: 2, name: 'Beta', todolists: [{ id: 201, title: 'Inbox' }] },
    { id: 3, name: 'Gamma', todolists: [{ id: 301, title: 'Ideas' }] },
  ],
  project_order: ['1', '2', '3'],
  // project 3 deliberately absent -> "No members known for this project"
  people: { '1': [NEP, AVA], '2': [KIM, NEP] },
  cards: [
    {
      id: 501, title: 'Known assignees', project_id: 1, project_name: 'Alpha',
      todolist_id: 101, todolist_name: 'Backlog', column: 'To Do', position: 0,
      due_on: null, assignees: ['Nep Orshiso'],
    },
    {
      id: 502, title: 'Ghost assignee', project_id: 1, project_name: 'Alpha',
      todolist_id: 101, todolist_name: 'Backlog', column: 'To Do', position: 1,
      due_on: null, assignees: ['Nep Orshiso', 'Ghost Person'],
    },
  ],
  trays: {},
});

// jsdom (30.x) does not implement HTMLFormElement's legacy named-property
// getter, so `form.title` / `form.project` — which the page relies on — come
// back undefined. Re-create it for the control names used in the page's own
// form templates, falling back to the real HTMLElement property (e.g. `title`)
// when no matching control exists, exactly as browsers do.
function shimFormNamedAccess() {
  const names = new Set([...script.matchAll(/name="([\w-]+)"/g)].map(m => m[1]));
  for (const name of names) {
    const original =
      Object.getOwnPropertyDescriptor(HTMLElement.prototype, name) ??
      Object.getOwnPropertyDescriptor(Element.prototype, name);
    Object.defineProperty(HTMLFormElement.prototype, name, {
      configurable: true,
      get(this: HTMLFormElement) {
        return this.elements.namedItem(name) ?? (original?.get ? original.get.call(this) : undefined);
      },
      set(this: HTMLFormElement, value: unknown) {
        if (original?.set) original.set.call(this, value);
      },
    });
  }
}

type Posted = { url: string; body: any };
const posts: Posted[] = [];

const jsonRes = (data: unknown) => ({ ok: true, status: 200, json: async () => data });

const fetchMock = vi.fn(async (url: string, opts?: any) => {
  const u = String(url);
  if (u.startsWith('/nanban/api/board')) return jsonRes(boardFixture());
  const body = opts && opts.body ? JSON.parse(opts.body) : null;
  if (body) posts.push({ url: u, body });
  if (u === '/nanban/api/todo') {
    return jsonRes({
      card: {
        id: 900, title: body.title, project_id: body.project_id, project_name: 'Beta',
        todolist_id: body.todolist_id, column: 'To Do', position: null, assignees: [],
      },
    });
  }
  if (u === '/nanban/api/update') {
    // No `assignees` key back, so the local card keeps its fixture assignees.
    return jsonRes({ title: body.title, due_on: body.due_on });
  }
  return jsonRes({});
});

const nb = () => (globalThis as any).__nanban;
const flush = async () => {
  await new Promise(r => setTimeout(r, 0));
  await new Promise(r => setTimeout(r, 0));
};
const bodyFor = (path: string) => posts.filter(p => p.url === path).at(-1)?.body;
const boxNames = (box: Element) => [...box.querySelectorAll('label')].map(l => l.textContent);
const boxChecked = (box: Element) =>
  [...box.querySelectorAll<HTMLInputElement>('input[type=checkbox]')]
    .filter(cb => cb.checked)
    .map(cb => cb.parentElement!.textContent);
const cbFor = (box: Element, name: string) =>
  [...box.querySelectorAll<HTMLInputElement>('input[type=checkbox]')]
    .find(cb => cb.parentElement!.textContent === name)!;

const submitForm = async (form: HTMLFormElement) => {
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await flush();
};

beforeAll(async () => {
  (globalThis as any).fetch = fetchMock;
  shimFormNamedAccess();
  document.body.innerHTML = bodyMarkup;
  // Strict-mode eval keeps its declarations private, so the appended line is the
  // only handle we get on the script's internals.
  (0, eval)(
    script +
      ';globalThis.__nanban = { fillAssigneeBox, checkedAssigneeIds, openModal, openEdit,' +
      ' load, render, get state() { return state; } };',
  );
  await flush(); // let the load() at the bottom of the script settle
});

beforeEach(async () => {
  document.querySelectorAll('.backdrop').forEach(el => el.remove());
  posts.length = 0;
  await nb().load(); // fresh state + fresh card objects per test
  posts.length = 0;
});

describe('nanban board script', () => {
  it('parses as valid JavaScript', () => {
    new vm.Script(script);
  });

  it('boots against the stubbed board endpoint', () => {
    expect(fetchMock).toHaveBeenCalledWith('/nanban/api/board');
    expect(document.getElementById('status')!.style.display).toBe('none');
    expect(document.querySelectorAll('#board .col').length).toBe(3);
    expect(nb().state.cards).toHaveLength(2);
  });

  describe('fillAssigneeBox', () => {
    it('renders one checkbox per project member and pre-checks `current`', () => {
      const box = document.createElement('div');
      nb().fillAssigneeBox(box, 1, ['Ava Stone']);
      expect(boxNames(box)).toEqual(['Nep Orshiso', 'Ava Stone']);
      expect(
        [...box.querySelectorAll<HTMLInputElement>('input')].map(cb => cb.value),
      ).toEqual(['11', '22']);
      expect(boxChecked(box)).toEqual(['Ava Stone']);
      expect(nb().checkedAssigneeIds(box)).toEqual([22]);
    });

    it('checks nothing when `current` is omitted', () => {
      const box = document.createElement('div');
      nb().fillAssigneeBox(box, 2);
      expect(boxNames(box)).toEqual(['Kim Rao', 'Nep Orshiso']);
      expect(boxChecked(box)).toEqual([]);
      expect(nb().checkedAssigneeIds(box)).toEqual([]);
    });

    it('renders the "No members known" note for a project with no people', () => {
      const box = document.createElement('div');
      nb().fillAssigneeBox(box, 3, ['Nep Orshiso']);
      expect(box.querySelectorAll('input')).toHaveLength(0);
      expect(box.querySelector('.none')!.textContent).toBe('No members known for this project');
    });
  });

  describe('add-task modal', () => {
    const openAdd = () => {
      nb().openModal();
      const form = document.querySelector('.backdrop form') as HTMLFormElement;
      return { form, box: form.querySelector('.assignee-box')! };
    };

    it('pre-checks the default assignee for the initially selected project', () => {
      const { box } = openAdd();
      expect(boxNames(box)).toEqual(['Nep Orshiso', 'Ava Stone']);
      expect(boxChecked(box)).toEqual(['Nep Orshiso']);
    });

    it('re-applies the default assignee when the project changes', () => {
      const { form, box } = openAdd();
      const projSel = form.elements.namedItem('project') as HTMLSelectElement;
      projSel.value = '2';
      projSel.dispatchEvent(new window.Event('change'));
      expect(boxNames(box)).toEqual(['Kim Rao', 'Nep Orshiso']);
      expect(boxChecked(box)).toEqual(['Nep Orshiso']);
      // the to-do list select follows the project too
      const listSel = form.elements.namedItem('todolist') as HTMLSelectElement;
      expect([...listSel.options].map(o => o.text)).toEqual(['Inbox']);
    });

    it('posts the checked assignee ids on submit', async () => {
      const { form, box } = openAdd();
      const projSel = form.elements.namedItem('project') as HTMLSelectElement;
      projSel.value = '2';
      projSel.dispatchEvent(new window.Event('change'));
      cbFor(box, 'Kim Rao').click();
      (form.elements.namedItem('title') as HTMLInputElement).value = '  Ship it  ';
      await submitForm(form);

      const body = bodyFor('/nanban/api/todo');
      expect(body).toMatchObject({
        project_id: 2,
        todolist_id: 201,
        title: 'Ship it',
        assignee_ids: [33, 11],
      });
      expect(document.querySelector('.backdrop')).toBeNull(); // modal closed on success
      expect(nb().state.cards.some((c: any) => c.id === 900)).toBe(true);
    });

    it('posts an empty assignee list when the default is unchecked', async () => {
      const { form, box } = openAdd();
      cbFor(box, 'Nep Orshiso').click();
      (form.elements.namedItem('title') as HTMLInputElement).value = 'Unassigned task';
      await submitForm(form);
      expect(bodyFor('/nanban/api/todo').assignee_ids).toEqual([]);
    });
  });

  describe('edit modal — every assignee is in the member list', () => {
    const openEditFor = (id: number) => {
      const card = nb().state.cards.find((c: any) => c.id === id);
      nb().openEdit(card, null, null);
      const form = document.querySelector('.backdrop form') as HTMLFormElement;
      return { card, form, box: form.querySelector('.assignee-box')! };
    };

    it('pre-checks the card assignees and shows no warning note', () => {
      const { box } = openEditFor(501);
      expect(boxChecked(box)).toEqual(['Nep Orshiso']);
      expect(box.querySelector('.none')).toBeNull();
    });

    it('sends the full checked set after ticking another member', async () => {
      const { form, box } = openEditFor(501);
      cbFor(box, 'Ava Stone').click();
      await submitForm(form);
      const body = bodyFor('/nanban/api/update');
      expect(body).toMatchObject({ todo_id: 501, project_id: 1, title: 'Known assignees' });
      expect(body.assignee_ids).toEqual([11, 22]);
    });

    it('sends an empty array when every box is unchecked', async () => {
      const { form, box } = openEditFor(501);
      cbFor(box, 'Nep Orshiso').click();
      await submitForm(form);
      expect(bodyFor('/nanban/api/update').assignee_ids).toEqual([]);
    });

    it('sends the unchanged checked set when nothing is touched', async () => {
      const { form } = openEditFor(501);
      await submitForm(form);
      const body = bodyFor('/nanban/api/update');
      expect(body).toHaveProperty('assignee_ids');
      expect(body.assignee_ids).toEqual([11]);
    });
  });

  describe('edit modal — an assignee is missing from the member list', () => {
    const openGhost = () => {
      const card = nb().state.cards.find((c: any) => c.id === 502);
      nb().openEdit(card, null, null);
      const form = document.querySelector('.backdrop form') as HTMLFormElement;
      return { card, form, box: form.querySelector('.assignee-box')! };
    };

    it('warns about the unrepresented assignee', () => {
      const { box } = openGhost();
      expect(boxNames(box)).toEqual(['Nep Orshiso', 'Ava Stone']);
      expect(boxChecked(box)).toEqual(['Nep Orshiso']);
      expect(box.querySelector('.none')!.textContent).toBe(
        '⚠ Not in member list (kept unless boxes change): Ghost Person',
      );
    });

    it('omits assignee_ids entirely when no checkbox was touched', async () => {
      const { form } = openGhost();
      await submitForm(form);
      const body = bodyFor('/nanban/api/update');
      expect(body).toMatchObject({ todo_id: 502, project_id: 1 });
      expect('assignee_ids' in body).toBe(false);
    });

    it('sends the checked set once a checkbox is touched', async () => {
      const { form, box } = openGhost();
      cbFor(box, 'Ava Stone').click();
      await submitForm(form);
      const body = bodyFor('/nanban/api/update');
      expect(body).toHaveProperty('assignee_ids');
      expect(body.assignee_ids).toEqual([11, 22]);
    });

    it('sends an empty array when the represented assignee is unchecked', async () => {
      const { form, box } = openGhost();
      cbFor(box, 'Nep Orshiso').click();
      await submitForm(form);
      expect(bodyFor('/nanban/api/update').assignee_ids).toEqual([]);
    });
  });
});
