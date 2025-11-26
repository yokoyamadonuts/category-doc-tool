# Requirements Document

## Introduction

Category Documentation Tool (CatDoc) MVP は、異なるドメイン層（業務、仕様、アプリケーション、インフラストラクチャ）のドキュメント間の関係性を圏論（Category Theory）の概念でモデル化し、可視化するツールです。ソフトウェアプロダクト開発チームが、複雑なドキュメント構造の整合性を保ち、変更の影響範囲を追跡できるようにすることを目的とします。

MVPでは、既存のMarkdownドキュメントをインポートし、JSON/YAMLで圏構造を定義し、グラフとして可視化する基本機能を提供します。さらに、異なるドメイン間の関手（Functor）と自然変換（Natural Transformation）を定義し、それらを使ったドキュメント検索とマッピング可視化を実現します。

## Alignment with Product Vision

このMVPは、product.mdで定義された以下の目標に沿っています：

- **Object Management**: ドキュメントをオブジェクトとして管理する基盤を構築
- **Morphism Definition**: ドキュメント間の関係性（射）をJSON/YAMLで定義可能に
- **Functor & Natural Transformation Support**: 異なるドメイン間のマッピング（関手）と変換（自然変換）をMVPから実装し、ドメイン層の整合性を検証
- **Graph Visualization**: React Flowの代わりにSvelteベースの可視化で直感的な理解を実現
- **Mathematical Rigor**: 圏論の公理（結合律、恒等射、関手の公理、自然性条件）に基づく厳密な検証機能
- **Impact Analysis**: 関手と自然変換を通じた変更影響分析とドメイン間のトレーサビリティ

技術スタックは、よりモダンで軽量な構成（Svelte + Hono + Turso）を採用し、将来の拡張性とパフォーマンスを確保します。

## Requirements

### <a id="REQ-DOC-001"></a>Requirement 1: ドキュメントインポート

**User Story:** As a ソフトウェアアーキテクト, I want 既存のMarkdownドキュメントをシステムにインポートする, so that 既存のドキュメント資産を活用しながら圏論的な管理を始められる

#### Acceptance Criteria

1. WHEN ユーザーが `catdoc import <file-path>` コマンドを実行 THEN システム SHALL Markdownファイルを読み込み、オブジェクトとしてTursoデータベースに保存する
2. WHEN インポート時にファイルパスが無効 THEN システム SHALL エラーメッセージを表示し、処理を中断する
3. WHEN インポート時にYAMLフロントマターが存在 THEN システム SHALL メタデータを抽出し、オブジェクトのプロパティとして保存する
4. WHEN 同一IDのドキュメントが既に存在 THEN システム SHALL 上書き確認プロンプトを表示する

### <a id="REQ-DOC-002"></a>Requirement 2: オブジェクト管理

**User Story:** As a テクニカルライター, I want ドキュメント（オブジェクト）の一覧を表示・検索する, so that システムに登録されているドキュメントを素早く把握できる

#### Acceptance Criteria

1. WHEN ユーザーが `catdoc list` コマンドを実行 THEN システム SHALL すべてのオブジェクトをID、タイトル、ドメインとともに表形式で表示する
2. WHEN ユーザーが `catdoc show <object-id>` コマンドを実行 THEN システム SHALL 指定されたオブジェクトの詳細（メタデータ、コンテンツ）を表示する
3. WHEN ユーザーが `catdoc search <keyword>` コマンドを実行 THEN システム SHALL タイトルまたはコンテンツに該当キーワードを含むオブジェクトをリストする
4. IF オブジェクトが存在しない THEN システム SHALL 適切なメッセージを表示する

### <a id="REQ-CAT-001"></a>Requirement 3: 圏構造定義

**User Story:** As a ソフトウェアアーキテクト, I want オブジェクト間の射（Morphism）をJSON/YAMLで定義する, so that ドキュメント間の依存関係や変換を明示的に管理できる

#### Acceptance Criteria

1. WHEN ユーザーが `.catdoc/category.yaml` ファイルを作成 THEN システム SHALL YAMLファイルから射の定義を読み込む
2. WHEN YAML内で `morphisms` キーが定義されている AND 各射が `source`, `target`, `name` フィールドを持つ THEN システム SHALL 射をデータベースに保存する
3. WHEN 射の `source` または `target` が存在しないオブジェクトを参照 THEN システム SHALL 警告を表示し、その射をスキップする
4. WHEN ユーザーが `catdoc validate` コマンドを実行 THEN システム SHALL 圏の公理（恒等射の存在、合成の結合律）をチェックし、結果を報告する

### <a id="REQ-CAT-002"></a>Requirement 4: 圏論的検証

**User Story:** As a 開発チームリーダー, I want 定義された圏構造が圏論の公理を満たすか検証する, so that ドキュメント間の関係性の整合性を数学的に保証できる

#### Acceptance Criteria

1. WHEN `catdoc validate` コマンドが実行される THEN システム SHALL すべてのオブジェクトに対して恒等射（identity morphism）が存在するか確認する
2. WHEN 射 f: A→B と g: B→C が存在する THEN システム SHALL 合成射 g∘f: A→C が定義されているか、または自動的に推論可能かチェックする
3. WHEN 射 f: A→B, g: B→C, h: C→D が存在する THEN システム SHALL (h∘g)∘f = h∘(g∘f) の結合律が成立するか検証する
4. WHEN 検証に失敗 THEN システム SHALL 違反箇所を具体的に（オブジェクトID、射名）レポートする

### <a id="REQ-VIS-001"></a>Requirement 5: グラフ可視化（Webダッシュボード）

**User Story:** As a ソフトウェアアーキテクト, I want ドキュメントの圏構造をインタラクティブなグラフで表示する, so that 複雑な関係性を視覚的に理解し、探索できる

#### Acceptance Criteria

1. WHEN ユーザーが `catdoc dashboard` コマンドを実行 THEN システム SHALL Honoサーバーを起動し、Svelteベースのダッシュボードを表示する
2. WHEN ダッシュボードが読み込まれる THEN システム SHALL すべてのオブジェクト（ノード）と射（エッジ）をグラフ形式で表示する
3. WHEN ユーザーがノードをクリック THEN システム SHALL そのオブジェクトの詳細情報（タイトル、ドメイン、メタデータ）をサイドパネルに表示する
4. WHEN ユーザーがエッジをクリック THEN システム SHALL その射の名前、source、targetを表示する
5. WHEN グラフに100ノード以上が含まれる THEN システム SHALL 5秒以内にレンダリングを完了する

### <a id="REQ-VIS-002"></a>Requirement 6: グラフインタラクション

**User Story:** As a テクニカルライター, I want グラフ上でノードをドラッグして配置を調整する, so that 視覚的に分かりやすいレイアウトを作成できる

#### Acceptance Criteria

1. WHEN ユーザーがノードをドラッグ THEN システム SHALL ノードの位置をリアルタイムで更新する
2. WHEN ユーザーがグラフをズーム/パン THEN システム SHALL スムーズに表示範囲を調整する
3. WHEN ユーザーが「レイアウト自動調整」ボタンをクリック THEN システム SHALL 階層的レイアウトアルゴリズムでノードを再配置する
4. WHEN ユーザーがノードを選択 AND 関連する射を強調表示 THEN システム SHALL 選択ノードに接続するエッジを太線または色付きで表示する

### <a id="REQ-SYS-001"></a>Requirement 7: データ永続化

**User Story:** As a システム管理者, I want すべてのオブジェクトと射をTursoデータベースに永続化する, so that データの一貫性と高速なクエリを実現できる

#### Acceptance Criteria

1. WHEN オブジェクトまたは射が作成/更新される THEN システム SHALL Tursoデータベースにトランザクションとして保存する
2. WHEN システムが起動される THEN システム SHALL Tursoから既存のデータを読み込み、メモリキャッシュを構築する
3. WHEN データベース接続に失敗 THEN システム SHALL エラーメッセージを表示し、適切にフォールバックする（例：読み取り専用モード）
4. WHEN 同時書き込みが発生 THEN システム SHALL トランザクション分離レベルを保ち、データの整合性を維持する

### <a id="REQ-SYS-002"></a>Requirement 8: CLI初期化

**User Story:** As a 新規ユーザー, I want `catdoc init` コマンドでプロジェクトを初期化する, so that 必要な設定ファイルとデータベースを自動生成できる

#### Acceptance Criteria

1. WHEN ユーザーが `catdoc init` コマンドを実行 THEN システム SHALL `.catdoc/` ディレクトリを作成する
2. WHEN 初期化が実行される THEN システム SHALL `.catdoc/category.yaml` テンプレートファイルを生成する（categories, functors, natural_transformationsのサンプルを含む）
3. WHEN 初期化が実行される THEN システム SHALL Tursoデータベース接続を設定し、必要なテーブル（objects, morphisms, categories, functors, natural_transformations）を作成する
4. WHEN `.catdoc/` が既に存在 THEN システム SHALL 上書き確認プロンプトを表示する

### <a id="REQ-CAT-003"></a>Requirement 9: 関手（Functor）定義

**User Story:** As a ソフトウェアアーキテクト, I want 異なるドメイン間の関手を定義する, so that ドメイン層（業務、仕様、実装など）間のマッピングを明示的に管理できる

#### Acceptance Criteria

1. WHEN ユーザーが `.catdoc/category.yaml` に `categories` セクションを定義 THEN システム SHALL 複数のカテゴリ（例: business_domain, spec_domain, implementation_domain）を認識する
2. WHEN YAML内で `functors` キーが定義されている AND 各関手が `name`, `source_category`, `target_category`, `object_mapping`, `morphism_mapping` フィールドを持つ THEN システム SHALL 関手をデータベースに保存する
3. WHEN `object_mapping` がソースカテゴリのオブジェクトをターゲットカテゴリのオブジェクトにマッピング THEN システム SHALL マッピングの整合性を検証する（マッピング先オブジェクトの存在確認）
4. WHEN `morphism_mapping` がソースカテゴリの射をターゲットカテゴリの射にマッピング THEN システム SHALL 関手の公理（恒等射の保存、合成の保存）をチェックする
5. WHEN `catdoc validate --functors` コマンドが実行される THEN システム SHALL すべての関手が圏論の関手の公理を満たすか検証し、結果を報告する

### <a id="REQ-CAT-004"></a>Requirement 10: 自然変換（Natural Transformation）定義

**User Story:** As a 開発チームリーダー, I want 関手間の自然変換を定義する, so that 異なるドメイン間の対応関係の整合性を検証できる

#### Acceptance Criteria

1. WHEN ユーザーが `.catdoc/category.yaml` に `natural_transformations` セクションを定義 THEN システム SHALL 自然変換をデータベースに保存する
2. WHEN 自然変換が `name`, `source_functor`, `target_functor`, `components` フィールドを持つ THEN システム SHALL ソースとターゲットの関手が同じカテゴリ間のマッピングであることを確認する
3. WHEN `components` が各オブジェクトに対する射を定義 THEN システム SHALL 自然性条件（可換図式）が成立するか検証する
4. WHEN 自然性条件が満たされない THEN システム SHALL 違反箇所（どのオブジェクトと射で可換性が崩れるか）を具体的にレポートする
5. WHEN `catdoc validate --natural-transformations` コマンドが実行される THEN システム SHALL すべての自然変換の自然性条件をチェックする

### <a id="REQ-SEARCH-001"></a>Requirement 11: 自然変換によるドキュメント検索

**User Story:** As a テクニカルライター, I want 自然変換を使ってドメイン間で対応するドキュメントを検索する, so that あるドメインのドキュメントから関連する他のドメインのドキュメントを素早く見つけられる

#### Acceptance Criteria

1. WHEN ユーザーが `catdoc search --functor <functor-name> <object-id>` コマンドを実行 THEN システム SHALL 指定された関手によるオブジェクトのマッピング先を表示する
2. WHEN ユーザーが `catdoc search --natural <nat-transform-name> <object-id>` コマンドを実行 THEN システム SHALL 指定された自然変換の成分射を通じて到達可能なドキュメントを表示する
3. WHEN ユーザーが `catdoc trace <source-object-id> <target-category>` コマンドを実行 THEN システム SHALL ソースオブジェクトからターゲットカテゴリへの変換パス（関手と自然変換の合成）を自動探索して表示する
4. WHEN 複数の変換パスが存在 THEN システム SHALL すべてのパスをリストし、最短経路を強調表示する
5. WHEN 変換パスが存在しない THEN システム SHALL 「到達不可能」というメッセージを表示する

### <a id="REQ-VIS-003"></a>Requirement 12: ドメイン間マッピング可視化

**User Story:** As a ソフトウェアアーキテクト, I want ダッシュボードで異なるドメイン間の関手と自然変換を可視化する, so that ドメイン層の構造と対応関係を直感的に把握できる

#### Acceptance Criteria

1. WHEN ダッシュボードに複数のカテゴリが存在 THEN システム SHALL 各カテゴリを視覚的に区別（色、レイヤー表示）してグラフに表示する
2. WHEN ユーザーが「関手表示」モードを選択 THEN システム SHALL 関手によるオブジェクト間のマッピングを点線または異なる色のエッジで表示する
3. WHEN ユーザーが特定の関手を選択 THEN システム SHALL その関手のマッピングのみをハイライトし、他を半透明にする
4. WHEN ユーザーが自然変換を選択 THEN システム SHALL 自然変換の成分射を可視化し、可換図式を表示する
5. WHEN ユーザーがオブジェクトを選択 AND 「関連ドメインを表示」をクリック THEN システム SHALL そのオブジェクトから関手・自然変換を通じて到達可能な全ドメインのオブジェクトを表示する

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: 各モジュールは単一の責務を持つ
  - `src/domain/`: 圏論のドメインロジック（Object, Morphism, Category, Verification）
  - `src/infrastructure/`: データベース接続、ファイルIO
  - `src/application/`: CLIコマンド、APIエンドポイント
  - `src/presentation/`: Svelteコンポーネント
- **Modular Design**: Honoのミドルウェア、Svelteコンポーネント、ドメインロジックを独立したモジュールとして設計
- **Dependency Management**: ドメインロジックは外部依存を持たない（Clean Architecture）
- **Clear Interfaces**: Repository patternでデータアクセスを抽象化

### Performance

- **起動時間**: `catdoc` コマンドは1秒以内に起動
- **インポート速度**: 100KBのMarkdownファイルを100ms以内に処理
- **検証速度**: 1000ノード、5000エッジのグラフを1秒以内に検証
- **関手検証速度**: 10個の関手（各100オブジェクトマッピング）を500ms以内に検証
- **自然変換検証速度**: 5個の自然変換の自然性条件を1秒以内にチェック
- **ドメイン間トレース速度**: 最大5層のドメイン階層で変換パスを500ms以内に探索
- **ダッシュボード応答**: APIエンドポイントは100ms以内にレスポンス（P95）
- **グラフレンダリング**: 100ノードを5秒以内、1000ノードを30秒以内に描画
- **マルチカテゴリ表示**: 5つのカテゴリ（各200ノード）を同時に10秒以内にレンダリング

### Security

- **入力検証**: すべてのユーザー入力（ファイルパス、YAML、コマンド引数）をサニタイズ
- **SQLインジェクション対策**: Turso接続でプリペアドステートメントを使用
- **XSS対策**: Svelteの自動エスケープを活用し、Markdown表示時はサニタイズライブラリを使用
- **ローカルアクセス**: ダッシュボードは `127.0.0.1` のみでバインド
- **認証**: MVPでは不要（ローカル実行のみ）

### Reliability

- **エラーハンドリング**: すべての外部I/O（ファイル、DB）で適切なエラーハンドリングを実装
- **データ整合性**: トランザクションを使用してデータベース操作の原子性を保証
- **フォールバック**: データベース接続失敗時は適切なエラーメッセージを表示
- **ログ**: 重要な操作（インポート、検証、サーバー起動）をログに記録

### Usability

- **CLIフィードバック**: すべてのコマンドは進捗状況を表示（スピナー、プログレスバー）
- **エラーメッセージ**: 具体的で実行可能な改善提案を含む（例：「オブジェクト 'X' が見つかりません。`catdoc list` で確認してください」）
- **ドキュメント**: README.mdに基本的な使い方、examples/に実践的なサンプルを含める
- **ヘルプコマンド**: `catdoc --help`, `catdoc <command> --help` で詳細なヘルプを表示
- **UI/UX**: ダッシュボードは直感的で、グラフ操作に説明ツールチップを表示
