# JLPT quiz server

a quiz server used Cloudflare workers D1

## 文档 & links

`Cloudflare worker`

- https://developers.cloudflare.com/workers/

`D1`

- https://developers.cloudflare.com/d1/

`D1 integrate with Prisma`

- https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/

`D1 dashboard`

- https://dash.cloudflare.com/302b93166fe16ad2af4e382b46879cb9/workers/d1/databases/920e869b-8e9f-4604-80cc-c57b30bb3817

`quiz server worker dashboard`

- https://dash.cloudflare.com/302b93166fe16ad2af4e382b46879cb9/workers/services/view/jlpt-easy-server/production

## Usage

```bash
pnpm run dev
```

**⚠️NOTE⚠️**

- 如果第一次运行本项目，请先运行:

```bash
npx prisma generate
```

## Deploy

```bash
pnpm run cf-deploy
```

## Route list

### /api/kanji

src/kanji/index.ts

- GET /api/kanji/fav/check/:kanji - check whether a kanji is a favorite kanji
- POST /api/kanji/fav/update - update a kanji's favorite status