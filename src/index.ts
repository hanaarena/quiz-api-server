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
import { getMoji3 } from "./cron";
import proxyRoute from "./proxy";

const app = new Hono<{ Bindings: Bindings }>();

// middlewares
app.use("/api/*", cors());
app.use("/proxy", cors());
app.use("/api/*", modifyBodyMiddleware);

// routes
app.route("/api/kanji", kanjiRoute);
app.route("/api/grammar", grammarRoute);
app.route("/api/user", userRoute);
app.route("/api/opt", optRoute);
app.route("/api/quiz", quizRoute);
app.route("/proxy", proxyRoute)

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

export default {
  fetch: app.fetch,
  async scheduled(_: ScheduledEvent, env: Bindings, __: ExecutionContext) {
    await getMoji3(env);
  }
};
