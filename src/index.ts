import { Hono } from "hono";
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'

// import { basicAuth } from "hono/basic-auth";
import { Bindings } from "./bindings";
import kanjiRoute from "./kanji";
import grammarRoute from "./grammar";
import userRoute from "./user";

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
app.route("/api/grammar", grammarRoute);
app.route("/api/user", userRoute);

app.get("/kv/test", async (c) => {
  // testing kv
  const v = await c.env.QUIZ_KV.get("keke");
  console.log(v);

  return c.text("Hello World!");
});


app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  if (error instanceof Error) {
    return c.json({ message: error.message, stack: error.stack }, 500);
  }
  return c.json({ message: "Internal Server Error" }, 500);
});

export default app;
