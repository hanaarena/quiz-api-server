import { Hono } from "hono";
import { Bindings } from "../bindings";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModelList, QuizType } from "../utils/const";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

const errorMsg = "limited";
const spliterKey = "[sperator]";

const geminiRoute = new Hono<{ Bindings: Bindings }>();

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
    const t = QuizType[name.split("_")[0]];
    const quizName = `${t.name}.${t.value[name]}`;

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
    let text = response.text();

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

export default geminiRoute;
