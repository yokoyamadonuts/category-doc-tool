# CatDoc - Category Theory Documentation Tool

CatDocは、圏論（Category Theory）の概念を使ってドキュメントを整理・ナビゲートするためのCLIツールです。

## 特徴

- **圏論ベースの構造化**: オブジェクト（ドキュメント）、射（関係）、カテゴリ、関手、自然変換を使ってドキュメントを整理
- **Markdownインポート**: YAMLフロントマター付きのMarkdownファイルをオブジェクトとしてインポート
- **パス探索**: オブジェクト間の変換パスを探索
- **検証機能**: 圏論の公理（恒等射、結合法則など）を検証
- **REST API**: Webダッシュボード用のAPIサーバー
- **グラフ可視化**: カテゴリ構造をノードとエッジで可視化

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
