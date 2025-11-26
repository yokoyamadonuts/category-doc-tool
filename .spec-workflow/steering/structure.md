# Project Structure

## Directory Organization

```
category-doc-tool/
├── cmd/
│   └── catdoc/                 # CLI entry point
│       └── main.go
├── internal/
│   ├── category/               # 圏論コアロジック
│   │   ├── object.go           # オブジェクト定義
│   │   ├── morphism.go         # モーフィズム定義
│   │   ├── category.go         # カテゴリ定義
│   │   ├── composition.go      # 合成ロジック
│   │   └── verification.go     # 公理検証
│   ├── storage/                # データ永続化
│   │   ├── repository.go       # Repository interface
│   │   ├── json_store.go       # JSON実装
│   │   └── cache.go            # インメモリキャッシュ
│   ├── graph/                  # グラフアルゴリズム
│   │   ├── builder.go          # グラフ構築
│   │   ├── traversal.go        # 探索アルゴリズム
│   │   └── export.go           # DOT/JSON出力
│   ├── cli/                    # CLIコマンド
│   │   ├── init.go             # catdoc init
│   │   ├── add.go              # catdoc add
│   │   ├── verify.go           # catdoc verify
│   │   ├── graph.go            # catdoc graph
│   │   └── dashboard.go        # catdoc dashboard
│   └── dashboard/              # Webダッシュボード
│       ├── server.go           # HTTP/WebSocketサーバー
│       ├── handler.go          # HTTPハンドラー
│       ├── websocket.go        # リアルタイム通信
│       └── static/             # フロントエンドバンドル
├── web/                        # フロントエンドソース
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphView.tsx   # React Flowグラフ
│   │   │   ├── ObjectList.tsx  # オブジェクト一覧
│   │   │   └── MorphismList.tsx # モーフィズム一覧
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts # WebSocket hook
│   │   │   └── useCategory.ts  # カテゴリデータhook
│   │   ├── types/
│   │   │   └── category.ts     # TypeScript型定義
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── pkg/                        # 公開API（将来の拡張用）
│   └── catdoc/
│       └── api.go              # 外部から利用可能なAPI
├── test/
│   ├── fixtures/               # テストデータ
│   │   ├── simple_category.json
│   │   └── complex_category.json
│   └── integration/            # 統合テスト
│       └── cli_test.go
├── .catdoc/                    # プロジェクトデータ（gitignore）
│   ├── objects.json
│   ├── morphisms.json
│   └── categories.json
├── .spec-workflow/             # spec-workflow管理
│   ├── steering/
│   └── specs/
├── docs/                       # ドキュメント
│   ├── category-theory.md      # 圏論の基礎
│   ├── api.md                  # API リファレンス
│   └── examples/               # 使用例
├── scripts/                    # ビルド/開発スクリプト
│   ├── build.sh                # ビルドスクリプト
│   ├── test.sh                 # テストスクリプト
│   └── dev.sh                  # 開発モード起動
├── Makefile                    # ビルドタスク
├── go.mod
├── go.sum
└── README.md
```

## Naming Conventions

### Files (Go)
- **Packages**: `lowercase` (例: `category`, `storage`)
- **Source files**: `snake_case.go` (例: `object.go`, `json_store.go`)
- **Test files**: `[filename]_test.go` (例: `object_test.go`)
- **Interfaces**: `[Name].go` または `interface.go`

### Files (TypeScript)
- **Components**: `PascalCase.tsx` (例: `GraphView.tsx`)
- **Hooks**: `camelCase.ts` (例: `useWebSocket.ts`)
- **Utilities**: `camelCase.ts` (例: `formatDate.ts`)
- **Types**: `camelCase.ts` or `types.ts`

### Code (Go)
- **Types/Structs**: `PascalCase` (例: `Object`, `Morphism`)
- **Interfaces**: `PascalCase` (例: `Repository`, `Verifier`)
- **Functions/Methods**: `PascalCase` (public), `camelCase` (private)
- **Constants**: `PascalCase` or `UPPER_SNAKE_CASE`
- **Variables**: `camelCase`

### Code (TypeScript)
- **Interfaces/Types**: `PascalCase` (例: `Category`, `GraphNode`)
- **Functions**: `camelCase` (例: `buildGraph`, `verifyAxioms`)
- **Constants**: `UPPER_SNAKE_CASE` or `camelCase`
- **Components**: `PascalCase` (例: `GraphView`)

## Import Patterns

### Go Import Order
```go
import (
    // 1. 標準ライブラリ
    "encoding/json"
    "fmt"
    "os"

    // 2. 外部依存
    "github.com/spf13/cobra"

    // 3. 内部パッケージ
    "github.com/yourusername/catdoc/internal/category"
    "github.com/yourusername/catdoc/internal/storage"
)
```

### TypeScript Import Order
```typescript
// 1. React/外部ライブラリ
import React from 'react';
import { ReactFlow } from 'reactflow';

// 2. 内部モジュール（絶対パス）
import { Category } from '@/types/category';
import { useWebSocket } from '@/hooks/useWebSocket';

// 3. 相対インポート
import { GraphNode } from './types';

// 4. スタイル
import './App.css';
```

## Code Structure Patterns

### Go File Organization
```go
package category

// 1. パッケージドキュメント（重要なパッケージのみ）

// 2. インポート
import (...)

// 3. 定数
const (
    MaxMorphisms = 10000
)

// 4. 型定義
type Object struct {...}
type Morphism struct {...}

// 5. コンストラクタ
func NewObject(...) *Object {...}

// 6. メソッド（レシーバー別にグループ化）
func (o *Object) ID() string {...}
func (o *Object) Validate() error {...}

// 7. パッケージレベル関数
func ComposeMorphisms(...) {...}

// 8. プライベートヘルパー
func validateID(id string) bool {...}
```

### React Component Organization
```typescript
// 1. インポート
import React, { useState, useEffect } from 'react';

// 2. 型定義
interface Props {
  categoryId: string;
}

// 3. コンポーネント
export const GraphView: React.FC<Props> = ({ categoryId }) => {
  // 3.1 State
  const [nodes, setNodes] = useState([]);

  // 3.2 Effects
  useEffect(() => {...}, []);

  // 3.3 Handlers
  const handleNodeClick = (node) => {...};

  // 3.4 Render
  return (...);
};

// 4. ヘルパー（必要なら）
const formatNode = (node) => {...};
```

## Code Organization Principles

1. **Single Responsibility**: 各ファイルは1つの明確な責務を持つ
   - `object.go`: Objectの定義とメソッドのみ
   - `GraphView.tsx`: グラフ表示のみ

2. **Modularity**: 疎結合・高凝集
   - `internal/category`: 圏論ロジック（他に依存しない）
   - `internal/storage`: データ永続化（category に依存）
   - `internal/cli`: コマンド実装（両方に依存）

3. **Testability**: テストしやすい構造
   - インターフェース多用（モック可能）
   - 純粋関数優先
   - 依存注入パターン

4. **Consistency**: プロジェクト全体で統一
   - エラーハンドリング: `error` 型を返す
   - ロギング: 標準 `log` パッケージ使用
   - 設定: 環境変数 + CLIフラグ

## Module Boundaries

### 依存方向
```
cmd/catdoc
    ↓
internal/cli
    ↓
    ├→ internal/category ← コアロジック（依存なし）
    ├→ internal/storage  ← category に依存
    ├→ internal/graph    ← category, storage に依存
    └→ internal/dashboard ← すべてに依存
```

### 公開API vs 内部実装
- **`pkg/catdoc`**: 外部から利用可能な安定したAPI
- **`internal/`**: 内部実装、外部からインポート不可
- **`cmd/catdoc`**: CLIエントリーポイント

### プラットフォーム固有コード
```
internal/
└── storage/
    ├── json_store.go        # 共通実装
    ├── cache_unix.go        # Unix固有
    └── cache_windows.go     # Windows固有
```

## Code Size Guidelines

- **File size**: 300行以下を目安（最大500行）
- **Function/Method size**: 50行以下（最大100行）
- **Cyclomatic complexity**: 10以下
- **Nesting depth**: 4階層以下

### 分割基準
- ファイルが500行超えたら分割検討
- 1つの関数が100行超えたらヘルパーに分割
- 複雑度が高い場合はStrategy patternで分割

## Dashboard Structure

### バックエンド（Go）
```
internal/dashboard/
├── server.go          # HTTPサーバー起動
├── handler.go         # RESTエンドポイント
├── websocket.go       # WebSocket通信
└── static/            # フロントエンドバンドル（ビルド時生成）
```

### フロントエンド（TypeScript/React）
```
web/src/
├── components/
│   ├── layout/        # レイアウトコンポーネント
│   ├── graph/         # グラフ関連
│   └── common/        # 共通UI部品
├── hooks/             # カスタムフック
├── services/          # API呼び出し
├── types/             # TypeScript型定義
├── utils/             # ユーティリティ
└── App.tsx
```

### 分離原則
- ダッシュボードは独立して起動可能（`catdoc dashboard`）
- コアロジックへの依存は読み取りのみ
- WebSocketで変更を通知（polling なし）
- フロントエンドはビルド時にstatic/に埋め込み

## Documentation Standards

### Go
- **公開関数/型**: godoc形式コメント必須
  ```go
  // Object represents a node in a category.
  // Each object has a unique identifier and optional metadata.
  type Object struct {...}
  ```
- **パッケージ**: `doc.go` でパッケージレベルのドキュメント
- **複雑なロジック**: インラインコメントで説明

### TypeScript
- **コンポーネント**: TSDocコメント
  ```typescript
  /**
   * Displays an interactive category graph using React Flow.
   * @param categoryId - The ID of the category to display
   */
  export const GraphView: React.FC<Props> = ({...}) => {...}
  ```
- **複雑な型**: コメントで用途説明

### README
- **ルートREADME**: 概要、クイックスタート、インストール
- **モジュールREADME**: 各主要ディレクトリ（`internal/category/README.md`）
- **docs/**: 詳細なドキュメント、チュートリアル

## TDD Workflow Structure

### テストファイル配置
```
internal/category/
├── object.go
├── object_test.go         # ユニットテスト
├── morphism.go
├── morphism_test.go
├── verification.go
└── verification_test.go   # プロパティベーステスト含む
```

### テストデータ
```
test/fixtures/
├── simple_category.json   # 基本的なテストケース
├── invalid_morphism.json  # エラーケース
└── large_graph.json       # パフォーマンステスト
```

### 統合テスト
```
test/integration/
├── cli_test.go            # CLIコマンドのE2Eテスト
└── dashboard_test.go      # ダッシュボードAPIテスト
```

### TDD Annotations（要件とのトレーサビリティ）
```go
// TEST-COMP-001: Verifies: REQ-CAT-001 (Morphism composition)
func TestComposeMorphisms(t *testing.T) {
    // Implements: REQ-CAT-001
    // ...
}
```
