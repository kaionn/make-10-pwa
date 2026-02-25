# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「Make 10」パズルゲームの PWA。4つの数字と四則演算・括弧を使って10を作るゲーム。
モバイルファースト、オフライン対応。

## 技術スタック

- Vite + React + TypeScript
- Tailwind CSS
- vite-plugin-pwa（Service Worker、オフラインキャッシュ）

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # ビルド結果プレビュー
```

## アーキテクチャ

- `src/components/` — UI コンポーネント（Button, Display, Keypad 等）
- `src/hooks/` — ゲームロジック用カスタムフック（useMake10 等）
- `src/App.tsx` — メイン画面
- `vite.config.ts` — PWA プラグイン設定含む

ゲームロジックは UI から分離し、カスタムフックに集約する設計。

## ゲームロジックの要点

- 0〜9 から4つ選出、必ず10が作れる組み合わせのみ出題
- 4つの数字は各1回ずつすべて使い切る必要がある
- 判定: 全数字使用チェック → 文法チェック → 計算結果が10か判定
- `×` → `*`、`÷` → `/` に変換して評価

## PWA 設定

- `registerType: 'autoUpdate'`
- 静的アセットのオフラインキャッシュ必須

## UI 制約

- ボタン最小サイズ 44x44px
- `user-select: none` と `touch-action: manipulation` を適用
- 縦向きスマートフォン前提のレイアウト
