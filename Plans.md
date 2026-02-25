# Plans.md — Make 10 PWA

## 設計判断

| 項目 | 判断 | 理由 |
|------|------|------|
| 問題生成 | 事前計算テーブル（定数配列） | 715通り中 ~660通り。実行時コストゼロ、テスト容易 |
| 数式評価 | 再帰下降パーサー | 安全性、浮動小数点制御、テスタビリティ |
| 祝賀UI | CSS アニメーションのみ | 軽量。canvas-confetti 等のライブラリ不要 |
| スタイリング | Tailwind CSS | Base.md の技術スタック指定 |

## 機能優先度マトリクス

### Required（MVP）
- プロジェクト初期化（Vite + React + TS + Tailwind + PWA）
- 事前計算テーブル（10が作れる4数字の全組み合わせ）
- 数式パーサー（四則演算 + 括弧）
- ゲームロジックフック（useMake10）
- UI コンポーネント一式（Header, Display, NumberPad, OperatorPad, ControlPad）
- 判定ロジック（全数字使用チェック + 結果 = 10）
- PWA 設定（Service Worker, manifest, オフラインキャッシュ）

### Recommended
- 正解/不正解のフィードバック UI（CSS アニメーション）
- スコア永続化（localStorage）

### Optional（後回し可）
- アプリアイコン作成
- ダークモード対応

---

## Phase 1: プロジェクト初期化 [feature:setup]

- [ ] `cc:TODO` Vite + React + TypeScript プロジェクトをスキャフォールド
- [ ] `cc:TODO` Tailwind CSS をセットアップ
- [ ] `cc:TODO` vite-plugin-pwa を設定（manifest, registerType: autoUpdate, オフラインキャッシュ）
- [ ] `cc:TODO` グローバル CSS（user-select: none, touch-action: manipulation）
- [ ] `cc:TODO` ダミーアイコン配置（public/icons/）

## Phase 2: ゲームロジック（純粋関数） [feature:tdd]

- [ ] `cc:TODO` 事前計算テーブル生成スクリプトを作成し、結果を `src/data/solvableCombinations.ts` に定数として書き出す
- [ ] `cc:TODO` 数式パーサー `src/logic/parser.ts` — トークナイズ → 再帰下降パーサー → AST → 評価
  - トークン: 数字(0-9), 演算子(+,-,×,÷), 括弧
  - 浮動小数点誤差対策: `Math.abs(result - 10) < 1e-9`
- [ ] `cc:TODO` バリデーション `src/logic/validator.ts` — 4数字すべて使用チェック、構文チェック
- [ ] `cc:TODO` 問題生成 `src/logic/generatePuzzle.ts` — テーブルからランダム選出
- [ ] `cc:TODO` Phase 2 のユニットテスト（Vitest）
  - パーサー: 基本四則演算、括弧、除算誤差、不正入力
  - バリデーション: 未使用数字検出、余分な数字検出
  - 問題生成: 返される4数字が必ずテーブルに存在すること

## Phase 3: React フック + 状態管理

- [ ] `cc:TODO` `src/hooks/useMake10.ts` — ゲーム全体の状態管理フック
  - state: expression（入力式）, numbers（4数字 + used フラグ）, score, feedback
  - actions: appendDigit, appendOperator, appendBracket, backspace, clear, judge
  - judge 時: validator → parser → 結果判定 → フィードバック → 次の問題
- [ ] `cc:TODO` スコア永続化（localStorage read/write）

## Phase 4: UI コンポーネント

- [ ] `cc:TODO` `Header` — タイトル + スコア表示
- [ ] `cc:TODO` `Display` — 入力式の表示（大きめフォント）
- [ ] `cc:TODO` `NumberPad` — 4つの数字ボタン（2×2 グリッド、used 時 disabled）
- [ ] `cc:TODO` `OperatorPad` — +, -, ×, ÷, (, ) ボタン
- [ ] `cc:TODO` `ControlPad` — BS, C, Enter ボタン
- [ ] `cc:TODO` `FeedbackOverlay` — 正解/不正解のオーバーレイ（CSS アニメーション）
- [ ] `cc:TODO` `App.tsx` で全コンポーネントを組み立て、useMake10 と接続

## Phase 5: 統合・仕上げ

- [ ] `cc:TODO` モバイルレイアウト調整（100dvh、ボタンサイズ 44px 以上）
- [ ] `cc:TODO` PWA 動作確認（ビルド → プレビュー → Service Worker 登録確認）
- [ ] `cc:TODO` E2E 手動テスト（数字選択 → 式入力 → 判定フロー）
