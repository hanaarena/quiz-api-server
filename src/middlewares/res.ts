import { Context, Next } from "hono";
import { StatusCode } from "hono/utils/http-status";

interface CustomResponse extends Response {
  code?: number;
  message?: string;
}

const modifyBodyMiddleware = async (c: Context, next: Next) => {
  await next();

  if (c.res) {
    if (c.res.status === 404) {
      return;
    }

    const originalBody = await c.res.json();
    const code = c.get("code") || c.res.status || 200;
    const message =
      c.get("message") ||
      (originalBody as unknown as { message: string }).message ||
      "ok";

    c.res = c.newResponse(
      JSON.stringify({
        data: originalBody,
        message,
        code
      }),
      c.res.status as StatusCode,
      {
        ...c.res.headers,
        "Content-Type": "application/json"
      }
    );
  }
};

const extendResponseMiddleware = async (c: Context, next: Next) => {
  await next();

  if (c.res) {
    // Create a new response object that extends the original
    const customRes: CustomResponse = c.newResponse(
      c.res.body,
      c.res.status as StatusCode,
      { ...c.res.headers }
    );

    // Add the custom fields.  Default values if not explicitly set.
    customRes.code = c.get("code") || c.res.status;
    customRes.message = c.get("message") || "OK";

    // Overwrite c.res with our extended response
    c.res = customRes;
  }
};

export { modifyBodyMiddleware, extendResponseMiddleware };
