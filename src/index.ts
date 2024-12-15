import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";

const app = new Hono();

app.use(
  "/api/*",
  basicAuth({
    username: "keke",
    password: "you-dont-know",
  })
);
app.get("/api", (c) => c.text("Hello Hono!"));

export default app;
