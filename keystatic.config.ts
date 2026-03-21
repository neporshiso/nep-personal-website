// keystatic.config.ts
// Schema must stay in sync with keystatic.config.ts / src/content.config.ts
// Source: https://keystatic.com/docs/installation-astro + https://keystatic.com/docs/collections
import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.markdoc({ label: 'Description' }),
        techStack: fields.array(
          fields.text({ label: 'Technology' }),
          { label: 'Tech Stack', itemLabel: (props) => props.fields.value.value }
        ),
        media: fields.url({ label: 'Media URL (S3)', validation: { isRequired: false } }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.url({ label: 'URL' }),
          }),
          { label: 'Links', itemLabel: (props) => props.fields.label.value }
        ),
        year: fields.integer({ label: 'Year' }),
      },
    }),

    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        body: fields.markdoc({ label: 'Body' }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: (props) => props.fields.value.value }
        ),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'src/assets/images/posts',
          publicPath: '@assets/images/posts/',
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: true }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        publishedDate: fields.date({ label: 'Published Date' }),
      },
    }),

    podcasts: collection({
      label: 'Podcasts',
      slugField: 'name',
      path: 'src/content/podcasts/*',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        link: fields.url({ label: 'Link' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'src/assets/images/podcasts',
          publicPath: '@assets/images/podcasts/',
        }),
        category: fields.text({ label: 'Category' }),
      },
    }),

    books: collection({
      label: 'Books',
      slugField: 'title',
      path: 'src/content/books/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        author: fields.text({ label: 'Author' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'src/assets/images/books',
          publicPath: '@assets/images/books/',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Read', value: 'read' },
            { label: 'Want to Read', value: 'want-to-read' },
          ],
          defaultValue: 'want-to-read',
        }),
        note: fields.text({ label: 'Note', multiline: true }),
      },
    }),
  },

  singletons: {
    bio: singleton({
      label: 'Bio',
      path: 'src/content/bio',
      format: { contentField: 'body' },
      schema: {
        body: fields.markdoc({ label: 'Bio Content' }),
      },
    }),
  },
});
