-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_taskId_fkey";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "quizScore";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "type";

-- DropTable
DROP TABLE "QuizQuestion";

-- DropEnum
DROP TYPE "TaskType";

