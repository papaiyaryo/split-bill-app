# 割り勘アプリ開発ロードマップ

## フェーズA：足場づくり（最小構成）
1. **初期整備**
   - `.gitignore` に `node_modules/` と `dist/`
   - `README.md` を作成（目的・起動方法）
   - **DoD**: `npm run dev` で起動、READMEに手順が書いてある

2. **画面の骨組み**
   - `App.tsx` を「参加者」「支出フォーム」「支出一覧」「残高」「精算結果」の5セクションに分ける
   - **DoD**: 見出しだけ並ぶ最小UIが表示される

3. **ドメイン型の定義** (`src/domain.ts`)
   - `Currency`, `Person`, `Expense`, `Rates`
   - **DoD**: 型エラー無し、どこからでもimport可能

---

## フェーズB：ローカルで動くMVP
4. **状態 & 永続化**
   - `useState` + localStorageヘルパ（`getLS/setLS` in `src/storage.ts`）
   - **DoD**: 再読込しても値が残る

5. **参加者入力**
   - カンマ区切りで名前入力 → 配列に変換 → `people` 更新
   - **DoD**: “Alice, Bob, Carol” で3人になる

6. **支出追加フォーム**
   - 支払者 / 金額 / 通貨 / 参加者 / メモ / 返金済み
   - `expenses` に追加 → 一覧表示・削除
   - **DoD**: 1件追加するとテーブル1行増える、削除動作OK

7. **為替レート取得 & 変換**
   - Frankfurter API, 24hキャッシュ
   - `fetchRates(force)` と `convert()`
   - **DoD**: 取得日時とレート日付を表示、NaNが出ない

8. **残高計算**
   - `computeBalances(people, expenses, rates)`
   - 支払者は全額プラス、参加者は均等割マイナス、`settled`は除外
   - **DoD**: 残高合計が概ね0（誤差内）

9. **精算アルゴリズム**
   - 負債最大↔債権最大をマッチング
   - **DoD**: 「誰が誰にいくら払うか」が表示され、残高が±0.01以内

10. **表示整形**
    - `Intl.NumberFormat` で通貨フォーマット
    - 表示通貨切替（EUR/JPY/USD/RON）
    - **DoD**: 切替で残高・精算額が即座に更新

---

## フェーズC：品質を固める
11. **ユニットテスト**（Vitest）
    - `convert` / `computeBalances` / `settle`
    - **DoD**: `npm test` がグリーン

12. **エラーハンドリング & UX**
    - 入力バリデーション、返金済みトグル
    - **DoD**: 異常系でもクラッシュせずメッセージ表示

---

## フェーズD：配布・共有
13. **ビルド & デプロイ**
    - `npm run build` → `dist/` を Vercel/Cloudflare Pages へ
    - **DoD**: 公開URLで動作、iPad/PCから確認可能

14. **任意：PWA化**
    - `vite-plugin-pwa` でオフライン対応
    - **DoD**: キャッシュ後は機内モードでも利用可能

---

## ストレッチ（将来拡張）
- サーバーレスAPIで為替キャッシュ
- Supabaseで認証＋履歴保存
- Realtime同期（Supabase Realtime / Ably）
- 係数割り、タグ/用途集計、CSVエクスポート

---

## 作業の進め方
- ステップごとに **小さくコミット → ブラウザ確認 → iPad確認**
- バグは **UIより先にロジックのテスト**で潰す
- 迷ったら「MVPのDoD」を優先する

---

