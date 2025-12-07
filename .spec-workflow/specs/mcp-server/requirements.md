# Requirements Document: MCP Server for CatDoc

## Introduction

CatDocをModel Context Protocol (MCP)サーバーとして利用可能にし、AI assistantsやIDEから圏論ベースのドキュメント管理機能にアクセスできるようにする。既存のCLI機能をMCPツールとして公開し、npm配布可能なパッケージとして提供する。

## Alignment with Product Vision

product.mdで定義された「AI Integration: LLMによるモーフィズム自動推論」の前段階として、AIアシスタントからCatDocの機能にプログラマティックにアクセスできる基盤を構築する。これにより：

- AIアシスタントがドキュメント構造を理解・検証できる
- Claude CodeやGitHub CopilotなどからCatDoc機能を直接呼び出せる
- MCPエコシステムの一部として配布可能

## Requirements

### REQ-MCP-001: MCPサーバー基盤

**User Story:** As a developer, I want to use CatDoc as an MCP server, so that I can access document management features from AI assistants.

#### Acceptance Criteria

1. WHEN `catdoc mcp` command is executed THEN the system SHALL start an MCP server using stdio transport
2. WHEN the MCP server starts THEN the system SHALL register all available tools with the MCP protocol
3. IF an MCP client connects THEN the system SHALL respond to `tools/list` with all registered tools
4. WHEN the MCP server receives a tool call THEN the system SHALL execute the corresponding function and return results

### REQ-MCP-002: カテゴリ管理ツール

**User Story:** As an AI assistant, I want to list and show categories, so that I can understand the document structure.

#### Acceptance Criteria

1. WHEN `catdoc_list_categories` tool is called THEN the system SHALL return all categories with their objects and morphisms
2. WHEN `catdoc_show_category` tool is called with `categoryId` THEN the system SHALL return the category details including objects and morphisms
3. IF categoryId does not exist THEN the system SHALL return an error with message "Category not found"

### REQ-MCP-003: オブジェクト管理ツール

**User Story:** As an AI assistant, I want to manage objects (documents), so that I can help users organize documentation.

#### Acceptance Criteria

1. WHEN `catdoc_list_objects` tool is called THEN the system SHALL return all objects with their metadata
2. WHEN `catdoc_list_objects` tool is called with `domain` parameter THEN the system SHALL filter objects by domain
3. WHEN `catdoc_show_object` tool is called with `objectId` THEN the system SHALL return object details including content and metadata
4. WHEN `catdoc_import_document` tool is called with `filePath` THEN the system SHALL import the document as an object

### REQ-MCP-004: 射（Morphism）管理ツール

**User Story:** As an AI assistant, I want to query morphisms between documents, so that I can trace relationships.

#### Acceptance Criteria

1. WHEN `catdoc_list_morphisms` tool is called THEN the system SHALL return all morphisms
2. WHEN `catdoc_list_morphisms` tool is called with `categoryId` THEN the system SHALL filter morphisms by category
3. WHEN `catdoc_show_morphism` tool is called with `morphismId` THEN the system SHALL return morphism details including source and target

### REQ-MCP-005: 検証ツール

**User Story:** As an AI assistant, I want to validate category structures, so that I can ensure document relationships are consistent.

#### Acceptance Criteria

1. WHEN `catdoc_validate` tool is called THEN the system SHALL validate all categories, functors, and natural transformations
2. WHEN validation completes THEN the system SHALL return `isValid`, `errors`, `warnings`, and `summary` with counts
3. WHEN `catdoc_validate` tool is called with `categoryId` THEN the system SHALL validate only the specified category
4. IF validation finds errors THEN the system SHALL return detailed error messages with category/functor/natural transformation context
5. WHEN `catdoc_validate_category` tool is called with `categoryId` THEN the system SHALL validate category axioms:
   - Identity morphism existence for each object
   - Morphism source/target reference integrity
   - Composition closure (warning if missing)
6. WHEN `catdoc_validate_functor` tool is called with `functorId` THEN the system SHALL validate functor axioms:
   - Source/target category existence
   - Object mapping completeness
   - Identity preservation (F(id_A) = id_{F(A)})
7. WHEN `catdoc_validate_natural_transformation` tool is called with `id` THEN the system SHALL validate:
   - Source/target functor existence
   - Component completeness for all objects
   - Component type correctness (η_A: F(A) → G(A))

### REQ-MCP-006: パス探索ツール

**User Story:** As an AI assistant, I want to find paths between documents, so that I can trace dependencies and transformations.

#### Acceptance Criteria

1. WHEN `catdoc_trace` tool is called with `sourceId` and `targetId` THEN the system SHALL return all paths between objects
2. WHEN paths are found THEN the system SHALL return paths sorted by length (shortest first)
3. IF no path exists THEN the system SHALL return an empty paths array with `found: false`

### REQ-MCP-007: 検索ツール

**User Story:** As an AI assistant, I want to search documents by keyword, so that I can find relevant documentation.

#### Acceptance Criteria

1. WHEN `catdoc_search` tool is called with `query` THEN the system SHALL search objects by title and content
2. WHEN `catdoc_search` tool is called with `domain` THEN the system SHALL filter results by domain
3. WHEN results are found THEN the system SHALL return matched objects with relevance score

### REQ-MCP-008: 関手・自然変換ツール

**User Story:** As an AI assistant, I want to query functors and natural transformations, so that I can understand cross-category relationships.

#### Acceptance Criteria

1. WHEN `catdoc_list_functors` tool is called THEN the system SHALL return all functors with source/target categories
2. WHEN `catdoc_show_functor` tool is called with `functorId` THEN the system SHALL return functor details including object and morphism mappings
3. WHEN `catdoc_list_natural_transformations` tool is called THEN the system SHALL return all natural transformations
4. WHEN `catdoc_show_natural_transformation` tool is called with `id` THEN the system SHALL return components and source/target functors

### REQ-MCP-009: ダッシュボード自動起動

**User Story:** As a developer, I want the dashboard to start automatically with MCP server, so that I can visualize the document structure alongside AI interactions.

#### Acceptance Criteria

1. WHEN `catdoc mcp --dashboard` option is provided THEN the system SHALL start the dashboard server automatically
2. WHEN dashboard starts THEN the system SHALL use a free port or specified port via `--port`
3. WHEN dashboard is running THEN the system SHALL include dashboard URL in MCP server info
4. IF dashboard fails to start THEN the system SHALL log a warning but continue MCP server operation

### REQ-MCP-010: npm配布設定

**User Story:** As a developer, I want to install CatDoc via npm, so that I can easily add it to my projects.

#### Acceptance Criteria

1. WHEN package.json is configured THEN the system SHALL have `name: "@catdoc/mcp-server"` for npm publishing
2. WHEN `npm install -g @catdoc/mcp-server` is executed THEN the system SHALL install the CLI globally
3. WHEN installed THEN the system SHALL provide `catdoc` and `catdoc-mcp` commands
4. WHEN package is published THEN the system SHALL include prebuilt binaries for major platforms (optional: via postinstall)

### REQ-MCP-011: 初期化ツール

**User Story:** As an AI assistant, I want to initialize a CatDoc project, so that I can help users set up document management.

#### Acceptance Criteria

1. WHEN `catdoc_init` tool is called with `directory` THEN the system SHALL initialize a new CatDoc project
2. WHEN initialization completes THEN the system SHALL create `.catdoc/` directory with default files
3. IF `.catdoc/` already exists THEN the system SHALL return an error unless `force: true` is provided

### REQ-MCP-012: グラフデータ取得ツール

**User Story:** As an AI assistant, I want to get graph data, so that I can describe or visualize document relationships.

#### Acceptance Criteria

1. WHEN `catdoc_get_graph` tool is called THEN the system SHALL return nodes and edges for visualization
2. WHEN graph data is returned THEN nodes SHALL include `id`, `label`, `type`, and `metadata`
3. WHEN graph data is returned THEN edges SHALL include `id`, `source`, `target`, and `label`

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: MCPサーバー実装は `src/presentation/mcp/` に配置
- **Modular Design**: 既存のCLI機能を再利用し、MCP層はアダプターとして機能
- **Dependency Management**: @modelcontextprotocol/sdk を唯一のMCP依存として追加
- **Clear Interfaces**: 各ツールは独立した関数として実装し、テスト可能に

### Performance

- **REQ-NFR-PERF-001**: ツール呼び出しは1秒以内に応答
- **REQ-NFR-PERF-002**: 1000オブジェクトを含むカテゴリでもリスト取得は2秒以内
- **REQ-NFR-PERF-003**: メモリ使用量は500MB以下

### Security

- **REQ-NFR-SEC-001**: MCPサーバーはローカルstdioトランスポートのみサポート（ネットワーク経由の接続は不可）
- **REQ-NFR-SEC-002**: ファイルパス入力は作業ディレクトリ内に制限
- **REQ-NFR-SEC-003**: 環境変数やシークレットをツール出力に含めない

### Reliability

- **REQ-NFR-REL-001**: 不正な入力に対して適切なエラーメッセージを返す
- **REQ-NFR-REL-002**: MCPサーバーはクラッシュせず、エラーをログに記録して継続

### Usability

- **REQ-NFR-USE-001**: 各ツールには明確なdescriptionとinputSchemaを提供
- **REQ-NFR-USE-002**: エラーメッセージは問題と解決策を明確に示す
- **REQ-NFR-USE-003**: README.mdにMCPサーバーの設定例を記載
