import { Hono } from "hono";
import { Bindings } from "../bindings";
import geminiRoute from "./gemini";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/gemini", geminiRoute);

export default app;
