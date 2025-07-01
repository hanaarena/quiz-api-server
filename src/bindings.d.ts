export interface Bindings {
  QUIZ_KV: KVNamespace;
  DB: D1Database;
  GEMINI_API_KEY: string;
  WORKER_DOMAIN: string;
}

declare global {
  function getMiniflareBindings(): Bindings;
}