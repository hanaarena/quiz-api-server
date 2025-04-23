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

## Execute sql locally

```bash
npx wrangler d1 execute quiz-kanji --local --file ./sql/list.sql
```

**NOTE**: 查询prod数据时，把`--local`参数换成`--remote`

更多命令: https://developers.cloudflare.com/workers/wrangler/commands/#d1-execute

## 如何添加表/修改表

1. 在`prisma/schema.prisma`文件中添加或修改表

2. 运行`npx wrangler d1 migrations create quiz-kanji {这里填本次操作的名字比如modify_kanji_fav_type}`。在**migrations**目录下会生成sql文件。

    2.1. Prisma Migrate暂不直接支持D1: https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm/#4-create-a-table-in-the-database

3. 调用Prisma Migrate生成SQL。将SQL写入上步生成的文件中，注意需跟本地文件名对应上。

    3.1. 添加新表`npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/{generated_sql_file_from_previous_step.sql}`。注意由于是`from-empty` 所以会全量生成表，目前需要手动移除重复的部分。

      3.1.1 理想的结果应该只生成新增表结构：
      ```bash
      npx prisma migrate diff \
        --from-schema-datasource prisma/schema.prisma \
        --to-schema-datamodel prisma/schema.prisma \
        --script --output migrations/xxxx_modify_kanji_fav_type.sql
      ```
      但目前执行会报错找不到`dev.db`文件。猜测跟本地 D1 维护自己的sqlite有关系。

    3.2. 如果是修改表操作时（非首次migrate）：`npx prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/xxxx_modify_kanji_fav_type.sql`。即用**--from-local-d1**

    3.3. 参数解释：https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1#migration-workflows

    3.4 当然，也可以自行修改生成后的文件

4. 同步数据库
    
    4.1. sync local db: `npx wrangler d1 migrations apply quiz-kanji --local`

    4.2. sync remote (D1) db: `npx wrangler d1 migrations apply quiz-kanji --remote`

5. 生成Prisma SQL类型定义
    5.1. `npx prisma generate`

## Usage

### Local development

```bash
pnpm run dev
```

### Initiate database
**⚠️NOTE⚠️**

- 如果第一次运行本项目，请先运行:

```bash
npx prisma generate
```

### Add your own Gemini API key

For local development, add `.dev.vars` file in the root folder, the file content should be:

```text
GEMINI_API_KEY="Your_own_gemini_api_key_here"
```

Before deploy to production (Cloudflare Worker), add the key to the Worker's [Secret and Environment](https://developers.cloudflare.com/workers/configuration/secrets/):

(Using terminal)

```bash
npx wrangler secret put GEMINI_API_KEY

# enter you secret
```

## Deploy

```bash
pnpm run cf-deploy
```

### Use Docker

```bash
docker pull zlnaz/quiz-server:latest
# Persist KV and D1 data
docker run -d -p 8787:8787 -v quiz-server-data:/app/.wrangler/state zlnaz/quiz-server:latest
```

## Route list

### /api/kanji

`src/kanji/index.ts`

- GET /api/kanji/fav/check/:kanji - check whether a kanji is a favorite kanji
- POST /api/kanji/fav/update - update a kanji's favorite status
- POST /api/kanji/fav/list - check multiple kanji's favorite status
- POST /api/kanji/fav/page - get pagination kanji list

### /api/grammar

`src/grammar/index.ts`

- GET /api/grammar/fav/check/:grammar
- POST /api/grammar/fav/update - update a grammar's favorite status
- POST /api/grammar/fav/page - get pagination grammar list

### /api/user

`src/user/index.ts`

- POST /api/user/create
- POST /api/user/update
- POST /api/user/delete

### /api/opt

Used for generate once time invitation code.

`src/opt/index.ts`

- POST /api/opt/generate
- POST /api/opt/used

### /api/quiz/gemini

Used to generate quiz questions of a specified type.

`src/quiz/gemini.ts`

- POST /api/quiz/gemini/questions
