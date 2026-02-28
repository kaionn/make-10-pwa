# Architecture: Make 10 -- v2 アニメーション強化 & ギブアップ機能

## 1. 変更の概要

v2 では以下の 3 つの機能を追加する:

1. ギブアップ機能（答え参照 + 次の問題へ進む）
2. 答え生成ロジック（solver モジュール）
3. アニメーション強化（アンビエント背景、文字バウンス、アイドルアニメーション、祝福バリエーション）

既存のゲームロジック（正解判定、スコア計算、式パース）には手を入れない。UI 層の拡張と、新規 solver モジュールの追加が中心となる。

## 2. 変更しないもの

以下のファイルは変更対象外:

- `src/logic/parser.ts` -- 式パーサー
- `src/logic/validator.ts` -- 式バリデーター
- `src/logic/generatePuzzle.ts` -- 問題生成
- `src/data/solvableCombinations.ts` -- 解ける組み合わせデータ
- `vite.config.ts` -- PWA 設定を含むビルド設定
- `src/main.tsx` -- エントリーポイント
- `index.html` -- Google Fonts の link タグは追加済み
- `src/components/OperatorPad.tsx` -- 変更なし

## 3. 新規モジュール

### 3.1 src/logic/solver.ts -- 答え生成ロジック

与えられた 4 つの数字に対して、10 を作る有効な式をすべて算出する。

アルゴリズム:
1. 4 つの数字の全順列を生成（最大 24 通り）
2. 3 つの演算子スロットに対して、4 種類の演算子（+, -, x, /）の全組み合わせを生成（64 通り）
3. 括弧パターンを網羅（括弧なし + 5 種類の括弧配置 = 6 パターン）
4. 各組み合わせを評価し、結果が 10 になるものを収集
5. 重複を除去し、なるべくシンプルな式を優先してソート

括弧パターン:
- `a ○ b ○ c ○ d` （括弧なし）
- `(a ○ b) ○ c ○ d`
- `a ○ (b ○ c) ○ d`
- `a ○ b ○ (c ○ d)`
- `(a ○ b) ○ (c ○ d)`
- `(a ○ b ○ c) ○ d` → `((a ○ b) ○ c) ○ d` と `(a ○ (b ○ c)) ○ d`
- `a ○ (b ○ c ○ d)` → `a ○ ((b ○ c) ○ d)` と `a ○ (b ○ (c ○ d))`

式の表記:
- 全角演算子（×, ÷）を使用（ユーザー入力と同じ表記）
- 不要な括弧は除去してシンプルに表示

API:
```typescript
export function solve(numbers: number[]): string[]
```

パフォーマンス:
- 出題時に事前計算（generatePuzzle 呼び出し直後）
- 最悪ケースでも 24 x 64 x 11 = 16,896 パターンの評価のみ
- ギブアップタップ時はゼロ遅延で表示

### 3.2 src/components/AmbientBackground.tsx -- 背景浮遊装飾

純粋な CSS アニメーションで実装する背景装飾コンポーネント。

構成:
- 8 個の装飾要素（丸、星、三角形）を `position: fixed` で配置
- `pointer-events: none` / `z-index: 0` でインタラクションをブロックしない
- `aria-hidden="true"` でスクリーンリーダーから隠す
- `will-change: transform` で GPU レイヤーに昇格

形状の実装:
- 丸: `border-radius: 50%`
- 星: CSS `clip-path` polygon
- 三角形: CSS `clip-path` polygon

### 3.3 src/components/GiveUpConfirmDialog.tsx -- 確認ダイアログ

ギブアップの誤タップ防止用モーダルダイアログ。

Props:
- `open: boolean` -- 表示/非表示
- `onConfirm: () => void` -- 「こたえを みる」タップ
- `onCancel: () => void` -- 「まだ がんばる」タップ

アクセシビリティ:
- `role="dialog"` / `aria-modal="true"` / `aria-labelledby`

### 3.4 src/hooks/useIdle.ts -- アイドル検出フック

操作がない時間を検出する専用フック。

```typescript
export function useIdle(timeoutMs: number): {
  isIdle: boolean;
  resetIdle: () => void;
}
```

実装:
- `useRef` + `setInterval(1000ms)` で最後の操作からの経過時間を追跡
- `timeoutMs`（デフォルト 5000ms）を超えるとアイドル状態
- `resetIdle()` で即座にリセット

## 4. 既存ファイルの変更

### 4.1 src/hooks/useMake10.ts

追加する状態:
- `solutions: string[]` -- 現在の問題の正解式（出題時に事前計算）
- `showGiveUpConfirm: boolean` -- 確認ダイアログの表示/非表示
- `isShowingAnswer: boolean` -- 答え表示オーバーレイの表示/非表示

追加する操作:
- `requestGiveUp()` -- 確認ダイアログを表示
- `cancelGiveUp()` -- 確認ダイアログを閉じる
- `confirmGiveUp()` -- 答えを表示
- `dismissAnswer()` -- 答え表示を閉じて次の問題へ

既存の Feedback 型を拡張:
- `'correct' | 'incorrect' | 'answer' | null`

### 4.2 src/components/ControlPad.tsx

- グリッドを 3 列 → 4 列に変更
- 先頭に「こたえを みる」ボタンを追加
- `onGiveUp: () => void` prop を追加（オプショナル）

### 4.3 src/components/Display.tsx

- 式テキストを各文字ごとに `<span>` でラップし、新規文字に `animate-char-bounce` を適用
- `answer` prop（オプショナル）を追加し、答え表示時に表示
- `isIdle` prop でプレースホルダーのフェードアニメーションを制御
- `allNumbersUsed` prop で = ボタンパルスの判定に利用（ControlPad に渡す用途）

### 4.4 src/components/FeedbackOverlay.tsx

- `feedback` 型に `'answer'` を追加
- 答え表示オーバーレイ（📖、sky-to-indigo グラデーション、答えカード）
- 正解メッセージのランダムバリエーション（5 種類）
- 祝福演出のバリエーション（confetti / starburst / sparkle からランダム選択）

### 4.5 src/components/NumberPad.tsx

- `isIdle` prop を追加（オプショナル）
- アイドル時に未使用ボタンに `animate-idle-bounce` を適用
- `animation-delay` をボタンごとにずらし（0s, 0.5s, 1.0s, 1.5s）

### 4.6 src/components/Header.tsx

- `isIdle` prop を追加（オプショナル）
- アイドル時に星マークに `animate-star-twinkle` を適用

### 4.7 src/index.css

追加する keyframes:
- `@keyframes ambient-float-1` / `ambient-float-2` / `ambient-float-3` -- 背景装飾の浮遊
- `@keyframes char-bounce` -- 式入力時の文字バウンス
- `@keyframes pulse-glow` -- = ボタンのパルス
- `@keyframes idle-bounce` -- アイドル時のボタン揺れ
- `@keyframes placeholder-fade` -- プレースホルダーの明滅
- `@keyframes starburst` -- 星放射の祝福演出
- `@keyframes sparkle` -- キラキラの祝福演出
- `@keyframes star-twinkle` -- ヘッダー星の瞬き

既存の `@media (prefers-reduced-motion)` ルールですべて無効化される。

### 4.8 src/App.tsx

- `AmbientBackground` をルートの最初の子要素として配置
- `GiveUpConfirmDialog` を条件付きレンダリング
- `useIdle` フックを使用してアイドル状態を管理
- 各コンポーネントに `isIdle` / `allNumbersUsed` / `answer` 等の新 props を渡す

## 5. 状態管理フロー

### 5.1 ギブアップフロー

```
入力中
  ├→ requestGiveUp()  → showGiveUpConfirm = true
  │   ├→ cancelGiveUp()   → showGiveUpConfirm = false （入力中に戻る）
  │   └→ confirmGiveUp()  → showGiveUpConfirm = false, feedback = 'answer'
  │       └→ dismissAnswer()  → feedback = null, 次の問題生成
```

### 5.2 アイドル検出フロー

```
任意の操作 → resetIdle() → isIdle = false
5秒間操作なし → isIdle = true
  ├→ NumberPad: 未使用ボタンが idle-bounce
  ├→ Header: 星が star-twinkle
  └→ Display: プレースホルダーが placeholder-fade
```

## 6. アニメーション戦略

すべてのアニメーションを CSS キーフレーム + Tailwind トランジションで実装する。JS アニメーションライブラリは追加しない。

| アニメーション | 実装方法 | トリガー | v1/v2 |
|---------------|---------|---------|-------|
| ボタンタップ | `active:scale-[0.92]` | CSS `:active` | v1 |
| スコアバウンス | `@keyframes score-bounce` | score 変化 | v1 |
| 数字ポップイン | `@keyframes pop-in` | puzzleKey 変化 | v1 |
| 紙吹雪 | `@keyframes confetti-fall-v2` | 正解判定時 | v1 |
| アンビエント浮遊 | `@keyframes ambient-float-*` | 常時 | v2 |
| 文字バウンス | `@keyframes char-bounce` | 式に文字追加時 | v2 |
| パルスグロー | `@keyframes pulse-glow` | 全数字使用時 | v2 |
| アイドルバウンス | `@keyframes idle-bounce` | 5 秒間操作なし | v2 |
| プレースホルダーフェード | `@keyframes placeholder-fade` | 式が空 + アイドル | v2 |
| 星キラキラ | `@keyframes star-twinkle` | アイドル時 | v2 |
| スターバースト | `@keyframes starburst` | 正解時（ランダム） | v2 |
| キラキラ | `@keyframes sparkle` | 正解時（ランダム） | v2 |

`prefers-reduced-motion: reduce` ですべて無効化。

## 7. パフォーマンス考慮

- solver の計算は出題時に完了（ギブアップ時はゼロ遅延）
- アンビエント背景: CSS-only、`will-change: transform`、要素数 8 個以下
- 文字バウンス: `<span>` ラップだが React の reconciliation で最小 DOM 更新
- アイドル検出: `setInterval(1000ms)` の軽微な負荷
- 祝福演出: CSS ベース（JS ライブラリ不使用）
- 全アニメーション: `transform` と `opacity` のみ変化（layout/paint 再計算なし）

## 8. アクセシビリティ

- ギブアップボタン: `aria-label="こたえを みる"`
- 確認ダイアログ: `role="dialog"` / `aria-modal="true"` / `aria-labelledby`
- 答え表示: `aria-live="polite"`
- アンビエント背景: `aria-hidden="true"`
- 祝福演出要素: `aria-hidden="true"`
- `prefers-reduced-motion` で全アニメーション無効化
