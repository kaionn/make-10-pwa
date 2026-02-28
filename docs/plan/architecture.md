# Architecture: Make 10 -- v3 難易度プログレッション

## 1. 変更の概要

v3 では段階的な難易度システムを追加する:

1. 3段階の難易度レベル（超かんたん / かんたん / ふつう）
2. レベル 1「超かんたん」: 穴埋め形式の出題ロジックと UI
3. レベル 2「かんたん」: 部分組み立て形式の出題ロジックと UI
4. レベル 3「ふつう」: 現行と同一（変更なし）
5. レベルアップ演出オーバーレイ
6. ヘッダーにレベル表示とプログレスドット

スコア（星の数）に基づく自動昇格のみ。手動でのレベル選択は設けない。レベルダウンもない。

## 2. 変更しないもの

以下のファイルは変更対象外:

- `src/logic/parser.ts` -- 式パーサー
- `src/logic/validator.ts` -- 式バリデーター
- `src/logic/generatePuzzle.ts` -- 問題生成（全レベルで使用）
- `src/logic/solver.ts` -- 答え生成ロジック（全レベルで使用）
- `src/data/solvableCombinations.ts` -- 553 エントリの解ける組み合わせデータ
- `vite.config.ts` -- PWA 設定を含むビルド設定
- `src/main.tsx` -- エントリーポイント
- `index.html` -- 変更なし
- `src/components/OperatorPad.tsx` -- 変更なし
- `src/components/AmbientBackground.tsx` -- 変更なし
- `src/components/GiveUpConfirmDialog.tsx` -- 変更なし
- `src/components/FeedbackOverlay.tsx` -- 変更なし

## 3. 難易度レベルシステム設計

### 3.1 レベル定義

| レベル | 名前 | 星の範囲 | 表示テキスト | 色 |
|--------|------|----------|------------|-----|
| 1 | 超かんたん | 0〜4 | ちょうかんたん | emerald-500 |
| 2 | かんたん | 5〜9 | かんたん | sky-500 |
| 3 | ふつう | 10〜 | ふつう | violet-500 |

### 3.2 レベル計算ロジック

```typescript
type Level = 1 | 2 | 3;

function getLevel(score: number): Level {
  if (score < 5) return 1;
  if (score < 10) return 2;
  return 3;
}
```

レベルは一方向のみ昇格する。レベルアップは星 5 到達時（1 → 2）と星 10 到達時（2 → 3）に発生する。

### 3.3 レベル別 UI 構成

| ゾーン | レベル 1 | レベル 2 | レベル 3 |
|--------|---------|---------|---------|
| Header | レベル名 + プログレスドット + スコア | 同左 | 同左（ドットなし） |
| Display | 穴埋め式 + BlankSlot + "= 10" | 通常の式表示 | 通常の式表示 |
| Input | ChoiceButtons | NumberPad(4列, 2つdisabled) + OperatorPad + ControlPad | NumberPad + OperatorPad + ControlPad |
| ControlPad | 非表示 | 表示（ギブアップあり） | 表示（ギブアップあり） |

## 4. 新規モジュール

### 4.1 src/logic/generateFillInBlank.ts -- 穴埋め問題生成

solver が算出した正解式を 1 つ選び、空欄を 1 箇所作成する。

```typescript
export interface FillInBlankPuzzle {
  numbers: number[];           // 出題の 4 数字
  expression: string;          // 空欄を含む表示用文字列（空欄は placeholder で表現）
  tokens: ExpressionToken[];   // 式のトークン列（表示用）
  blankIndex: number;          // tokens 内の空欄位置
  blankType: 'operator' | 'number';
  choices: string[];           // 選択肢（3〜4 個）
  correctAnswer: string;       // 正解の文字列
  solutions: string[];         // 元の正解式一覧
}

export interface ExpressionToken {
  type: 'number' | 'operator' | 'paren';
  value: string;
  isBlank: boolean;
}
```

ロジック:
1. generatePuzzle() で 4 数字を選出
2. solve() で正解式を算出
3. 最もシンプルな正解式（括弧なし or 括弧最少）を選択
4. 式をトークンに分解し、ランダムに 1 箇所を空欄にする
5. 空欄が演算子の場合: 選択肢は 4 つの演算子（+, -, x, /）
6. 空欄が数字の場合: 正解 + ダミー 2〜3 つ（元の 4 数字から選択 + 問題に含まれない数字）

### 4.2 src/logic/generatePartialPuzzle.ts -- 部分組み立て問題生成

solver の正解式から 2 つの数字を配置済みにした状態を生成する。

```typescript
export interface PartialPuzzle {
  numbers: NumberEntry[];        // 4 数字（うち 2 つが used: true）
  prefilledIndices: number[];    // 配置済みの numbers インデックス
  solutions: string[];           // 正解式一覧
}
```

ロジック:
1. generatePuzzle() で 4 数字を選出
2. solve() で正解式を算出
3. 4 つの数字のうち 2 つをランダムに選んで used: true にする
4. 配置済みの数字は NumberPad 上で disabled 表示

### 4.3 src/components/ChoiceButtons.tsx -- 選択肢ボタン

Level 1 で表示する選択肢ボタン群。

Props:
- `choices: string[]` -- 選択肢（3〜4 個）
- `onSelect: (index: number) => void` -- 選択時コールバック
- `puzzleKey: string` -- アニメーションリセット用キー

レイアウト: 2 列グリッド、ボタン高さ 80px、4 色ポップカラー（rose, sky, emerald, amber）。

### 4.4 src/components/LevelIndicator.tsx -- レベル表示

ヘッダー内に配置するレベル名とプログレスドット。

Props:
- `level: 1 | 2 | 3`
- `score: number`

表示:
- レベル名テキスト（ひらがな）
- プログレスドット（レベル 1,2: 5 個 / レベル 3: なし）

### 4.5 src/components/LevelUpOverlay.tsx -- レベルアップ演出

レベル昇格時の全画面祝福オーバーレイ。

Props:
- `newLevel: 2 | 3`
- `onDismiss: () => void`

要素:
- 紫系グラデーション背景
- 「レベルアップ!」テキスト
- 新レベル名バッジ
- 励ましメッセージ（レベルに応じた文言）
- キラキラパーティクル
- タップで閉じる

## 5. 既存ファイルの変更

### 5.1 src/hooks/useMake10.ts

追加する状態:
- `level: 1 | 2 | 3` -- 現在のレベル（score から導出）
- `showLevelUp: boolean` -- レベルアップオーバーレイの表示
- `newLevel: 2 | 3 | null` -- 昇格先レベル
- `fillInBlankPuzzle: FillInBlankPuzzle | null` -- Level 1 用パズルデータ
- `partialPuzzle: PartialPuzzle | null` -- Level 2 用パズルデータ

追加する操作:
- `selectChoice(index: number)` -- Level 1 の選択肢タップ
- `dismissLevelUp()` -- レベルアップオーバーレイを閉じて次の問題へ

変更するロジック:
- `createPuzzle` がレベルに応じた問題を生成
- `judge` でレベルアップ判定を追加
- `nextPuzzle` でレベルに応じた問題を再生成
- `dismissFeedback` でレベルアップチェックを追加

localStorage:
- 既存の `make10-score` キーでスコアを永続化（変更なし）

### 5.2 src/components/Header.tsx

- LevelIndicator コンポーネントをインポートして配置
- Props に `level` と `score` を追加（score は既存）

### 5.3 src/components/Display.tsx

- Level 1 表示モード追加: ExpressionToken 列を受け取り、BlankSlot を含む式を表示
- Level 2 表示: 通常の式表示と同じ（プレースホルダーのみ変更）
- Level 3: 変更なし

### 5.4 src/App.tsx

- レベルに応じた条件分岐で入力エリアを切り替え
- Level 1: Display(穴埋め) + ChoiceButtons
- Level 2: Display + NumberPad(4列, 2つ disabled) + OperatorPad + ControlPad
- Level 3: 現行と同一
- LevelUpOverlay を条件付きレンダリング

### 5.5 src/index.css

追加する keyframes:
- `@keyframes blank-pulse` -- 空欄スロットの枠線パルス
- `@keyframes choice-shake` -- 不正解時の選択肢シェイク
- `@keyframes level-up-pop` -- レベルアップカードのポップイン
- `@keyframes dot-pop` -- プログレスドットのポップ

すべて `prefers-reduced-motion: reduce` で無効化。

## 6. 状態管理フロー

### 6.1 レベル判定フロー

```
score 変化
  → getLevel(score) で新レベルを算出
  → 新レベル > 前レベル ?
    → yes: showLevelUp = true, newLevel = 新レベル
    → no: 通常遷移
```

### 6.2 Level 1 プレイフロー

```
問題生成 → FillInBlankPuzzle を作成
  → Display に穴埋め式を表示
  → ChoiceButtons に選択肢を表示
  → selectChoice(index)
    → 正解 ? → score+1 → feedback='correct' → レベルアップ判定
    → 不正解 ? → 選択肢をシェイク（同じ問題で再挑戦）
```

### 6.3 Level 2 プレイフロー

```
問題生成 → PartialPuzzle を作成
  → NumberPad に 4 数字（2つ disabled）
  → OperatorPad + ControlPad 表示
  → 通常の式入力フロー
  → judge() → 正解/不正解判定 → レベルアップ判定
```

### 6.4 Level 3 プレイフロー

```
現行と同一。変更なし。
```

### 6.5 レベルアップフロー

```
正解 → score+1 → feedback='correct'
  → dismissFeedback()
    → レベルアップ判定
      → yes: showLevelUp = true（正解オーバーレイの後）
      → no: 次の問題生成
  → dismissLevelUp()
    → showLevelUp = false
    → 新しいレベルの問題を生成
```

## 7. アニメーション戦略

v2 の全アニメーションを維持したまま、v3 のアニメーションを追加する。

| アニメーション | 実装方法 | トリガー | バージョン |
|---------------|---------|---------|-----------|
| 空欄パルス | `@keyframes blank-pulse` | 常時（Level 1 の空欄） | v3 |
| 選択肢シェイク | `@keyframes choice-shake` | 不正解選択時 | v3 |
| レベルアップポップ | `@keyframes level-up-pop` | レベル昇格時 | v3 |
| ドットポップ | `@keyframes dot-pop` | スコア加算時 | v3 |

`prefers-reduced-motion: reduce` ですべて無効化。

## 8. パフォーマンス考慮

- 穴埋め問題の生成: solver の計算は出題時に完了。選択肢生成も出題時
- Level 2 の部分組み立て: 既存の solver + 数字の pre-selection のみ
- レベル判定: 単純な数値比較（O(1)）
- レベルアップ演出: CSS ベース（JS ライブラリ不使用）
- 全アニメーション: `transform` と `opacity` のみ変化

## 9. アクセシビリティ

- 空欄スロット: `aria-label="えらんでね"`
- 選択肢ボタン: `aria-label` 付与（演算子: 「たす」「ひく」「かける」「わる」、数字: そのまま）
- レベルアップオーバーレイ: `role="dialog"` / `aria-modal="true"` / `aria-label="レベルアップ"`
- プログレスドット: `aria-label` で進捗を通知
- `prefers-reduced-motion` で全アニメーション無効化
