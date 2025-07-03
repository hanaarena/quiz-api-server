import { Hono } from "hono";
import { Bindings } from "../bindings";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModelList, QuizType } from "../utils/const";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

const errorMsg = "limited";
const spliterKey = "[sperator]";

const geminiRoute = new Hono<{ Bindings: Bindings }>();

export async function getGemini(
  name: string,
  content: string,
  db: D1Database,
  apiKey: string,
  model: string
) {
  const adapter = new PrismaD1(db);
  const prisma = new PrismaClient({ adapter });
  const promptResult = await prisma.quiz_prompt.findFirst({
    where: {
      name
    }
  });
  const systemPrompt = promptResult?.system;

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = genAI.getGenerativeModel({
    model: model || GeminiModelList.Gemini25Flash
  });

  const result = await models.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: content
          }
        ]
      }
    ],
    systemInstruction: systemPrompt
  });
  const response = result.response;
  return response.text();
}

geminiRoute.post("/questions", async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  const db = c.env.DB;
  const cachedArr: string[] = [];

  if (!apiKey) {
    throw new Error(errorMsg);
  }
  if (!db) {
    throw new Error(errorMsg);
  }

  try {
    const body = await c.req.json<{
      content: string;
      name: string;
      model: string;
      cache?: boolean;
    }>();
    const { name, model, cache } = body;
    let { content } = body;
    if (!content || !name) {
      throw new Error(errorMsg);
    }
    const t = QuizType[name.split("_")[0]] || {};
    const quizName = t.value ? `${t.name}.${t.value[name]}` : name;

    if (cache) {
      // detect `moji` question's cache
      if (name.indexOf("moji_") > -1) {
        const keywordArr = content.split(",");
        const remainingKeywords = [];
        for (let index = 0, len = keywordArr.length; index < len; index++) {
          const cached = await c.env.QUIZ_KV.get(
            `${name}_${keywordArr[index]}`
          );
          if (cached) {
            cachedArr.push(cached);
          } else {
            remainingKeywords.push(keywordArr[index]);
          }
        }
        content = remainingKeywords.join(",");
      }
    }

    if (content.length === 0 && cache) {
      return c.json({
        generatedText: cachedArr.join(spliterKey),
        name,
        quizName,
        content: content.split(",")
      });
    }

    let text = await getGemini(name, content, db, apiKey, model);

    if (cache) {
      // caching `moji` question
      if (name.indexOf("moji_") > -1) {
        const resArr = text.split(spliterKey);
        const keywordArr = content.split(",");
        for (let index = 0; index < keywordArr.length; index++) {
          await c.env.QUIZ_KV.put(
            `${name}_${keywordArr[index]}`,
            resArr[index],
            {
              expirationTtl: 60 * 60 * 24 * 7
            }
          );
        }

        // join cached result to the response text
        if (cachedArr.length > 0) {
          text = `${text}\n${spliterKey}\n${cachedArr.join(spliterKey)}}`;
        }
      }
    }

    return c.json({
      generatedText: text,
      name,
      quizName,
      content: content.split(",")
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ message: error.message }, 500);
  }
});

geminiRoute.get("/questions", async (c) => {
  const query = c.req.query();
  const { name, length } = query;
  if (!name) return c.json({ content: "" });
  const len = isNaN(Number(length)) ? 1 : Number(length);

  // NOTE:
  // - `cacheList` format: [ {"name":"moji_3_18d3H26Jf6","expiration":1751579469} ]
  // - without `limit`, default return list length is 100 (max to 1000)
  const cacheList = await c.env.QUIZ_KV.list({ prefix: name, limit: len });
  if (cacheList.keys.length) {
    if (len > 1) {
      const list: string[] = [];
      const keyList: string[] = [];
      for (let index = 0; index < cacheList.keys.length; index++) {
        const name = cacheList.keys[index].name;
        keyList.push(name);
      }

      // get KV list by key list (limit to 100 keys and response size for 25MB with code 413)
      const values: Map<string, string | null> = await c.env.QUIZ_KV.get(keyList);
      // ensure the order of returned key's value
      for (let index = 0; index < values.size; index++) {
        const v = values.get(keyList[index])
        if (v) {
          list.push(v)
        }
      }
      const generatedText = list.join("-AAA-").replaceAll(spliterKey, "").replace("-AAA-", spliterKey);

      return c.json({ list, keyList, generatedText });
    }

    // only return the first one item
    const firstItem = cacheList.keys[0];
    const generatedText = await c.env.QUIZ_KV.get(firstItem.name);
    // FIFO
    await c.env.QUIZ_KV.delete(firstItem.name);
    return c.json({ generatedText });
  }

  return c.json({ generatedText: "" });
});

export default geminiRoute;
