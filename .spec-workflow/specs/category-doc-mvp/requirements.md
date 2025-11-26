# Requirements: Category Documentation Tool MVP

## Overview

Category Documentation Tool (CatDoc) のMVP（Minimum Viable Product）として、圏論の基本概念（オブジェクト、モーフィズム、合成、恒等射）を扱えるツールを実装します。CLIとWebダッシュボードの両方でドキュメント構造を管理・可視化できることを目指します。

## Functional Requirements

### <a id="REQ-INIT-001"></a>REQ-INIT-001: プロジェクト初期化

**Priority**: High
**Status**: Pending

プロジェクトディレクトリでCatDocを初期化できる。

**Acceptance Criteria**:
- `catdoc init` コマンドで `.catdoc/` ディレクトリが作成される
- 初期化済みディレクトリで再度 `catdoc init` を実行するとエラーになる
- 初期化後、空のカテゴリデータファイル（objects.json, morphisms.json）が生成される

**Test Scenarios**:
- 未初期化ディレクトリで `catdoc init` を実行 → 成功
- 初期化済みディレクトリで `catdoc init` を実行 → エラー
- 初期化後に `.catdoc/objects.json` が存在する

---

### <a id="REQ-OBJ-001"></a>REQ-OBJ-001: オブジェクト追加

**Priority**: High
**Status**: Pending

カテゴリにオブジェクト（ドキュメント/概念）を追加できる。

**Acceptance Criteria**:
- `catdoc add object <id> --name <name> [--metadata key=value]` コマンドでオブジェクトを追加
- オブジェクトIDは一意である必要がある（重複時はエラー）
- オブジェクトには任意のメタデータを付与できる

**Test Scenarios**:
- 新しいオブジェクトを追加 → 成功、objects.jsonに保存される
- 既存IDで追加を試みる → エラー
- メタデータ付きで追加 → メタデータが保存される

---

### <a id="REQ-OBJ-002"></a>REQ-OBJ-002: オブジェクト一覧表示

**Priority**: High
**Status**: Pending

登録されているオブジェクトの一覧を表示できる。

**Acceptance Criteria**:
- `catdoc list objects` コマンドで全オブジェクトを表示
- オブジェクトIDと名前が表形式で表示される
- オブジェクトが0件の場合は「No objects found」と表示

**Test Scenarios**:
- 複数のオブジェクトを追加後、一覧表示 → すべて表示される
- オブジェクトが0件の場合 → 「No objects found」

---

### <a id="REQ-OBJ-003"></a>REQ-OBJ-003: オブジェクト削除

**Priority**: Medium
**Status**: Pending

オブジェクトを削除できる。ただし、そのオブジェクトを使用するモーフィズムが存在する場合は削除できない。

**Acceptance Criteria**:
- `catdoc delete object <id>` コマンドでオブジェクトを削除
- 削除対象のオブジェクトを使用するモーフィズムがある場合はエラー
- 削除成功時はobjects.jsonから削除される

**Test Scenarios**:
- モーフィズムに使用されていないオブジェクトを削除 → 成功
- モーフィズムに使用されているオブジェクトを削除 → エラー

---

### <a id="REQ-MORPH-001"></a>REQ-MORPH-001: モーフィズム追加

**Priority**: High
**Status**: Pending

オブジェクト間のモーフィズム（関係性）を定義できる。

**Acceptance Criteria**:
- `catdoc add morphism <id> --from <source> --to <target> [--metadata key=value]` コマンドでモーフィズムを追加
- source, target のオブジェクトが存在しない場合はエラー
- モーフィズムIDは一意である必要がある

**Test Scenarios**:
- 存在するオブジェクト間にモーフィズムを追加 → 成功
- 存在しないオブジェクトを指定 → エラー
- 重複IDで追加を試みる → エラー

---

### <a id="REQ-MORPH-002"></a>REQ-MORPH-002: モーフィズム一覧表示

**Priority**: High
**Status**: Pending

登録されているモーフィズムの一覧を表示できる。

**Acceptance Criteria**:
- `catdoc list morphisms` コマンドで全モーフィズムを表示
- モーフィズムID、source、targetが表形式で表示される
- オプションで特定のオブジェクトから/への モーフィズムのみフィルタ可能

**Test Scenarios**:
- 複数のモーフィズムを追加後、一覧表示 → すべて表示される
- `--from <id>` オプションで特定のソースからのモーフィズムのみ表示

---

### <a id="REQ-MORPH-003"></a>REQ-MORPH-003: モーフィズム削除

**Priority**: Medium
**Status**: Pending

モーフィズムを削除できる。

**Acceptance Criteria**:
- `catdoc delete morphism <id>` コマンドでモーフィズムを削除
- 削除成功時はmorphisms.jsonから削除される

**Test Scenarios**:
- 既存のモーフィズムを削除 → 成功
- 存在しないIDを指定 → エラー

---

### <a id="REQ-COMP-001"></a>REQ-COMP-001: モーフィズムの合成

**Priority**: High
**Status**: Pending

2つのモーフィズム f: A → B, g: B → C を合成して g ∘ f: A → C を作成できる。

**Acceptance Criteria**:
- `catdoc compose <morph1> <morph2> --output <new-id>` コマンドで合成を実行
- morph1のtargetとmorph2のsourceが一致しない場合はエラー
- 合成結果が新しいモーフィズムとして保存される

**Test Scenarios**:
- f: A→B, g: B→C を合成 → h: A→C が作成される
- f: A→B, g: C→D を合成しようとする → エラー（合成不可能）

---

### <a id="REQ-VERIFY-001"></a>REQ-VERIFY-001: 恒等射の検証

**Priority**: High
**Status**: Pending

すべてのオブジェクトに対して恒等射（identity morphism）が定義されているか検証できる。

**Acceptance Criteria**:
- `catdoc verify identity` コマンドで検証を実行
- すべてのオブジェクト X に対して id_X: X → X が存在することを確認
- 欠落している恒等射がある場合はリスト表示

**Test Scenarios**:
- すべてのオブジェクトに恒等射がある → 検証成功
- 一部のオブジェクトに恒等射がない → 検証失敗、欠落リスト表示

---

### <a id="REQ-VERIFY-002"></a>REQ-VERIFY-002: 結合律の検証

**Priority**: High
**Status**: Pending

モーフィズムの合成が結合律を満たすか検証できる。

**Acceptance Criteria**:
- `catdoc verify associativity` コマンドで検証を実行
- f: A→B, g: B→C, h: C→D について、(h ∘ g) ∘ f = h ∘ (g ∘ f) を確認
- 違反がある場合はリスト表示

**Test Scenarios**:
- 結合律を満たすケース → 検証成功
- 結合律を満たさないケース → 検証失敗、違反箇所を表示

---

### <a id="REQ-GRAPH-001"></a>REQ-GRAPH-001: グラフ構造のエクスポート

**Priority**: Medium
**Status**: Pending

カテゴリ構造をグラフ形式でエクスポートできる。

**Acceptance Criteria**:
- `catdoc export --format dot` でGraphviz DOT形式で出力
- `catdoc export --format json` でJSON形式で出力
- DOT形式の出力は `dot -Tsvg` でSVG画像に変換可能

**Test Scenarios**:
- DOT形式でエクスポート → Graphvizで可視化可能
- JSON形式でエクスポート → 構造化データとして読み込み可能

---

### <a id="REQ-DASH-001"></a>REQ-DASH-001: ダッシュボード起動

**Priority**: High
**Status**: Pending

Webダッシュボードを起動してブラウザでカテゴリ構造を可視化できる。

**Acceptance Criteria**:
- `catdoc dashboard` コマンドでWebサーバーを起動
- デフォルトポート3456でアクセス可能（`--port` で変更可）
- ブラウザに「Category Dashboard」タイトルが表示される

**Test Scenarios**:
- `catdoc dashboard` 実行 → http://localhost:3456 でアクセス可能
- `catdoc dashboard --port 8080` → ポート8080で起動

---

### <a id="REQ-DASH-002"></a>REQ-DASH-002: グラフのリアルタイム表示

**Priority**: High
**Status**: Pending

ダッシュボード上でカテゴリ構造をインタラクティブなグラフとして表示できる。

**Acceptance Criteria**:
- React Flowを使用してノード（オブジェクト）とエッジ（モーフィズム）を表示
- ノードをドラッグして配置を調整可能
- オブジェクト/モーフィズムの追加・削除がリアルタイムで反映される

**Test Scenarios**:
- ダッシュボード表示 → グラフが表示される
- CLIでオブジェクトを追加 → ダッシュボードに即座に反映

---

### <a id="REQ-DASH-003"></a>REQ-DASH-003: オブジェクト・モーフィズム一覧表示

**Priority**: Medium
**Status**: Pending

ダッシュボード上でオブジェクトとモーフィズムの一覧を表示できる。

**Acceptance Criteria**:
- サイドバーまたはタブでオブジェクト一覧を表示
- サイドバーまたはタブでモーフィズム一覧を表示
- 各項目をクリックするとグラフ上でハイライト

**Test Scenarios**:
- オブジェクト一覧を表示 → すべてのオブジェクトが表示される
- オブジェクトをクリック → グラフ上のノードがハイライトされる

---

### <a id="REQ-DASH-004"></a>REQ-DASH-004: 検証結果の表示

**Priority**: Medium
**Status**: Pending

ダッシュボード上で圏の公理検証結果を表示できる。

**Acceptance Criteria**:
- 恒等射検証の結果（成功/失敗、欠落リスト）を表示
- 結合律検証の結果（成功/失敗、違反リスト）を表示
- 検証は手動トリガーまたは自動実行（データ変更時）

**Test Scenarios**:
- 検証ボタンをクリック → 検証結果が表示される
- 恒等射が欠落している場合 → 警告とともに欠落リストを表示

---

## Non-Functional Requirements

### <a id="REQ-PERF-001"></a>REQ-PERF-001: パフォーマンス

**Priority**: Medium
**Status**: Pending

- 1000ノードのグラフを1秒以内に読み込む
- 検証処理は10秒以内に完了
- ダッシュボードの初期表示は3秒以内

---

### <a id="REQ-DATA-001"></a>REQ-DATA-001: データ永続化

**Priority**: High
**Status**: Pending

- すべてのデータはJSON形式で `.catdoc/` に保存
- ファイルは人間が読める形式（整形されたJSON）
- Gitでバージョン管理可能

---

### <a id="REQ-ERROR-001"></a>REQ-ERROR-001: エラーハンドリング

**Priority**: High
**Status**: Pending

- すべてのエラーは明確なメッセージとともに報告
- CLIのexit codeは成功時0、エラー時非0
- ファイル破損時は詳細なエラーメッセージを表示

---

### <a id="REQ-COMPAT-001"></a>REQ-COMPAT-001: 互換性

**Priority**: Medium
**Status**: Pending

- macOS, Linux, Windows で動作
- Go 1.21以上で動作
- ダッシュボードはモダンブラウザ（Chrome, Firefox, Safari, Edge）で動作

---

## Out of Scope (MVP後の拡張)

以下の機能はMVPには含めず、将来のバージョンで実装します：

- **Functor**: 異なるカテゴリ間のマッピング
- **Natural Transformations**: 高次の変換
- **Limits/Colimits**: 普遍的構成
- **AI統合**: LLMによるモーフィズム推論
- **マルチユーザー**: 並行編集、コラボレーション機能
- **Git統合**: 自動コミット、差分表示
- **インポート**: 既存ドキュメントからのオブジェクト/モーフィズム自動抽出

## Success Criteria

MVP成功の基準：

1. ✅ オブジェクトとモーフィズムをCLIで管理できる
2. ✅ 圏の公理（恒等射、結合律）を検証できる
3. ✅ ダッシュボードでグラフを可視化できる
4. ✅ 100ノード規模のカテゴリを扱える
5. ✅ すべてのコア機能にテストがある（カバレッジ80%以上）

## Dependencies Between Requirements

```
REQ-INIT-001 (初期化)
    ↓
REQ-OBJ-001 (オブジェクト追加)
    ↓
REQ-MORPH-001 (モーフィズム追加)
    ↓
    ├→ REQ-COMP-001 (合成)
    ├→ REQ-VERIFY-001 (恒等射検証)
    ├→ REQ-VERIFY-002 (結合律検証)
    └→ REQ-GRAPH-001 (エクスポート)

REQ-DASH-001 (ダッシュボード起動)
    ↓
REQ-DASH-002 (グラフ表示)
    ↓
REQ-DASH-003 (一覧表示)
    ↓
REQ-DASH-004 (検証結果表示)
```

## Traceability

すべての要件は以下とトレース可能にする：

- **Design**: design.mdで各要件に対する設計方針を記述
- **Tasks**: tasks.mdで各要件を実装するタスクに分解
- **Tests**: テストコードに `Verifies: REQ-XXX-YYY` アノテーションを付与
- **Code**: 実装コードに `Implements: REQ-XXX-YYY` アノテーションを付与
