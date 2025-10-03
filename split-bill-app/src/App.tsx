import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { Expense, Person, Currency, Rates } from "./domain.ts";
import {fmtJPY, PEOPLE_OPTIONS, currencyFormatters} from "./domain.ts"
import { getLS, setLS } from "./storage.ts";
import { fetchRatesJPY } from "./rate.ts";
import { computeBalances, computeSettlements, convertToJPY } from "./calculations.ts";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getLS<Expense[]>("expenses", [])
  );
  const [inputP, setInputP] = useState<Person[]>([]);
  const [payerId, setPayerId] = useState<number | "">("");
  const [inputB, setInputB] = useState("");
  const [currency, setCurrency] = useState<Currency>("RON");
  const [inputU, setInputU] = useState("");
  const [nextId, setNextId] = useState<number>(() => {
    // 既存の支出から最大IDを取得して+1
    const existingExpenses = getLS<Expense[]>("expenses", []);
    return existingExpenses.length > 0 
      ? Math.max(...existingExpenses.map(e => e.id)) + 1 
      : 1;
  });
  const [rates, setRates] = useState<Rates | null>(null);

  // 入力中の人数（表示用）
  const togglePerson = (person: Person) => {
    setInputP(
      (prev) =>
        prev.some((p) => p.id === person.id)
          ? prev.filter((p) => p.id !== person.id) // 既にあれば外す
          : [...prev, person] // 無ければ追加
    );
  };

  // 3項目が全て入力済み かつ 金額が正の数 かつ 人数1以上
  const parsedAmount = Number(inputB);
  const isValid =
    inputP.length > 0 &&
    inputU.trim() !== "" &&
    inputB.trim() !== "" &&
    payerId !== ""&&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0;

  const ayer = PEOPLE_OPTIONS.find((p) => p.id === (payerId as number)) || null;

  const addExpense = () => {
    if (!isValid) return;
    const newExpense: Expense = {
      id: nextId,
      participants: inputP,
      payer: ayer as Person,
      amount: parsedAmount,
      currency: currency,
      usage: inputU.trim(),
      settled: false,
    };
    setExpenses([...expenses, newExpense]);

    // 入力欄クリア
    setNextId(nextId + 1);
    setInputP([]);
    setPayerId("");
    setInputB("");
    setCurrency("RON");
    setInputU("");
  };

  useEffect(() => {
    setLS("expenses", expenses);
  }, [expenses]);
  useEffect(() => {
    let alive = true;
    fetchRatesJPY()
      .then((r) => {
        if (alive) setRates(r);
      })
      .catch(console.error);
    return () => {
      alive = false;
    };
  },[]);

  const deleteExpense = (id: number) => {
    console.log(`削除対象ID: ${id}`);
    console.log(`削除前の支出数: ${expenses.length}`);
    console.log(`削除前の支出ID一覧:`, expenses.map(e => e.id));
    
    const filteredExpenses = expenses.filter((exp) => exp.id !== id);
    
    console.log(`削除後の支出数: ${filteredExpenses.length}`);
    console.log(`削除後の支出ID一覧:`, filteredExpenses.map(e => e.id));
    
    setExpenses(filteredExpenses);
  };

  // 残高計算
  const balances = computeBalances(PEOPLE_OPTIONS, expenses, rates);
  const settlements = computeSettlements(balances);

  // デバッグ用：計算結果をコンソールに出力
  console.log("Expenses:", expenses);
  console.log("Rates:", rates);
  console.log("Balances:", balances);
  
  // 残高計算の詳細デバッグ
  if (balances.length > 0) {
    console.log("=== 残高計算詳細 ===");
    balances.forEach(b => {
      console.log(`${b.person.name}: 支払い=${b.paid.toFixed(2)}, 負担=${b.owed.toFixed(2)}, 残高=${b.balance.toFixed(2)}`);
    });
    const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
    console.log(`残高合計: ${totalBalance.toFixed(2)} (理論上は0になるはず)`);
  }

  // 通貨別詳細を表示する関数
  const renderCurrencyBreakdown = (currencyAmounts: { currency: Currency; amount: number }[]) => {
    if (currencyAmounts.length === 0) return "なし";
    
    return currencyAmounts
      .filter(ca => ca.amount > 0.01) // 1円/1セント以上のもののみ表示
      .map(ca => `${currencyFormatters[ca.currency].format(ca.amount)}`)
      .join(", ");
  };
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Hello Split-Bill App</h1>
      <h2>参加者（複数選択）</h2>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {PEOPLE_OPTIONS.map((person) => (
          <label key={person.id} style={{ display: "inline-flex", gap: 6 }}>
            <input
              type="checkbox"
              checked={inputP.some((p) => p.id === person.id)}
              onChange={() => togglePerson(person)}
            />
            {person.name}
          </label>
        ))}
      </div>

      <h2>金額</h2>
      <input
        value={inputB}
        onChange={(e) => setInputB(e.target.value)}
        placeholder="1000"
        inputMode="decimal"
      />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
      >
        <option value="JPY">JPY</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="RON">RON</option>
      </select>

      <h2>使用用途</h2>
      <input
        value={inputU}
        onChange={(e) => setInputU(e.target.value)}
        placeholder="例：9月9日昼ごはん"
      />

      <h2>支払者</h2>
      <select
        value={payerId}
        onChange={(e) => {
          const v = e.target.value;
          setPayerId(v === "" ? "" : Number(v));
        }}
      >
        <option value="">---支払者を選択--</option>
        {PEOPLE_OPTIONS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="cardBill" style={{ marginTop: 8 }}>
        <button onClick={addExpense} disabled={!isValid}>
          追加
        </button>
      </div>
      <h2 style={{ marginTop: 24 }}>支出一覧</h2>
      <p></p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>参加者</th>
              <th>人数</th>
              <th>金額</th>
              <th>金額</th>
              <th>用途</th>
              <th>支払者</th>
              <th>削除</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i}>
                <td>{exp.participants.map((p) => p.name).join(", ")}</td>
                <td>{exp.participants.length}</td>
                <td>
                  {exp.amount} {exp.currency}
                </td>
                <td>
                  {rates ? fmtJPY.format(convertToJPY(exp.amount, exp.currency, rates)) : "--"}
                </td>
                <td>{exp.usage}</td>
                <td>{exp.payer.name}</td>
                <td>
                  <button 
                    onClick={() => {
                      if (confirm(`「${exp.usage}」を削除しますか？`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    style={{ 
                      backgroundColor: '#ff4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ opacity: 0.7 }}>
                  まだデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 残高表示セクション */}
      <h2 style={{ marginTop: 32 }}>残高一覧</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <table border={1} cellPadding={6} style={{ fontSize: "14px" }}>
          <thead>
            <tr>
              <th>名前</th>
              <th>支払い総額<br/>(JPY換算)</th>
              <th>支払い詳細<br/>(元通貨)</th>
              <th>負担総額<br/>(JPY換算)</th>
              <th>負担詳細<br/>(元通貨)</th>
              <th>残高</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 'bold' }}>{balance.person.name}</td>
                <td style={{ textAlign: 'right' }}>{fmtJPY.format(balance.paid)}</td>
                <td style={{ fontSize: "12px", color: "#666" }}>
                  {renderCurrencyBreakdown(balance.paidByCurrency)}
                </td>
                <td style={{ textAlign: 'right' }}>{fmtJPY.format(balance.owed)}</td>
                <td style={{ fontSize: "12px", color: "#666" }}>
                  {renderCurrencyBreakdown(balance.owedByCurrency)}
                </td>
                <td style={{ 
                  color: balance.balance > 0 ? 'green' : balance.balance < 0 ? 'red' : 'black',
                  fontWeight: 'bold',
                  textAlign: 'right'
                }}>
                  {fmtJPY.format(balance.balance)}
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan={6} style={{ opacity: 0.7 }}>
                  為替レートを取得中...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 精算結果セクション */}
      <h2 style={{ marginTop: 32 }}>精算結果</h2>
      {settlements.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <table border={1} cellPadding={6}>
            <thead>
              <tr>
                <th>支払う人</th>
                <th>受け取る人</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement, i) => (
                <tr key={i}>
                  <td>{settlement.from.name}</td>
                  <td>{settlement.to.name}</td>
                  <td style={{ fontWeight: 'bold', color: 'blue' }}>
                    {fmtJPY.format(settlement.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>
          {balances.length > 0 ? '精算の必要はありません' : 'データがありません'}
        </p>
      )}

      <h3>デバック用({rates?.date})</h3>
      <div>
        {/* 確認用 */}
        <p>EUR　{rates?.rates.EUR}</p>
        <p>USD　{rates?.rates.USD}</p>
        <p>JPY　{rates?.rates.JPY}</p>
        <p>RON　{rates?.rates.RON}</p>
        <p>支出件数: {expenses.length}</p>
        <p>次のID: {nextId}</p>
        <p>残高計算対象: {balances.length}人</p>
        {expenses.length > 0 && (
          <div>
            <p>支出ID一覧: {expenses.map(e => e.id).join(", ")}</p>
          </div>
        )}
        {balances.length > 0 && (
          <div>
            <p>残高詳細:</p>
            {balances.map((b, i) => (
              <p key={i} style={{ fontSize: "12px", margin: "2px 0" }}>
                {b.person.name}: 支払い={b.paid.toFixed(2)}, 負担={b.owed.toFixed(2)}, 残高={b.balance.toFixed(2)}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
