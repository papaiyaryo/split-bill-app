import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

type Expense = {
  people: string[];
  amount: number;
  usage: string;
};

const PEOPLE_OPTIONS = ["A", "B", "C", "F", "E", "G"];

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inputP, setInputP] = useState<string[]>([]);
  const [inputB, setInputB] = useState("");
  const [inputU, setInputU] = useState("");
  const count = 0;

  // 入力中の人数（表示用）
    const togglePerson = (name: string) => {
    setInputP((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // 3項目が全て入力済み かつ 金額が正の数 かつ 人数1以上
  const parsedAmount = Number(inputB);
  const isValid =
    inputP.length > 0&&
    inputU.trim() !== "" &&
    inputB.trim() !== "" &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 

  const addExpense = () => {
    if (!isValid) return;
    const newExpense: Expense = {
      people: inputP,
      amount: parsedAmount,
      usage: inputU.trim(),
    };
    setExpenses([...expenses, newExpense]);

    // 入力欄クリア
    setInputP([]);
    setInputB("");
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
      <h2>参加者</h2>
      <h2>参加者（複数選択）</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap",justifyContent:"center" }}>
        {PEOPLE_OPTIONS.map((name) => (
          <label key={name} style={{ display: "inline-flex", gap: 6 }}>
            <input
              type="checkbox"
              checked={inputP.includes(name)}
              onChange={() => togglePerson(name)}
            />
            {name}
          </label>
        ))}
        <p>{inputP}</p>
      </div>

      <h2>金額</h2>
      <input
        value={inputB}
        onChange={(e) => setInputB(e.target.value)}
        placeholder="1000"
        inputMode="decimal"
      />

      <h2>使用用途</h2>
      <input
        value={inputU}
        onChange={(e) => setInputU(e.target.value)}
        placeholder="例：9月9日昼ごはん"
      />

      <div className="cardBill" style={{ marginTop: 8 }}>
        <button onClick={addExpense} disabled={!isValid}>
          追加
        </button>
      </div>
      <h2 style={{ marginTop: 24 }}>支出一覧</h2>
      <div style={{ display: "flex" ,justifyContent:"center"}}>
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>参加者</th>
              <th>人数</th>
              <th>金額</th>
              <th>用途</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i}>
                <td>{exp.people.join(", ")}</td>
                <td>{exp.people.length}</td>
                <td>{exp.amount}</td>
                <td>{exp.usage}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} style={{ opacity: 0.7 }}>
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
