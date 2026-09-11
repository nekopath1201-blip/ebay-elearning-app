export type CatEvent =
  | "welcome"
  | "task_start"
  | "task_complete"
  | "section_complete"
  | "all_complete";

const MESSAGES: Record<CatEvent, string[]> = {
  welcome: [
    "にゃ！よく来たね。一緒にがんばろう！",
    "おかえりニャ！今日はどこから進める？",
  ],
  task_start: [
    "この課題、じっくり見ていこうニャ。",
    "焦らなくて大丈夫。自分のペースで進めてニャ。",
  ],
  task_complete: [
    "この課題クリア！えらいニャ〜！",
    "1つ終わったニャ。着実に進んでるよ！",
  ],
  section_complete: [
    "セクション完了！すごいニャ、大きな一歩だよ！",
    "やったニャ！このセクションはコンプリートだよ。",
  ],
  all_complete: [
    "全部終わったニャ！！本当によく頑張ったね、おめでとう！",
    "ゴール到達おめでとうニャ！胸を張っていいよ！",
  ],
};

export function getCatMessage(event: CatEvent): string {
  const pool = MESSAGES[event];
  return pool[Math.floor(Math.random() * pool.length)];
}
