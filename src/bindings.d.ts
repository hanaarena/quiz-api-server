export interface Bindings {
  QUIZ_KV: KVNamespace;
}

declare global {
  function getMiniflareBindings(): Bindings;
}