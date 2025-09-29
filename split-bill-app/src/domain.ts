// 通貨の種類
export type Currency = "JPY" | "USD" | "EUR" | "RON";

// 参加者
export type Person = {
  id: number;   // 一意なID
  name: string; // 表示名
};

// 支出
export type Expense = {
  id: number ;
  payer: Person;       // 誰が払ったか
  amount: number;      // 金額
  currency: Currency;  // 通貨
  participants: Person[]; // この支出に含まれる人
  usage: string;       // 用途メモ
  settled: boolean;    // 返金済みかどうか
};

// 為替レート
export type Rates = {
  base: Currency;       // 基準通貨
  date: string;         // レート日付
  rates: Record<Currency, number>; // 通貨ごとのレート
};

export const PEOPLE_OPTIONS: Person[] = [
  { id: 1, name: "奥村" },
  { id: 2,  name: "上条" },
  { id: 3, name: "小林" },
  { id: 4, name: "齋藤" },
  { id: 5, name: "佐久間" },
  { id: 6, name: "矢口" },
  { id: 7, name: "山川" },
];

// ① フォーマッター（小数0桁）
export const fmtJPY = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});


