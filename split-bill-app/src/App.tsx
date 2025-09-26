import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import type { Expense, Person, Currency } from "./domain.ts";
import { PEOPLE_OPTIONS } from "./domain.ts";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inputP, setInputP] = useState<Person[]>([]);
  const [payerId, setPayerId] = useState<number | "">("");
  const [inputB, setInputB] = useState("");
  const [currency, setCurrency] = useState<Currency>("RON");
  const [inputU, setInputU] = useState("");
  const [count, setCount] = useState<number>(0);

  // 入力中の人数（表示用）
  const togglePerson = (person: Person) => {
    setInputP(
      (prev) =>
        prev.some((p) => p.id === person.id)
          ? prev.filter((p) => p.id !== person.id) // 既にあれば外す
          : [...prev, person] // 無ければ追加
    );
  };
  const addCount = () => {
    setCount(count + 1);
  };

  // 3項目が全て入力済み かつ 金額が正の数 かつ 人数1以上
  const parsedAmount = Number(inputB);
  const isValid =
    inputP.length > 0 &&
    inputU.trim() !== "" &&
    inputB.trim() !== "" &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0;

  const ayer = PEOPLE_OPTIONS.find((p) => p.id === (payerId as number)) || null;

  const addExpense = () => {
    if (!isValid) return;
    const newExpense: Expense = {
      id: count,
      participants: inputP,
      payer: ayer as Person,
      amount: parsedAmount,
      currency: currency,
      usage: inputU.trim(),
      settled: false,
    };
    setExpenses([...expenses, newExpense]);

    // 入力欄クリア
    setInputP([]);
    setPayerId("");
    setInputB("");
    setCurrency("RON");
    setInputU("");
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
              <th>用途</th>
              <th>支払者</th>
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
                <td>{exp.usage}</td>
                <td>{exp.payer.name}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} style={{ opacity: 0.7 }}>
                  まだデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
