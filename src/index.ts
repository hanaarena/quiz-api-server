import { Hono } from "hono";
import { cors } from 'hono/cors'
// import { basicAuth } from "hono/basic-auth";
import { Bindings } from "./bindings";
import kanjiRoute from "./kanji";

const app = new Hono<{ Bindings: Bindings }>();
app.use('/api/*', cors())

// todo: add request refer check
// app.use(
//   "/api/*",
//   basicAuth({
//     username: "keke",
//     password: "you-dont-know",
//   })
// );

app.route("/api/kanji", kanjiRoute);

app.get("/kv/test", async (c) => {
  // testing kv
  const v = await c.env.QUIZ_KV.get("keke");
  console.log(v);

  return c.text("Hello World!");
});

export default app;
