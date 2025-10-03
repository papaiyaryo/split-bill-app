import type { Person, Expense, Rates, Balance, Settlement, Currency, CurrencyAmount } from "./domain";

/**
 * 通貨変換関数（JPY基準）
 * 
 * @param amount 変換する金額
 * @param from 変換元の通貨
 * @param rates 為替レート情報
 * @returns JPY換算された金額
 */
export function convertToJPY(
  amount: number,
  from: Currency,
  rates: Rates
): number {
  if (!Number.isFinite(amount)) return NaN;
  if (from === "JPY") return amount;

  const r = rates.rates[from];
  if (!Number.isFinite(r) || r === 0) return NaN;

  return amount / r;
}

/**
 * 通貨別金額配列に金額を追加するヘルパー関数
 * 
 * @param currencyAmounts 通貨別金額配列
 * @param currency 通貨
 * @param amount 追加する金額
 */
function addToCurrencyAmounts(
  currencyAmounts: CurrencyAmount[],
  currency: Currency,
  amount: number
): void {
  const existing = currencyAmounts.find(ca => ca.currency === currency);
  if (existing) {
    existing.amount += amount;
  } else {
    currencyAmounts.push({ currency, amount });
  }
}

/**
 * 残高計算関数
 * 
 * 各人の支払い総額と負担総額を計算し、残高を算出します。
 * 精算済み（settled=true）の支出は除外されます。
 * 
 * @param people 参加者一覧
 * @param expenses 支出一覧
 * @param rates 為替レート情報
 * @returns 各人の残高情報
 */
export function computeBalances(
  people: Person[],
  expenses: Expense[],
  rates: Rates | null
): Balance[] {
  if (!rates) return [];

  const balances = new Map<number, Balance>();
  
  // 初期化：全員の残高を0で初期化
  people.forEach(person => {
    balances.set(person.id, {
      person,
      paid: 0,      // 支払った総額
      owed: 0,      // 負担すべき総額
      balance: 0,   // 残高（支払い - 負担）
      paidByCurrency: [],  // 通貨別支払い額
      owedByCurrency: []   // 通貨別負担額
    });
  });

  // 各支出を処理
  expenses.forEach(expense => {
    if (expense.settled) return; // 精算済みは除外
    
    const amountJPY = convertToJPY(expense.amount, expense.currency, rates);
    if (!Number.isFinite(amountJPY)) return;

    // 支払者の支払い額を増加
    const payerBalance = balances.get(expense.payer.id);
    if (payerBalance) {
      payerBalance.paid += amountJPY;
      addToCurrencyAmounts(payerBalance.paidByCurrency, expense.currency, expense.amount);
    }

    // 参加者の負担額を増加（均等割）
    const perPerson = amountJPY / expense.participants.length;
    const perPersonOriginal = expense.amount / expense.participants.length;
    expense.participants.forEach(participant => {
      const participantBalance = balances.get(participant.id);
      if (participantBalance) {
        participantBalance.owed += perPerson;
        addToCurrencyAmounts(participantBalance.owedByCurrency, expense.currency, perPersonOriginal);
      }
    });
  });

  // 残高を計算（支払い - 負担）
  balances.forEach(balance => {
    balance.balance = balance.paid - balance.owed;
  });

  return Array.from(balances.values());
}

/**
 * 精算アルゴリズム（最小取引回数）
 * 
 * 残高情報から、最小の取引回数で精算する方法を計算します。
 * 債権者（プラス残高）と負債者（マイナス残高）をマッチングし、
 * 最も効率的な精算パターンを生成します。
 * 
 * @param balances 各人の残高情報
 * @returns 精算取引一覧
 */
export function computeSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];
  
  // 残高のコピーを作成（元の残高を変更しないため）
  const workingBalances = balances.map(b => ({ ...b, balance: b.balance }));
  
  // 残高の大きい順（債権者）から小さい順（負債者）にソート
  const sortedBalances = workingBalances.sort((a, b) => b.balance - a.balance);
  
  let i = 0; // 債権者（プラス）のインデックス
  let j = sortedBalances.length - 1; // 負債者（マイナス）のインデックス
  
  while (i < j) {
    const creditor = sortedBalances[i];  // 債権者
    const debtor = sortedBalances[j];    // 負債者
    
    // 両方の残高がほぼ0なら精算完了
    if (Math.abs(creditor.balance) < 0.01 && Math.abs(debtor.balance) < 0.01) {
      break;
    }
    
    // 取引金額は小さい方の残高
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    
    if (amount > 0.01) { // 1円以上の取引のみ
      settlements.push({
        from: debtor.person,    // 支払う人
        to: creditor.person,    // 受け取る人
        amount: Math.round(amount)  // 金額（円単位で丸める）
      });
      
      // 作業用残高を更新（元の残高は変更しない）
      creditor.balance -= amount;
      debtor.balance += amount;
    }
    
    // 次のペアに移動
    if (Math.abs(creditor.balance) < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j--;
  }
  
  return settlements;
}

/**
 * 残高の合計を計算（デバッグ用）
 * 
 * @param balances 各人の残高情報
 * @returns 残高の合計（理論上は0になるはず）
 */
export function getTotalBalance(balances: Balance[]): number {
  return balances.reduce((sum, balance) => sum + balance.balance, 0);
}
