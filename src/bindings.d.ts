export interface Bindings {
  QUIZ_KV: KVNamespace;
  DB: D1Database;
}

declare global {
  function getMiniflareBindings(): Bindings;
}