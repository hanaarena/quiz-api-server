export const GeminiModelList = {
  Gemini2Flash: "gemini-2.0-flash",
  Gemini2FlashExp: "gemini-2.0-flash-exp",
  Gemini2FlashThinkExp: "gemini-2.0-flash-thinking-exp",
  Gemini2ProExp: "gemini-2.0-pro-exp",
  Gemini25ProExp: "gemini-2.5-pro-exp-03-25",
}

export const QuizType: Record<string, {name: string, value: Record<string, string>}> = {
  moji: {
    name: "文字·語彙",
    value: {
      moji_1: "漢字読み",
      moji_2: "表記",
      moji_3: "語形成",
      moji_4: "文脈規定",
      moji_5: "言い換え類義", 
      moji_6: "用法",
    }
  },
  bungo: {
    name: "文法",
    value: {
      bongo_1: "文法形式の判断",
      bongo_2: "文の組み立て",
      bongo_3: "文章の文法",
    }
  },
  tokkai: {
    name: "読解",
    value: {
      tokkai_1: "内容理解(短文)",
      tokkai_2: "内容理解(中文)",
      tokkai_3: "総合理解",
      tokkai_4: "主張理解(長文)",
      tokkai_5: "情報検索",
    }
  }
}