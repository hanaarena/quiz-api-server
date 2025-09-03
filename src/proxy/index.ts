import { Hono } from "hono";
import { Bindings } from "../bindings";
import { StatusCode } from "hono/utils/http-status";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  try {
    const targetUrl = c.req.query("url");

    if (!targetUrl) {
      return c.status(400);
    }

    const headers = new Headers();
    const rawHeaders = Object.fromEntries(c.req.raw.headers)
    for (const [key, value] of Object.entries(rawHeaders)) {
      headers.set(key, value);
    }
    const response = await fetch(targetUrl, {
      headers: headers
    });

    if (!response.ok) {
      return c.json(
        {
          error: `Failed to fetch from target URL: ${response.statusText}`,
          response
        },
        (response.status as StatusCode) || 500
      );
    }

    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (e) {
    if (e instanceof Error) {
      return c.json({ error: e.message }, 500);
    }

    return c.json({ error: e }, 500);
  }
});

export default app;
