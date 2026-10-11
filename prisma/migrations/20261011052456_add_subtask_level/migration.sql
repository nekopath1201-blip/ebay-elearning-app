-- CreateTable SubTask
CREATE TABLE "SubTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "textBody" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubTask_pkey" PRIMARY KEY ("id")
);

-- Migrate existing Task content into SubTask, reusing the same id so that
-- existing TaskImage/Progress rows (which reference this id) keep working
-- once their foreign key is repointed below.
INSERT INTO "SubTask" ("id", "taskId", "title", "order", "videoUrl", "textBody", "fileUrl", "fileName", "published", "createdAt")
SELECT "id", "id", "title", 0, "videoUrl", "textBody", "fileUrl", "fileName", "published", "createdAt"
FROM "Task";

-- AddForeignKey SubTask -> Task
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Repoint TaskImage from Task to SubTask (values unchanged; same ids now refer to SubTask rows)
ALTER TABLE "TaskImage" DROP CONSTRAINT "TaskImage_taskId_fkey";
ALTER TABLE "TaskImage" RENAME COLUMN "taskId" TO "subTaskId";
ALTER TABLE "TaskImage" ADD CONSTRAINT "TaskImage_subTaskId_fkey" FOREIGN KEY ("subTaskId") REFERENCES "SubTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Repoint Progress from Task to SubTask
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_taskId_fkey";
DROP INDEX "Progress_userId_taskId_key";
ALTER TABLE "Progress" RENAME COLUMN "taskId" TO "subTaskId";
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_subTaskId_fkey" FOREIGN KEY ("subTaskId") REFERENCES "SubTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Progress_userId_subTaskId_key" ON "Progress"("userId", "subTaskId");

-- Drop now-migrated content columns from Task (its children in SubTask hold them now)
ALTER TABLE "Task" DROP COLUMN "videoUrl";
ALTER TABLE "Task" DROP COLUMN "textBody";
ALTER TABLE "Task" DROP COLUMN "fileUrl";
ALTER TABLE "Task" DROP COLUMN "fileName";
