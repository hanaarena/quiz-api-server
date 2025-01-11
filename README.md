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

`quiz-server worker dashboard`

- https://dash.cloudflare.com/302b93166fe16ad2af4e382b46879cb9/workers/services/view/jlpt-easy-server/production

⭐️`Prisma schema model field type`

- https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-field-scalar-types

`查询数据`

```bash
npx wrangler d1 execute quiz-kanji --local --file ./sql/list.sql
```

**NOTE**: 查询prod数据时，把`--local`参数换成`--remote`

更多命令: https://developers.cloudflare.com/workers/wrangler/commands/#d1-execute

## 如何添加表/修改表

1. 在`prisma/schema.prisma`文件中添加或修改表

2. 运行`npx wrangler d1 migrations create quiz-kanji {这里填本次操作的名字比如-modify_kanji_fav_type}`。在**migrations**目录下会生成sql文件。

    2.1. Prisma Migrate暂不直接支持D1: https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/#4-create-a-table-in-the-database

3. 调用Prisma Migrate生成SQL。将SQL写入上步生成的文件中，注意文件名需对应上。

    3.1. `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/xxxx_modify_kanji_fav_type.sql`。注意如果是首次生成表时，这里用**--from-empty**

    3.2. 如果时修改操作时（非首次migrate）：`npx prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/xxxx_modify_kanji_fav_type.sql`。即用**--from-local-d1**

    3.3. 参数解释：https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1#migration-workflows

4. 同步数据库
    
    4.1. sync local db: `npx wrangler d1 migrations apply quiz-kanji --local`

    4.2. sync local db: `npx wrangler d1 migrations apply quiz-kanji --remote`

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
- POST /api/kanji/fav/list - check multiple kanji's favorite status
- POST /api/kanji/fav/page - get pagination kanji list