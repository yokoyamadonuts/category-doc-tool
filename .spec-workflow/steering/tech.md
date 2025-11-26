# Technology Stack

## Project Type

**Category Documentation Tool (CatDoc)** は、CLIツールとWeb Dashboardを組み合わせたハイブリッド型アプリケーションです。コマンドラインでドキュメント管理・検証を行い、Webダッシュボードでグラフ可視化とリアルタイム監視を提供します。

## Core Technologies

### Primary Language(s)
- **Backend**: Go 1.21+
  - 理由: 高速な実行、並行処理、型安全、シンプルなデプロイ
  - Runtime: Go標準ランタイム
  - Package Manager: Go modules
- **Frontend**: TypeScript 5.x
  - 理由: 型安全なフロントエンド開発、React/D3との親和性
  - Runtime: Node.js 18+
  - Package Manager: npm/pnpm

### Key Dependencies/Libraries

#### Backend (Go)
- **github.com/spf13/cobra**: CLI framework
- **encoding/json**: データ永続化（標準ライブラリ）
- **net/http**: WebSocket/HTTP server（標準ライブラリ）
- **gorilla/websocket**: リアルタイム通信
- **graphviz (optional)**: グラフレンダリング

#### Frontend (TypeScript/React)
- **React 18**: UI framework
- **React Flow**: グラフ可視化・インタラクティブ編集
- **Tailwind CSS**: スタイリング
- **Vite**: 高速ビルドツール
- **WebSocket API**: リアルタイム更新受信

### Application Architecture

**3層アーキテクチャ + Event-Driven**

```
┌─────────────────┐
│   CLI Layer     │ ← cobra-based commands
├─────────────────┤
│   Core Logic    │ ← Category theory engine
│  (Domain Model) │   - Object management
│                 │   - Morphism composition
│                 │   - Axiom verification
├─────────────────┤
│   Storage       │ ← File-based persistence
│   (Repository)  │   - JSON storage
│                 │   - In-memory graph cache
├─────────────────┤
│  WebSocket API  │ ← Real-time updates
│   Dashboard     │   - React frontend
└─────────────────┘
```

**Design Patterns**:
- Repository pattern: データアクセス抽象化
- Observer pattern: 変更通知（WebSocket）
- Strategy pattern: 検証アルゴリズム切り替え

### Data Storage

- **Primary storage**: File-based JSON
  - `.catdoc/objects.json`: オブジェクト定義
  - `.catdoc/morphisms.json`: モーフィズム定義
  - `.catdoc/categories.json`: カテゴリメタデータ
- **Caching**: In-memory adjacency list/matrix for graph operations
- **Data formats**: JSON (human-readable, git-friendly)

### External Integrations

- **APIs**: なし（MVPではスタンドアロン）
- **Protocols**:
  - HTTP/WebSocket（ダッシュボード通信）
  - File system（データ永続化）
- **Authentication**: なし（MVPではローカル実行のみ）

### Monitoring & Dashboard Technologies

- **Dashboard Framework**: React 18 + TypeScript
- **Real-time Communication**: WebSocket (gorilla/websocket)
- **Visualization Libraries**:
  - React Flow: インタラクティブグラフ
  - D3.js (optional): カスタムグラフレンダリング
- **State Management**: React hooks (useState, useReducer)

## Development Environment

### Build & Development Tools

- **Build System**:
  - Backend: `go build`, Makefile
  - Frontend: Vite
- **Package Management**:
  - Go: `go mod`
  - Frontend: `npm`/`pnpm`
- **Development workflow**:
  - Backend: `go run` with file watcher
  - Frontend: Vite dev server with HMR

### Code Quality Tools

- **Static Analysis**:
  - Go: `golangci-lint`, `go vet`, `staticcheck`
  - TypeScript: ESLint, TypeScript compiler
- **Formatting**:
  - Go: `gofmt`, `goimports`
  - TypeScript: Prettier
- **Testing Framework**:
  - Go: `testing` (標準), `testify` (assertion)
  - Frontend: Vitest
- **Documentation**:
  - Go: `godoc`
  - TypeScript: TSDoc

### Version Control & Collaboration

- **VCS**: Git
- **Branching Strategy**: GitHub Flow
  - main: 安定版
  - feature/*: 機能開発
- **Code Review Process**: Pull Requestベース

### Dashboard Development

- **Live Reload**: Vite HMR (Hot Module Replacement)
- **Port Management**:
  - Dashboard: 3456 (デフォルト、設定可能)
  - WebSocket: 同一ポート（/ws エンドポイント）
- **Multi-Instance Support**: ポート指定で複数起動可能

## Deployment & Distribution

- **Target Platform(s)**:
  - macOS, Linux, Windows
  - AMD64, ARM64
- **Distribution Method**:
  - Binary release (GitHub Releases)
  - Homebrew (macOS)
  - 将来: `go install` サポート
- **Installation Requirements**:
  - なし（単一バイナリ、フロントエンドバンドル済み）
- **Update Mechanism**: 手動ダウンロード（MVPフェーズ）

## Technical Requirements & Constraints

### Performance Requirements

- **グラフ検証**: 1000ノードのグラフを1秒以内に検証
- **可視化**: 100ノードまでスムーズにレンダリング
- **メモリ使用量**: 500MB以下（通常のドキュメントセット）
- **起動時間**: 1秒以内

### Compatibility Requirements

- **Platform Support**:
  - OS: macOS 11+, Linux (glibc 2.31+), Windows 10+
  - Architecture: AMD64, ARM64
- **Dependency Versions**:
  - Go 1.21+
  - Node.js 18+ (開発時のみ)
- **Standards Compliance**:
  - JSON RFC 8259
  - WebSocket RFC 6455

### Security & Compliance

- **Security Requirements**:
  - ローカルファイルシステムのみアクセス
  - WebSocketは127.0.0.1のみバインド
  - ユーザー入力のサニタイズ（XSS対策）
- **Compliance Standards**: なし（内部ツール想定）
- **Threat Model**:
  - ローカル実行のみ
  - 悪意のあるJSONファイルの読み込み防止

### Scalability & Reliability

- **Expected Load**:
  - ユーザー: 1人（ローカル実行）
  - ドキュメント: 10-1000オブジェクト
  - モーフィズム: 10-5000エッジ
- **Availability Requirements**: N/A（ローカルツール）
- **Growth Projections**:
  - Phase 2: 10,000ノード対応
  - Phase 3: マルチユーザー/サーバー版

## Technical Decisions & Rationale

### Decision Log

1. **Go for Backend**
   - 理由: 高速、並行処理、シングルバイナリデプロイ
   - 代替案: Rust（学習コスト高）、Python（パフォーマンス低）
   - トレードオフ: Goのジェネリクスサポートが限定的

2. **React Flow for Visualization**
   - 理由: インタラクティブなグラフ編集、優れたパフォーマンス
   - 代替案: D3.js（低レベル、実装コスト高）、Cytoscape.js（古い）
   - トレードオフ: React依存、バンドルサイズ増加

3. **File-based JSON Storage**
   - 理由: Git連携、人間可読、外部DBなし
   - 代替案: SQLite（複雑）、YAML（パース遅い）
   - トレードオフ: 大規模データでパフォーマンス低下

4. **TDD with Gate-A/B/C Workflow**
   - 理由: spec-workflow-mcp統合、品質保証
   - Gate-A: テスト先行で設計検証
   - Gate-B: 実装完了の明確な基準
   - Gate-C: リファクタリングの安全性

## TDD Workflow Integration

### Test-Driven Development Practices

- **Gate-A (RED)**:
  - すべてのテストが失敗することを確認
  - 要件から直接テストケースを作成
  - カバレッジ: 各公開API/関数に対応するテスト

- **Gate-B (GREEN)**:
  - すべてのテストをパスする最小限の実装
  - カバレッジ目標: 80%以上
  - パフォーマンステスト含む

- **Gate-C (REFACTOR)**:
  - コード品質改善（DRY, SOLID原則）
  - `golangci-lint`ですべての警告解消
  - テストスイート実行時間: 10秒以内維持

### Testing Strategy

- **Unit Tests**: すべてのコアロジック
- **Integration Tests**: CLI コマンドのE2Eテスト
- **Property-based Tests**: 圏の公理検証（ランダム入力）
- **Benchmark Tests**: グラフアルゴリズムの性能測定

## Known Limitations

- **グラフサイズ**: MVPでは1000ノードまで最適化
  - 影響: 大規模プロジェクトで遅延発生
  - 将来: インデックス最適化、段階的読み込み

- **並行編集**: 複数プロセスからの同時編集未対応
  - 影響: ファイルロック競合のリスク
  - 将来: ロックメカニズム、サーバー版で解決

- **可視化**: 100ノード超でブラウザが重くなる可能性
  - 影響: UX低下
  - 将来: 仮想化、クラスタリング表示
