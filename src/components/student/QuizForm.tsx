"use client";

import { useActionState } from "react";
import { submitQuiz } from "@/app/actions/student";

type Question = {
  id: string;
  question: string;
  choices: string[];
};

export function QuizForm({
  taskId,
  questions,
}: {
  taskId: string;
  questions: Question[];
}) {
  const submitQuizWithTaskId = submitQuiz.bind(null, taskId);
  const [state, formAction, isPending] = useActionState(
    submitQuizWithTaskId,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {questions.map((q, i) => {
        const result = state?.results[q.id];
        return (
          <div key={q.id} className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 font-medium text-gray-800">
              Q{i + 1}. {q.question}
              {result !== undefined && (
                <span
                  className={
                    result ? "ml-2 text-green-600" : "ml-2 text-red-600"
                  }
                >
                  {result ? "○ 正解" : "× 不正解"}
                </span>
              )}
            </p>
            <div className="flex flex-col gap-1">
              {q.choices.map((choice, ci) => (
                <label key={ci} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name={`q_${q.id}`} value={ci} required />
                  {choice}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "採点中..." : "回答する"}
      </button>

      {state && (
        <p className="rounded-md bg-orange-50 p-3 text-sm text-gray-800">
          🐱 {state.catMessage}
          <br />
          {state.correctCount} / {state.total} 問正解しました。
          {state.allCorrect ? " この課題は完了です！" : " もう一度挑戦してみましょう。"}
        </p>
      )}
    </form>
  );
}
