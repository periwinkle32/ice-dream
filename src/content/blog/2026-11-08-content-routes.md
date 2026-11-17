---
title: Herzlich willkommen bei ice dream
slug: content-routes-in-analogjs
description: Hier werden wir jeden mittwoch sachen posten!
coverImage: /ice-dream/images/uploads/schlittschuhe.jpg
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
