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
let commentPostFails = false;
let movePostFails = false;

const jsonRes = (data: unknown) => ({ ok: true, status: 200, json: async () => data });

const fetchMock = vi.fn(async (url: string, opts?: any) => {
  const u = String(url);
  if (u.startsWith('/nanban/api/board')) return jsonRes(boardFixture());
  if (u.startsWith('/nanban/api/card')) {
    return jsonRes({
      id: 501,
      title: 'Known assignees',
      description: '',
      url: null,
      comments: [{ author: 'Ava Stone', created_at: '2026-09-01T10:00:00Z', content: 'looks good' }],
      completed: false,
    });
  }
  const body = opts && opts.body ? JSON.parse(opts.body) : null;
  if (body) posts.push({ url: u, body });
  if (u === '/nanban/api/move' && movePostFails) throw new Error('network down');
  if (u === '/nanban/api/comment') {
    if (commentPostFails) throw new Error('network down');
    return jsonRes({
      ok: true,
      comment: { author: 'Nep Orshiso', created_at: '2026-09-03T12:00:00Z', content: 'ship it' },
    });
  }
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

// Dispatch a realistic tap: the pointer pair a browser always sends before a click.
const tap = (el: Element, x = 0, y = 0) => {
  for (const type of ['pointerdown', 'pointerup']) {
    const ev: any = new window.Event(type, { bubbles: true, cancelable: true });
    ev.clientX = x; ev.clientY = y; ev.pointerId = 1; ev.pointerType = 'touch';
    el.dispatchEvent(ev);
  }
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
};

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
      ' load, render, dropTargetAt, autoScrollDx, LONG_PRESS_MS,' +
      ' get state() { return state; } };',
  );
  await flush(); // let the load() at the bottom of the script settle
});

beforeEach(async () => {
  document.querySelectorAll('.backdrop').forEach(el => el.remove());
  document.querySelectorAll('.toast').forEach(el => el.remove());
  posts.length = 0;
  commentPostFails = false;
  movePostFails = false;
  document.querySelectorAll('.drag-ghost').forEach(el => el.remove());
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

    it('defaults the project select to Household Operations even when it is not first', async () => {
      const originalFetch = globalThis.fetch;
      (globalThis as any).fetch = vi.fn(async (url: string) =>
        String(url).startsWith('/nanban/api/board')
          ? jsonRes({
              ...boardFixture(),
              projects: [
                { id: 1, name: 'Alpha', todolists: [{ id: 101, title: 'Backlog' }] },
                { id: 2, name: 'Household Operations', todolists: [{ id: 201, title: 'Inbox' }] },
              ],
              project_order: ['1', '2'],
            })
          : jsonRes({}),
      );
      try {
        await nb().load();
        const { form } = openAdd();
        expect((form.elements.namedItem('project') as HTMLSelectElement).value).toBe('2');
      } finally {
        (globalThis as any).fetch = originalFetch;
      }
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

  // ---- NANBAN-005: touch drag ----
  // jsdom has PointerEvent but no elementFromPoint and no layout engine, so the
  // geometry decisions live in pure functions that take rects as arguments. Those
  // get exhaustive coverage here; the gesture tests then drive the real handlers
  // with stubbed rects.
  const rect = (left: number, top: number, width = 100, height = 40) =>
    ({ left, top, right: left + width, bottom: top + height, width, height,
       x: left, y: top, toJSON: () => ({}) }) as DOMRect;

  describe('dropTargetAt', () => {
    // Three 100px lanes at x=0/110/220 — the board's flex columns plus gutters.
    const lanes = () => [
      { col: 'To Do', rect: rect(0, 0, 100, 500), cards: [
        { id: '1', rect: rect(0, 50) }, { id: '2', rect: rect(0, 90) }, { id: '3', rect: rect(0, 130) },
      ] },
      { col: 'Doing', rect: rect(110, 0, 100, 500), cards: [] },
      { col: 'Done', rect: rect(220, 0, 100, 500), cards: [{ id: '9', rect: rect(220, 50) }] },
    ];

    it('picks the lane the point is inside', () => {
      expect(nb().dropTargetAt({ x: 150, y: 10 }, lanes(), '1').col).toBe('Doing');
      expect(nb().dropTargetAt({ x: 250, y: 10 }, lanes(), '1').col).toBe('Done');
    });

    it('snaps a point in a gutter to the nearest lane', () => {
      expect(nb().dropTargetAt({ x: 103, y: 10 }, lanes(), '1').col).toBe('To Do');
      expect(nb().dropTargetAt({ x: 107, y: 10 }, lanes(), '1').col).toBe('Doing');
      expect(nb().dropTargetAt({ x: 218, y: 10 }, lanes(), '1').col).toBe('Done');
    });

    it('snaps to the nearest lane past either end of the board', () => {
      expect(nb().dropTargetAt({ x: -80, y: 10 }, lanes(), '1').col).toBe('To Do');
      expect(nb().dropTargetAt({ x: 900, y: 10 }, lanes(), '1').col).toBe('Done');
    });

    it('inserts above the first card, between midpoints, and after the last', () => {
      // cards span y 50-90, 90-130, 130-170 -> midpoints 70, 110, 150
      expect(nb().dropTargetAt({ x: 50, y: 60 }, lanes(), 'none').index).toBe(0);
      expect(nb().dropTargetAt({ x: 50, y: 100 }, lanes(), 'none').index).toBe(1);
      expect(nb().dropTargetAt({ x: 50, y: 140 }, lanes(), 'none').index).toBe(2);
      expect(nb().dropTargetAt({ x: 50, y: 400 }, lanes(), 'none').index).toBe(3);
    });

    it('excludes the dragged card from the index, so a same-column drag does not drift', () => {
      // Dragging card 1 leaves [2 (90-130), 3 (130-170)], midpoints 110 and 150.
      // y=100 sits above the first remaining midpoint -> index 0, not 1.
      expect(nb().dropTargetAt({ x: 50, y: 100 }, lanes(), '1').index).toBe(0);
      expect(nb().dropTargetAt({ x: 50, y: 140 }, lanes(), '1').index).toBe(1);
      expect(nb().dropTargetAt({ x: 50, y: 400 }, lanes(), '1').index).toBe(2);
    });

    it('returns index 0 for an empty lane', () => {
      expect(nb().dropTargetAt({ x: 150, y: 300 }, lanes(), '1')).toEqual({ col: 'Doing', index: 0 });
    });

    it('returns null when there are no lanes at all', () => {
      expect(nb().dropTargetAt({ x: 10, y: 10 }, [], '1')).toBeNull();
    });
  });

  describe('autoScrollDx', () => {
    const board = rect(0, 0, 330, 500);

    it('does not scroll away from the edges', () => {
      expect(nb().autoScrollDx(165, board, 56, 18)).toBe(0);
      expect(nb().autoScrollDx(100, board, 56, 18)).toBe(0);
    });

    it('scrolls left near the left edge and right near the right edge', () => {
      expect(nb().autoScrollDx(10, board, 56, 18)).toBeLessThan(0);
      expect(nb().autoScrollDx(320, board, 56, 18)).toBeGreaterThan(0);
    });

    it('ramps with edge proximity', () => {
      const near = Math.abs(nb().autoScrollDx(5, board, 56, 18));
      const far = Math.abs(nb().autoScrollDx(50, board, 56, 18));
      expect(near).toBeGreaterThan(far);
    });

    it('clamps at max, even past the edge', () => {
      expect(nb().autoScrollDx(0, board, 56, 18)).toBe(-18);
      expect(nb().autoScrollDx(-200, board, 56, 18)).toBe(-18);
      expect(nb().autoScrollDx(999, board, 56, 18)).toBe(18);
    });
  });

  describe('touch drag gesture', () => {
    const LANE_W = 100, LANE_PITCH = 110;
    // Give the board deterministic geometry: lanes at x=0/110/220, cards 40px tall from y=50.
    const stubRects = () => {
      const board = document.getElementById('board')!;
      board.getBoundingClientRect = () => rect(0, 0, 330, 500);
      [...document.querySelectorAll<HTMLElement>('.lane')].forEach((lane, i) => {
        const left = i * LANE_PITCH;
        lane.getBoundingClientRect = () => rect(left, 0, LANE_W, 500);
        [...lane.querySelectorAll<HTMLElement>('.card')].forEach((card, j) => {
          card.getBoundingClientRect = () => rect(left, 50 + j * 40, LANE_W, 40);
        });
      });
    };
    const board = () => document.getElementById('board')!;
    const cardFor = (id: string) => document.querySelector(`.card[data-id="${id}"]`)!;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const pointer = (type: string, target: Element, x: number, y: number, pointerType = 'touch') => {
      const ev: any = new window.Event(type, { bubbles: true, cancelable: true });
      ev.clientX = x; ev.clientY = y; ev.pointerId = 1; ev.pointerType = pointerType;
      target.dispatchEvent(ev);
    };
    const lift = async (id: string, x: number, y: number) => {
      pointer('pointerdown', cardFor(id), x, y);
      await sleep(nb().LONG_PRESS_MS + 40);
    };
    const moves = () => posts.filter(p => p.url === '/nanban/api/move');

    it('moves a card to another column', async () => {
      stubRects();
      await lift('501', 50, 60);
      expect(document.querySelector('.drag-ghost')).not.toBeNull();
      expect(document.querySelector('.card.lifted')).not.toBeNull();

      pointer('pointermove', board(), 150, 60);
      pointer('pointerup', board(), 150, 60);
      await flush();

      expect(bodyFor('/nanban/api/move')).toMatchObject({
        todo_id: 501, project_id: 1, column: 'Doing', position: 0,
      });
      expect(document.querySelector('.card[data-id="501"]')!.closest('.col')!.getAttribute('data-col'))
        .toBe('Doing');
      expect(document.querySelector('.drag-ghost')).toBeNull();
      expect(document.querySelector('.card.lifted')).toBeNull();
    });

    it('reorders within the same column', async () => {
      stubRects();
      // 501 (y50-90) and 502 (y90-130) both in To Do. Excluding 501, 502's
      // midpoint is 110 — dropping at y=120 puts 501 after it.
      await lift('501', 50, 60);
      pointer('pointermove', board(), 50, 120);
      pointer('pointerup', board(), 50, 120);
      await flush();

      expect(bodyFor('/nanban/api/move')).toMatchObject({
        todo_id: 501, column: 'To Do', position: 1,
      });
    });

    it('opens the detail modal when released before the long press', async () => {
      stubRects();
      pointer('pointerdown', cardFor('501'), 50, 60);
      await sleep(60);
      pointer('pointerup', cardFor('501'), 50, 60);
      cardFor('501').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await flush();

      expect(document.querySelector('.backdrop')).not.toBeNull();
      expect(moves()).toHaveLength(0);
      expect(document.querySelector('.drag-ghost')).toBeNull();
    });

    it('does not open the detail modal after a real drag', async () => {
      stubRects();
      await lift('501', 50, 60);
      pointer('pointermove', board(), 150, 60);
      pointer('pointerup', board(), 150, 60);
      board().dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await flush();

      expect(document.querySelector('.backdrop')).toBeNull();
    });

    it('lets a scroll through when the finger moves before the long press', async () => {
      stubRects();
      pointer('pointerdown', cardFor('501'), 50, 60);
      pointer('pointermove', cardFor('501'), 50, 110); // 50px — a scroll, not a lift
      await sleep(nb().LONG_PRESS_MS + 40);

      expect(document.querySelector('.drag-ghost')).toBeNull();
      pointer('pointerup', board(), 50, 110);
      await flush();
      expect(moves()).toHaveLength(0);
    });

    it('aborts cleanly on pointercancel', async () => {
      stubRects();
      await lift('501', 50, 60);
      pointer('pointermove', board(), 150, 60);
      pointer('pointercancel', board(), 150, 60);
      await flush();

      expect(moves()).toHaveLength(0);
      expect(document.querySelector('.drag-ghost')).toBeNull();
      expect(document.querySelector('.card.lifted')).toBeNull();
      expect(document.querySelector('.drop-line')).toBeNull();
    });

    it('never starts a touch drag from a mouse pointer', async () => {
      stubRects();
      pointer('pointerdown', cardFor('501'), 50, 60, 'mouse');
      await sleep(nb().LONG_PRESS_MS + 40);

      expect(document.querySelector('.drag-ghost')).toBeNull();
      expect(moves()).toHaveLength(0);
    });

    it('rolls back and toasts when the move fails', async () => {
      stubRects();
      movePostFails = true;
      await lift('501', 50, 60);
      pointer('pointermove', board(), 150, 60);
      pointer('pointerup', board(), 150, 60);
      await flush();

      expect([...document.querySelectorAll('.toast')].at(-1)!.textContent).toContain('Move failed');
      const live = nb().state.cards.find((c: any) => String(c.id) === '501');
      expect(live.column).toBe('To Do');
    });
  });

  describe('detail modal comments', () => {
    const openDetailFor501 = async () => {
      const card = document.querySelector('.card[data-id="501"]')!;
      // A real tap is pointerdown -> pointerup -> click. The board now listens to
      // pointer events, so dispatching a bare click is no longer faithful: the
      // pointerdown is what tells the page a fresh gesture has started.
      tap(card);
      await flush();
      return document.querySelector('.backdrop')!;
    };

    it('posts and renders a new comment, updates the count, and clears the textarea', async () => {
      const modal = await openDetailFor501();
      const ta = modal.querySelector('.comment-input') as HTMLTextAreaElement;
      ta.value = 'ship it';
      (modal.querySelector('.comment-btn') as HTMLButtonElement).click();
      await flush();

      expect(bodyFor('/nanban/api/comment')).toEqual({ project_id: 1, todo_id: 501, content: 'ship it' });
      expect(modal.querySelectorAll('.comment')).toHaveLength(2);
      expect(modal.querySelector('h3')!.textContent).toBe('Comments (2)');
      // The body is re-rendered after posting, so re-query the (fresh) textarea.
      expect((modal.querySelector('.comment-input') as HTMLTextAreaElement).value).toBe('');
    });

    it('does not post empty or whitespace-only text', async () => {
      const modal = await openDetailFor501();
      const ta = modal.querySelector('.comment-input') as HTMLTextAreaElement;
      ta.value = '   \n  ';
      (modal.querySelector('.comment-btn') as HTMLButtonElement).click();
      await flush();

      expect(posts.filter(p => p.url === '/nanban/api/comment')).toHaveLength(0);
    });

    it('toasts on failure and re-enables the button', async () => {
      commentPostFails = true;
      const modal = await openDetailFor501();
      const ta = modal.querySelector('.comment-input') as HTMLTextAreaElement;
      const button = modal.querySelector('.comment-btn') as HTMLButtonElement;
      ta.value = 'ship it';
      button.click();
      await flush();

      expect([...document.querySelectorAll('.toast')].at(-1)!.textContent).toContain('Comment failed');
      expect(button.disabled).toBe(false);
    });
  });
});
