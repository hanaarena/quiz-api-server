import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.kanji_fav.findMany();
  const result = JSON.stringify(users);
  return new Response(result);
});

export default app;
