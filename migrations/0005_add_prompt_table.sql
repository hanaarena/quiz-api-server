-- CreateTable
CREATE TABLE "quiz_prompt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT '',
    "prompt" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);


-- CreateIndex
CREATE UNIQUE INDEX "quiz_prompt_name_key" ON "quiz_prompt"("name");
