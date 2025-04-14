import { Hono } from "hono";
import { Bindings } from "../bindings";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModelList, QuizType } from "../utils/const";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

const errorMsg = "limited";

const geminiRoute = new Hono<{ Bindings: Bindings }>();

geminiRoute.post("/questions", async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  const db = c.env.DB;

  if (!apiKey) {
    throw new Error(errorMsg);
  }
  if (!db) {
    throw new Error(errorMsg);
  }

  try {
    const body = await c.req.json<{ content: string; name: string; model: string }>();
    const { content, name, model } = body;
    if (!content || !name) {
      throw new Error(errorMsg);
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
      model: model || GeminiModelList.Gemini2FlashExp
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
    const text = response.text();
    const t = QuizType[name.split("_")[0]];
    const quizName = `${t.name}.${t.value[name]}`;

    return c.json({ generatedText: text, name, quizName });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ message: error.message }, 500);
  }
});

export default geminiRoute;
