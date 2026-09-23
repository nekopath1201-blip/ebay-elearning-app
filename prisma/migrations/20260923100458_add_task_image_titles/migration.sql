-- CreateTable
CREATE TABLE "TaskImage" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskImage" ADD CONSTRAINT "TaskImage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing Task.imageUrls values into TaskImage rows (preserve order)
INSERT INTO "TaskImage" ("id", "taskId", "url", "order")
SELECT
  't_img_' || t."id" || '_' || (u.ord - 1)::text,
  t."id",
  u.url,
  (u.ord - 1)::int
FROM "Task" t
CROSS JOIN LATERAL unnest(t."imageUrls") WITH ORDINALITY AS u(url, ord);

-- DropColumn
ALTER TABLE "Task" DROP COLUMN "imageUrls";
