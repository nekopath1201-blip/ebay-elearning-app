import { prisma } from "@/lib/prisma";
import { deleteStudent } from "@/app/actions/admin-students";
import { getTotalPublishedTaskCount } from "@/lib/progress";
import { CreateStudentForm } from "@/components/admin/CreateStudentForm";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminStudentsPage() {
  const [students, totalTasks] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { progress: { where: { status: "COMPLETED" } } },
        },
      },
    }),
    getTotalPublishedTaskCount(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-gray-800">受講者管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          受講者アカウントの発行と進捗の確認ができます。
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          受講者アカウントを発行
        </h2>
        <CreateStudentForm />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700">受講者一覧</h2>
        {students.length === 0 && (
          <p className="text-sm text-gray-500">まだ受講者がいません。</p>
        )}
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-500">{student.email}</p>
              <p className="mt-1 text-xs text-gray-600">
                進捗: {student._count.progress} / {totalTasks} 課題完了
              </p>
            </div>
            <form action={deleteStudent.bind(null, student.id)}>
              <ConfirmSubmitButton
                confirmMessage={`${student.name}さんのアカウントを削除します。よろしいですか？`}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                削除
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
