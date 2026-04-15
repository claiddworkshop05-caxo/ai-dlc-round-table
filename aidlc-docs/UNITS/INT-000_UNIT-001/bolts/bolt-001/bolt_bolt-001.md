# Bolt: bolt-001

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-001
- Target User Stories: US-001, US-002, US-003, US-004, US-005, US-006
- Goal (Definition of Done): QRコード備品管理アプリのコア機能が動作すること

## 1. Scope
### In Scope
- DBスキーマ定義（equipment・loans）+ マイグレーション
- Server Actions（備品CRUD・貸出・返却）
- 全ページ実装（一覧・登録・詳細・スキャン・貸出返却・履歴）
- QRコード生成（qrcode.react）
- QRコードスキャン（html5-qrcode）

### Out of Scope
- 認証・テスト・NFR

## 2. Dependencies & Prerequisites
- Dependencies: qrcode.react, html5-qrcode パッケージ
- Prerequisites: DATABASE_URL が設定済みであること

## 3. Design Diff
- Domain: equipment テーブル（id, name, description, category, status, created_at）
- Domain: loans テーブル（id, equipment_id, borrower_name, action, recorded_at, notes）
- API: Server Actions で CRUD / 貸出返却
- Component: QrCode（クライアント）、Scanner（クライアント）

## 4. Implementation & Tests
- `src/schema.ts` に equipment・loans テーブル追加
- `drizzle/` にマイグレーション SQL 追加
- `app/` 以下にページ実装
- `components/` に QrCode・Scanner コンポーネント追加

## 5. Deployment Units
- Netlify / Vercel（Next.js）
- NeonDB

## 6. Approval Gate
- [x] Scope is agreed upon
- [x] Design diff is appropriate
- [x] Test viewpoints are appropriate
- [x] Deployment/rollback is appropriate

Approver: User
Approval Date: 2026-04-15
