import { Bindings } from "../bindings";
import { getGemini } from "../quiz/gemini";
import { GeminiModelList } from "../utils/const";
import { generateRandomHash } from "../utils/string";

const JOB_TYPE = "moji_3";

export async function getMoji3(env: Bindings) {
  console.log(`[${JOB_TYPE}] star cron job at`, new Date().toString());
  try {
    const text = await getGemini(
      JOB_TYPE,
      "hoolala",
      env.DB,
      env.GEMINI_API_KEY,
      GeminiModelList.Gemini25Flash0520
    );

    if (!text) {
      console.error(`[${JOB_TYPE}] no generated text`, new Date().toString());
      return;
    }

    await env.QUIZ_KV.put(`${JOB_TYPE}_${generateRandomHash(10)}`, text, {
      expirationTtl: 60 * 60 * 24 * 2
    });
    console.log(`[${JOB_TYPE}] cron job finished at`, new Date().toString());
  } catch (e) {
    console.info(`[${JOB_TYPE}] cron job catch failed`, new Date().toString());
    console.info(e);
  }
}
