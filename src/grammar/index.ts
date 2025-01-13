import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings }>();

type TGrammarType = "n5" | "n4" | "n3" | "n2" | "n1" | "n0";

app.get("/fav/check/:grammar", async (c) => {
  const key = c.req.param("grammar");
  const level = c.req.query("key") as TGrammarType;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.grammar_fav.findFirst({
    where: {
      key,
      level
    }
  });
  return c.json({ result: result || {} });
});

app.post("/fav/update", async (c) => {
  const body = await c.req.json<{
    key: string;
    id?: number;
    level: TGrammarType;
    meaning?: string;
    example?: string;
  }>();
  const { id, key, level, meaning = "", example = "" } = body;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const where = id ? { id } : { key, level };
  const data = {
    key,
    meaning,
    example,
    level
  };

  const fav = await prisma.grammar_fav.findFirst({
    where
  });

  try {
    if (fav?.id) {
      const result = await prisma.grammar_fav.delete({
        where: {
          id: fav.id
        }
      });
      return c.json({ result });
    } else {
      const result = await prisma.grammar_fav.create({
        data
      });
      return c.json({ result });
    }
  } catch (error) {
    let err = error;
    let stack = "";
    if (error instanceof Error) {
      err = error.message;
      stack = error.stack || "";
    }

    return c.json({ message: err, stack }, 500);
  }
});

app.post(
  "/fav/page",
  validator("json", async (value, c) => {
    if (value.pn < 1) {
      return c.json({ message: "pn must be greater than 0" }, 400);
    } else if (value.ps < 1 || value.ps > 50) {
      return c.json({ message: "invalid ps" }, 400);
    }
    return value;
  }),
  async (c) => {
    const body = await c.req.json<{
      pn: number;
      ps: number;
    }>();
    const { pn, ps } = body;
    const adapter = new PrismaD1(c.env.DB);
    const prisma = new PrismaClient({ adapter });
    const total = await prisma.grammar_fav.count();
    const list = await prisma.grammar_fav.findMany({
      skip: (pn - 1) * ps,
      take: ps
    });
    const result = {
      total,
      list
    };
    return c.json({ result });
  }
);

app.post("/fav/list", async (c) => {
  const body = await c.req.json<{ list: string[]; level: TGrammarType }>();
  const { list, level } = body;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.grammar_fav.findMany({
    where: {
      key: {
        in: list
      },
      level
    }
  });
  return c.json({ result });
});

export default app;
