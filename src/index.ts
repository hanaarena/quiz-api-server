import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { Bindings } from "./bindings";
import kanjiRoute from "./kanji";
import grammarRoute from "./grammar";
import userRoute from "./user";
import optRoute from "./opt";
import quizRoute from "./quiz";
import { modifyBodyMiddleware } from "./middlewares/res";

const app = new Hono<{ Bindings: Bindings }>();

// middlewares
app.use("/api/*", cors());
app.use("/api/*", modifyBodyMiddleware);

app.route("/api/kanji", kanjiRoute);
app.route("/api/grammar", grammarRoute);
app.route("/api/user", userRoute);
app.route("/api/opt", optRoute);
app.route("/api/quiz", quizRoute);

app.get("/kv/test", async (c) => {
  const v = await c.env.QUIZ_KV.get("keke");
  console.log(v);

  return c.text("Hello World!");
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  if (error instanceof Error) {
    return c.json({ message: error.message, stack: error.stack }, 500);
  }
  return c.json({ message: "Internal Server Error" }, 500);
});

export default app;
