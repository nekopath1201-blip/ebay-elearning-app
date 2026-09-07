"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCatMessage } from "@/lib/catMessages";

async function requireStudent() {
  const session = await auth();
  if (!session?.user) throw new Error("ログインが必要です");
  return session.user;
}

export async function markTaskComplete(taskId: string) {
  const user = await requireStudent();

  await prisma.progress.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: {
      userId: user.id,
      taskId,
      status: "COMPLETED",
      completedAt: new Date(),
    },
    update: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/student", "layout");
}

type QuizSubmitResult = {
  allCorrect: boolean;
  correctCount: number;
  total: number;
  results: Record<string, boolean>;
  catMessage: string;
};

export async function submitQuiz(
  taskId: string,
  _prevState: QuizSubmitResult | undefined,
  formData: FormData
): Promise<QuizSubmitResult> {
  const user = await requireStudent();

  const questions = await prisma.quizQuestion.findMany({ where: { taskId } });

  const results: Record<string, boolean> = {};
  let correctCount = 0;

  for (const q of questions) {
    const selected = formData.get(`q_${q.id}`);
    const isCorrect =
      selected !== null && Number(selected) === q.correctAnswerIndex;
    results[q.id] = isCorrect;
    if (isCorrect) correctCount += 1;
  }

  const total = questions.length;
  const allCorrect = total > 0 && correctCount === total;
  const quizScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  await prisma.progress.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: {
      userId: user.id,
      taskId,
      status: allCorrect ? "COMPLETED" : "IN_PROGRESS",
      quizScore,
      completedAt: allCorrect ? new Date() : null,
    },
    update: {
      status: allCorrect ? "COMPLETED" : "IN_PROGRESS",
      quizScore,
      completedAt: allCorrect ? new Date() : null,
    },
  });

  revalidatePath("/student", "layout");

  return {
    allCorrect,
    correctCount,
    total,
    results,
    catMessage: getCatMessage(allCorrect ? "quiz_correct" : "quiz_incorrect"),
  };
}
