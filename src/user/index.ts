import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.post("/create", validator('json', async (value, c) => {
  if (!value.email || !value.password || !value.opt) {
    return c.json({ message: "Failed to create user" }, 403);
  }
  return value;
}), async (c) => {
  const body = await c.req.json<{
    email: string;
    password: string;
    opt: string;
  }>();
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  try {
    const { email, password, opt } = body;
    const result = await prisma.user.create({
      data: {
        email: email || "example@example.com", // temporary email
        password,
        opt,
        updatedAt: new Date().toISOString(),
      },
    });
    return c.json({ result });
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

// update user info
app.post("/update", validator('json', async (value, c) => {
  if (!value.id) {
    return c.json({ message: "Failed to update user" }, 403);
  }
  return value;
}), async (c) => {
  const body = await c.req.json<{
    id: number;
    email?: string;
    password?: string;
    opt?: string;
  }>();
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  try {
    const { id, email, password, opt } = body;
    const data = {
      updatedAt: new Date().toISOString(),
    } as any;
    if (email) {
      data.email = email;
    }
    if (password) {
      data.password = password;
    }
    if (opt) {
      data.opt = opt;
    }
    const result = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return c.json({ result });
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

app.post("/delete", validator('json', async (value, c) => {
  if (!value.id) {
    return c.json({ message: "Failed to delete user" }, 403);
  }
  return value;
}), async (c) => {
  const body = await c.req.json<{ id: number }>();
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  try {
    const { id } = body;
    const result = await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: "deleted",
        updatedAt: new Date().toISOString(),
      },
    });
    return c.json({ result });
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

export default app;
