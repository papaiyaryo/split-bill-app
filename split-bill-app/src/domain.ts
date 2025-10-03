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

// 通貨別の金額情報
export type CurrencyAmount = {
  currency: Currency;
  amount: number;
};

// 残高情報
export type Balance = {
  person: Person;
  paid: number;      // 支払った総額（JPY）
  owed: number;      // 負担すべき総額（JPY）
  balance: number;   // 残高（支払い - 負担）
  paidByCurrency: CurrencyAmount[];  // 通貨別支払い額
  owedByCurrency: CurrencyAmount[];  // 通貨別負担額
};

// 精算取引
export type Settlement = {
  from: Person;      // 支払う人
  to: Person;        // 受け取る人
  amount: number;    // 金額（JPY）
};


// 通貨フォーマッター
export const fmtJPY = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const fmtUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const fmtEUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const fmtRON = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// 通貨フォーマッターのマップ
export const currencyFormatters: Record<Currency, Intl.NumberFormat> = {
  JPY: fmtJPY,
  USD: fmtUSD,
  EUR: fmtEUR,
  RON: fmtRON,
};


