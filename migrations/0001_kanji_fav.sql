-- CreateTable
CREATE TABLE "Kanji_fav" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL DEFAULT 'n2',
    "hirakana" TEXT NOT NULL,
    "kanji" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_fav_kanji_key" ON "Kanji_fav"("kanji");
