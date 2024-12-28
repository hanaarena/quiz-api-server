import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/fav/check/:kanji", async (c) => {
  const kanji = c.req.param("kanji");
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.kanji_fav.findFirst({
    where: {
      kanji,
    },
  });
  return c.json({ result: result || {} });
});

app.post("/fav/list", async (c) => {
  const body = await c.req.json<{ list: string[] }>();
  const { list } = body;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.kanji_fav.findMany({
    where: {
      kanji: {
        in: list,
      },
    },
  });
  return c.json({ result });
});

app.post("/fav/update", async (c) => {
  const body = await c.req.json<{
    kanji: string;
    hirakana: string;
    id?: number;
    type: string;
  }>();
  const { kanji, id, hirakana, type } = body;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const where = id ? { id } : { kanji };
  const data = {
    kanji,
    hirakana,
    type,
    updatedAt: new Date().toISOString(),
  };

  const fav = await prisma.kanji_fav.findFirst({
    where,
  });

  try {
    if (fav?.id) {
      // when record exist
      await prisma.kanji_fav.delete({
        where,
      });
      return c.json({ result: fav });
    } else {
      const result = await prisma.kanji_fav.create({
        data,
      });
      return c.json({ result });
    }
  } catch (error) {
    let err = error;
    let stack = '';
    if (error instanceof Error) {
      err = error.message
      stack = error.stack || ''
    }

    return c.json({ message: err, stack }, 500);
  }
});

export default app;
