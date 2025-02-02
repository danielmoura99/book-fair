-- Primeiro, adiciona a coluna permitindo NULL
ALTER TABLE "Transaction" ADD COLUMN "operatorName" TEXT;

-- Atualiza registros existentes com um valor padrão
UPDATE "Transaction" SET "operatorName" = 'Sistema' WHERE "operatorName" IS NULL;

-- Altera a coluna para NOT NULL depois de atualizar os dados
ALTER TABLE "Transaction" ALTER COLUMN "operatorName" SET NOT NULL;