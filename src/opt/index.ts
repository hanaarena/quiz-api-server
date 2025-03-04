import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";

import { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

function generateUniqueRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  // Append timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36); // Convert to base-36 for shorter representation
  result += timestamp;

  // Add random characters to reach the desired length
  for (let i = 0; i < length - timestamp.length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

app.post("/generate", async (c) => {
  const randomString = generateUniqueRandomString(6);
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });

  await prisma.opt.create({
    data: {
      code: randomString,
      expiredAt: new Date("2099-12-31").toISOString()
    }
  });

  return c.json({ data: { code: randomString } });
});

app.post("/used", async (c) => {
  const body = await c.req.json<{ code: string }>();
  const { code } = body;
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  await prisma.opt.update({
    where: {
      code
    },
    data: {
      used: true
    }
  });
});

export default app;
