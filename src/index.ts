import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/api/*",
  basicAuth({
    username: "keke",
    password: "you-dont-know",
  })
);
app.get("/api", async (c) => {
  // testing kv
  const v = await c.env.QUIZ_KV.get("keke");
  console.log(v);

  return c.text("Hello World!");
});

export default app;
