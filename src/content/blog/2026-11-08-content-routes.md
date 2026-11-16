---
title: Neva is the best
slug: content-routes-in-analogjs
description: How markdown files become routes and how to list and render them.
coverImage: https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200
publishedAt: 2026-11-08
tags:
  - analogjs
  - content
  - markdown
draft: false
---

AnalogJS turns files in `src/content` into content you can query at build time.

## Listing posts

```ts
const posts = injectContentFiles<PostAttributes>((file) =>
  file.filename.includes('/src/content/blog/'),
);
```

## Rendering one post

```ts
const post$ = injectContent<PostAttributes>();
```

```html
<analog-markdown [content]="post.content" />
```

Frontmatter attributes become typed `attributes` on each content file.
