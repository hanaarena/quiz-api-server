import { Bindings } from "../bindings";
import { GeminiModelList } from "../utils/const";
import { generateRandomHash } from "../utils/string";

const JOB_TYPE = "moji_3";

export async function getMoji3(env: Bindings) {
  console.log(`${JOB_TYPE} star cron job at`, new Date().toString());
  return fetch(`${env.WORKER_DOMAIN}/api/quiz/gemini/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "hoolala",
      name: JOB_TYPE,
      model: GeminiModelList.Gemini25Flash0520
    })
  }).then(async (r) => {
    const res = (await r.json()) as {
      data: { generatedText: string; name: string };
    };
    // store generated text to KV
    const { data } = res;
    if (!data) {
      console.error(`[${JOB_TYPE}] api failed`, new Date().toString());
      return;
    }

    const { generatedText, name } = data;
    if (!generatedText) {
      console.error(`[${JOB_TYPE}] no generated text`, new Date().toString());
      return;
    }

    await env.QUIZ_KV.put(
      `${name}_${generateRandomHash(10)}`,
      generatedText,
      {
        expirationTtl: 60 * 60 * 24 * 2
      }
    );
    console.log(`[${JOB_TYPE}] cron job finished at`, new Date().toString());
  });
}
