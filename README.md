# CatDoc - Category Theory Documentation Tool

CatDocは、圏論（Category Theory）の概念を使ってドキュメントを整理・ナビゲートするためのCLIツールです。

## 特徴

- **圏論ベースの構造化**: オブジェクト（ドキュメント）、射（関係）、カテゴリ、関手、自然変換を使ってドキュメントを整理
- **Markdownインポート**: YAMLフロントマター付きのMarkdownファイルをオブジェクトとしてインポート
- **パス探索**: オブジェクト間の変換パスを探索
- **検証機能**: 圏論の公理（恒等射、結合法則など）を検証
- **REST API**: Webダッシュボード用のAPIサーバー
- **グラフ可視化**: カテゴリ構造をノードとエッジで可視化

## 圏論の概念とドキュメント管理の対応関係

CatDocは圏論（Category Theory）の数学的構造をドキュメント管理に応用しています。

| 圏論の概念 | ドキュメント管理での意味 | 具体例 |
|-----------|------------------------|-------|
| **オブジェクト (Object)** | ドキュメント、仕様書、設計書などの個々の成果物 | `requirements.md`, `api-spec.yaml`, `architecture.md` |
| **射 (Morphism)** | ドキュメント間の関係・変換・依存関係 | 「要件→設計」「設計→実装」「仕様→テスト」 |
| **カテゴリ (Category)** | 関連するドキュメントのグループ（ドメイン領域） | 「要件定義」「アーキテクチャ」「テスト」 |
| **関手 (Functor)** | カテゴリ間の構造を保つマッピング | 「要件カテゴリ→テストカテゴリ」の追跡可能性 |
| **自然変換 (Natural Transformation)** | 関手間の一貫した変換規則 | 異なるバージョン間のマッピングの整合性 |

### なぜ圏論を使うのか

1. **構造の明示化**: ドキュメント間の関係を数学的に厳密に定義できる
2. **整合性の検証**: 圏論の公理に基づいて構造の一貫性を自動検証できる
3. **追跡可能性**: 関手を使って異なるドメイン間の対応関係を表現できる
4. **合成可能性**: 射の合成により、間接的な関係（A→B→C）を導出できる

### 実用例：トレーサビリティマトリクス

```
要件カテゴリ           設計カテゴリ           テストカテゴリ
┌─────────┐          ┌─────────┐          ┌─────────┐
│ REQ-001 │─────────▶│ DES-001 │─────────▶│ TST-001 │
│ REQ-002 │─────────▶│ DES-002 │─────────▶│ TST-002 │
│ REQ-003 │─────┬───▶│ DES-003 │─────────▶│ TST-003 │
└─────────┘     │    └─────────┘          └─────────┘
                │         ↓
                │    ┌─────────┐
                └───▶│ DES-004 │
                     └─────────┘

関手 F: 要件→設計    関手 G: 設計→テスト
```

このような追跡関係を圏論的に表現することで：
- 未カバーの要件（射がないオブジェクト）を検出
- 循環依存や孤立したドキュメントを発見
- カテゴリ間のマッピングの完全性を検証

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/category-doc-tool.git
cd category-doc-tool

# 依存関係をインストール
bun install

# CLIをビルド
bun run build
```

## クイックスタート

### 1. プロジェクトの初期化

```bash
catdoc init
```

これにより `.catdoc/` ディレクトリが作成され、以下のファイルが生成されます：
- `category.yaml` - カテゴリ構造の定義
- `config.yaml` - プロジェクト設定
- `docs/example.md` - サンプルドキュメント

### 2. ドキュメントのインポート

```bash
# 単一ファイルをインポート
catdoc import docs/my-document.md

# 複数ファイルをインポート
catdoc import docs/*.md

# ドメインを指定してインポート
catdoc import docs/math/*.md --domain mathematics
```

### 3. カテゴリ構造の検証

```bash
catdoc validate
```

`validate`コマンドは圏論の公理に基づいてドキュメント構造の整合性を検証します。

#### カテゴリの検証

| 検証項目 | 説明 | エラー/警告 |
|---------|------|-----------|
| **恒等射の存在** | 各オブジェクトに恒等射（`id-<object-id>`）が存在するか | エラー |
| **射の参照整合性** | 射のsource/targetが存在するオブジェクトを参照しているか | エラー |
| **合成の閉包性** | 合成可能な射のペア（f: A→B, g: B→C）に対して合成射（g∘f: A→C）が存在するか | 警告 |

```
# 恒等射がない場合のエラー例
[my-category] Object 'doc-001' lacks an identity morphism (id: doc-001 → doc-001)

# 合成射がない場合の警告例
[my-category] Missing composition: review∘implement (requirements → deployment)
```

#### 関手の検証

| 検証項目 | 説明 | エラー/警告 |
|---------|------|-----------|
| **ソース/ターゲットカテゴリの存在** | 関手が参照するカテゴリが存在するか | エラー |
| **オブジェクトマッピングの完全性** | ソースカテゴリの全オブジェクトがマッピングされているか | エラー/警告 |
| **マッピング先の存在** | マッピング先のオブジェクトがターゲットカテゴリに存在するか | エラー |
| **恒等射の保存** | F(id_A) = id_{F(A)} が成り立つか | エラー |

```
# オブジェクトがマッピングされていない場合
[req-to-test] Object 'REQ-003' is not mapped by functor 'req-to-test'

# 恒等射の保存が破れている場合
[F] Functor 'F' does not preserve identity for object 'A': F(id_A) should be id_F(A)
```

#### 自然変換の検証

| 検証項目 | 説明 | エラー/警告 |
|---------|------|-----------|
| **ソース/ターゲット関手の存在** | 自然変換が参照する関手が存在するか | エラー |
| **コンポーネントの完全性** | ソースカテゴリの全オブジェクトに対してコンポーネントが定義されているか | エラー |
| **コンポーネント射の存在** | コンポーネントとして指定された射が存在するか | エラー |
| **コンポーネントの型整合性** | η_A: F(A) → G(A) の型が正しいか | エラー |

```
# コンポーネントがない場合
[eta] Natural transformation 'eta' is missing component for object 'A'

# コンポーネントの型が間違っている場合
[eta] Component η_A has wrong source: expected 'F(A)', got 'X'
```

### 4. オブジェクトの一覧表示

```bash
# すべてのオブジェクトを表示
catdoc list objects

# ドメインでフィルタ
catdoc list objects --domain mathematics

# JSON形式で出力
catdoc list objects --format json
```

### 5. オブジェクトの詳細表示

```bash
catdoc show object <object-id>
catdoc show category <category-id>
catdoc show functor <functor-id>
```

### 6. 検索

```bash
# キーワードで検索
catdoc search "category theory"

# ドメインでフィルタして検索
catdoc search "functor" --domain mathematics
```

### 7. パス探索

```bash
# オブジェクト間のパスを探索
catdoc trace <source-id> <target-id>

# カテゴリへのパスを探索
catdoc trace <source-id> <target-category> --category
```

### 8. ダッシュボードの起動

```bash
# デフォルトポート(3000)で起動
catdoc dashboard

# カスタムポートで起動
catdoc dashboard --port 8080
```

## category.yaml の構造

```yaml
categories:
  - id: math
    name: Mathematics
    objects:
      - id: set-theory
        title: Set Theory
        domain: mathematics
        metadata:
          author: John Doe
      - id: group-theory
        title: Group Theory
        domain: mathematics
    morphisms:
      - id: set-to-group
        name: structure
        source: set-theory
        target: group-theory

functors:
  - id: F
    name: Forgetful Functor
    sourceCategory: algebra
    targetCategory: sets
    objectMapping:
      group: underlying-set
    morphismMapping:
      homomorphism: function

naturalTransformations:
  - id: eta
    name: Unit
    sourceFunctor: Id
    targetFunctor: F
    components:
      object-a: morphism-1
```

## ドキュメント形式

CatDocはYAMLフロントマター付きのMarkdownファイルをサポートしています：

```markdown
---
id: my-document
title: My Document Title
domain: my-domain
author: Author Name
tags:
  - tag1
  - tag2
---

# My Document Title

Document content here...

## References

- Related object: @other-object-id
- Related morphism: #morphism-id
```

## API エンドポイント

ダッシュボードサーバーは以下のREST APIを提供します：

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/objects` | オブジェクト一覧 |
| GET | `/api/objects/:id` | オブジェクト詳細 |
| GET | `/api/morphisms` | 射の一覧 |
| GET | `/api/morphisms/:id` | 射の詳細 |
| GET | `/api/categories` | カテゴリ一覧 |
| GET | `/api/categories/:id` | カテゴリ詳細 |
| GET | `/api/functors` | 関手一覧 |
| GET | `/api/functors/:id` | 関手詳細 |
| GET | `/api/natural-transformations` | 自然変換一覧 |
| GET | `/api/graph` | グラフデータ（可視化用） |
| POST | `/api/validate` | 構造の検証 |
| POST | `/api/trace` | パス探索 |

## プロジェクト構造

```
src/
├── domain/           # ドメイン層
│   ├── entities/     # エンティティ（Object, Morphism, Category等）
│   ├── services/     # ドメインサービス
│   └── interfaces/   # リポジトリインターフェース
├── infrastructure/   # インフラ層
│   ├── database/     # データベース接続（Neo4j, Turso）
│   └── parsers/      # パーサー（YAML, Markdown）
├── application/      # アプリケーション層
│   ├── cli/          # CLIコマンド
│   └── api/          # REST API
└── index.ts          # エントリポイント
```

## 開発

```bash
# 開発モードで実行
bun run dev

# テストを実行
bun test

# 型チェック
bun run typecheck

# ビルド
bun run build
```

## ライセンス

MIT License
