# INT-000 UNIT-001: QRコード備品管理アプリ（コア実装）

## Purpose
備品管理アプリのコア機能をフルスタックで実装する。
US-001〜006をすべてカバーする単一Unitとして構成する（PoC）。

## Scope（In）
- DBスキーマ（equipment・loans テーブル）
- 備品CRUD API（Server Actions）
- 貸出・返却 API（Server Actions）
- 備品一覧ページ（`/`）
- 備品登録ページ（`/equipment/new`）
- 備品詳細・QRコードページ（`/equipment/[id]`）
- QRスキャンページ（`/scan`）
- 貸出・返却ページ（`/equipment/[id]/loan`）
- 履歴ページ（`/loans`）

## Scope（Out）
- 認証・認可
- NFR（パフォーマンス・セキュリティ詳細）

## Dependencies
- NeonDB（DATABASE_URL or NETLIFY_DATABASE_URL）
- qrcode.react（QRコード生成）
- html5-qrcode（カメラスキャン）

## User Stories
- US-001, US-002, US-003, US-004, US-005, US-006
