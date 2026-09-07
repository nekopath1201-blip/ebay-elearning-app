import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin1234";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "管理者",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  const existingSection = await prisma.section.findFirst({
    where: { title: "はじめに" },
  });

  if (!existingSection) {
    await prisma.section.create({
      data: {
        title: "はじめに",
        description: "eBay研修の進め方について学びます",
        order: 1,
        tasks: {
          create: [
            {
              title: "ようこそ！eBay研修へ",
              type: "TEXT",
              order: 1,
              textBody:
                "このEラーニングでは、セクションごとに課題（テキスト・動画・画像・クイズ）をこなしながらeBay業務の進め方を学習します。チビ太が案内してくれるので、リラックスして取り組んでください。",
            },
            {
              title: "理解度チェック",
              type: "QUIZ",
              order: 2,
              questions: {
                create: [
                  {
                    question: "この研修はどのように進めますか？",
                    choices: ["1つずつ課題をこなす", "何もしなくてよい"],
                    correctAnswerIndex: 0,
                    order: 1,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  console.log("Seed完了:", admin.email, "/ パスワード:", adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
