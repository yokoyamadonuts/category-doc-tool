# Tasks Document: MCP Server for CatDoc

## TDD Reference

For tasks marked with `_TDD: true_`, you MUST follow the TDD workflow using these tools:

1. **[RED] Gate-A**: Write failing tests → `run-tests` (all fail) → `tdd-gate` validate/approve gate:A
2. **[GREEN] Gate-B**: Implement code → `run-tests` (all pass) → `tdd-gate` validate/approve gate:B
3. **[REFACTOR] Gate-C**: Refactor → `run-tests` (still pass) → `generate-trace` → `tdd-gate` validate/approve gate:C

Task cannot be marked [x] until Gate-C is approved.

---

## Tasks

### Phase 1: プロジェクト設定

- [x] 1. MCP SDK依存関係の追加
  - File: package.json
  - @modelcontextprotocol/sdkとzodの追加
  - bunコマンドの設定更新
  - Purpose: MCPサーバー実装に必要な依存関係を追加
  - _Leverage: 既存のpackage.json_
  - _Requirements: REQ-MCP-001, REQ-MCP-010_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Node.js/Bun Package Manager | Task: Add @modelcontextprotocol/sdk and update package.json for npm publishing as @mayyya/catdoc-mcp | Restrictions: Do not remove existing dependencies, maintain Bun compatibility | Success: bun install succeeds, SDK is importable | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 2: MCP基盤実装

- [x] 2. MCPサーバーコア実装
  - File: src/presentation/mcp/server.ts
  - McpServerのインスタンス化とstdioトランスポート設定
  - ツール登録の基盤実装
  - Purpose: MCPサーバーの基本構造を確立
  - _Leverage: @modelcontextprotocol/sdk_
  - _Requirements: REQ-MCP-001_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/server.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Server Developer | Task: Create MCP server core with stdio transport following REQ-MCP-001, using @modelcontextprotocol/sdk | Restrictions: Must follow TDD workflow (Gate-A/B/C), use stdio transport only, no network binding | Success: All TDD gates approved, server starts and responds to tools/list | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 3. MCP型定義
  - File: src/presentation/mcp/types.ts
  - ToolDefinition、ToolResult、McpServerOptionsの型定義
  - Purpose: MCP固有の型を定義してタイプセーフを確保
  - _Leverage: design.mdのData Models_
  - _Requirements: REQ-MCP-001_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Define MCP-specific types (ToolDefinition, ToolResult, McpServerOptions) following design.md Data Models | Restrictions: Use Zod for runtime validation, maintain compatibility with MCP SDK types | Success: Types compile without errors, integrate with MCP SDK | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 3: カテゴリ・オブジェクト・射ツール

- [x] 4. カテゴリ管理ツール実装
  - File: src/presentation/mcp/tools/categories.ts
  - catdoc_list_categories、catdoc_show_categoryツール
  - Purpose: カテゴリの一覧取得と詳細表示
  - _Leverage: src/application/cli/list.ts (listCategories), src/application/cli/show.ts (showCategory)_
  - _Requirements: REQ-MCP-002_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/categories.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_list_categories and catdoc_show_category tools following REQ-MCP-002, reusing listCategories and showCategory from CLI | Restrictions: Must follow TDD workflow, reuse existing CLI functions, return JSON results | Success: All TDD gates approved, tools return correct category data | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 5. オブジェクト管理ツール実装
  - File: src/presentation/mcp/tools/objects.ts
  - catdoc_list_objects、catdoc_show_object、catdoc_import_documentツール
  - Purpose: オブジェクトの一覧、詳細、インポート機能
  - _Leverage: src/application/cli/list.ts (listObjects), src/application/cli/show.ts (showObject), src/application/cli/import.ts_
  - _Requirements: REQ-MCP-003_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/objects.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_list_objects, catdoc_show_object, catdoc_import_document tools following REQ-MCP-003 | Restrictions: Must follow TDD workflow, validate file paths within project directory | Success: All TDD gates approved, tools manage objects correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 6. 射管理ツール実装
  - File: src/presentation/mcp/tools/morphisms.ts
  - catdoc_list_morphisms、catdoc_show_morphismツール
  - Purpose: 射の一覧取得と詳細表示
  - _Leverage: src/application/cli/list.ts (listMorphisms)_
  - _Requirements: REQ-MCP-004_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/morphisms.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_list_morphisms and catdoc_show_morphism tools following REQ-MCP-004 | Restrictions: Must follow TDD workflow, support categoryId filtering | Success: All TDD gates approved, tools return correct morphism data | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 4: 検証ツール

- [x] 7. 全体検証ツール実装
  - File: src/presentation/mcp/tools/validate.ts
  - catdoc_validateツール（全体検証）
  - Purpose: カテゴリ、関手、自然変換の一括検証
  - _Leverage: src/application/cli/validate.ts (validateAll)_
  - _Requirements: REQ-MCP-005 (1-4)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/validate.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_validate tool following REQ-MCP-005 criteria 1-4, reusing validateAll from CLI | Restrictions: Must follow TDD workflow, return isValid, errors, warnings, summary | Success: All TDD gates approved, validation results are accurate | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 8. カテゴリ単体検証ツール実装
  - File: src/presentation/mcp/tools/validate.ts (追記)
  - catdoc_validate_categoryツール
  - Purpose: 単一カテゴリの圏論公理検証
  - _Leverage: src/application/cli/validate.ts (validateCategories), src/domain/services/VerificationService.ts_
  - _Requirements: REQ-MCP-005 (5)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/validate.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_validate_category tool following REQ-MCP-005 criterion 5, checking identity morphisms, reference integrity, composition closure | Restrictions: Must follow TDD workflow, provide detailed error messages | Success: All TDD gates approved, category axioms are verified correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 9. 関手検証ツール実装
  - File: src/presentation/mcp/tools/validate.ts (追記)
  - catdoc_validate_functorツール
  - Purpose: 単一関手の公理検証
  - _Leverage: src/application/cli/validate.ts (validateFunctors), src/domain/services/VerificationService.ts_
  - _Requirements: REQ-MCP-005 (6)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/validate.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_validate_functor tool following REQ-MCP-005 criterion 6, checking category existence, object mapping, identity preservation | Restrictions: Must follow TDD workflow, verify F(id_A) = id_{F(A)} | Success: All TDD gates approved, functor axioms are verified correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 10. 自然変換検証ツール実装
  - File: src/presentation/mcp/tools/validate.ts (追記)
  - catdoc_validate_natural_transformationツール
  - Purpose: 単一自然変換の検証
  - _Leverage: src/application/cli/validate.ts (validateNaturalTransformations), src/domain/services/VerificationService.ts_
  - _Requirements: REQ-MCP-005 (7)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/validate.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_validate_natural_transformation tool following REQ-MCP-005 criterion 7, checking functor existence, component completeness, type correctness | Restrictions: Must follow TDD workflow, verify η_A: F(A) → G(A) | Success: All TDD gates approved, natural transformation is verified correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 5: 探索・検索ツール

- [x] 11. パス探索ツール実装
  - File: src/presentation/mcp/tools/trace.ts
  - catdoc_traceツール
  - Purpose: オブジェクト間のパス探索
  - _Leverage: src/application/cli/trace.ts (tracePath, traceDomainPath)_
  - _Requirements: REQ-MCP-006_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/trace.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_trace tool following REQ-MCP-006, reusing tracePath from CLI | Restrictions: Must follow TDD workflow, return paths sorted by length | Success: All TDD gates approved, paths are found correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 12. 検索ツール実装
  - File: src/presentation/mcp/tools/search.ts
  - catdoc_searchツール
  - Purpose: キーワードによるオブジェクト検索
  - _Leverage: src/application/cli/search.ts (searchObjects)_
  - _Requirements: REQ-MCP-007_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/search.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_search tool following REQ-MCP-007, reusing searchObjects from CLI | Restrictions: Must follow TDD workflow, support domain filtering | Success: All TDD gates approved, search returns relevant results | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 6: 関手・自然変換ツール

- [x] 13. 関手ツール実装
  - File: src/presentation/mcp/tools/functors.ts
  - catdoc_list_functors、catdoc_show_functorツール
  - Purpose: 関手の一覧取得と詳細表示
  - _Leverage: src/application/cli/show.ts (showFunctor)_
  - _Requirements: REQ-MCP-008 (1-2)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/functors.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_list_functors and catdoc_show_functor tools following REQ-MCP-008 criteria 1-2 | Restrictions: Must follow TDD workflow, include object and morphism mappings | Success: All TDD gates approved, functor data is returned correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 14. 自然変換ツール実装
  - File: src/presentation/mcp/tools/natural-transformations.ts
  - catdoc_list_natural_transformations、catdoc_show_natural_transformationツール
  - Purpose: 自然変換の一覧取得と詳細表示
  - _Leverage: 既存エンティティからの直接取得_
  - _Requirements: REQ-MCP-008 (3-4)_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/natural-transformations.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_list_natural_transformations and catdoc_show_natural_transformation tools following REQ-MCP-008 criteria 3-4 | Restrictions: Must follow TDD workflow, include components and source/target functors | Success: All TDD gates approved, natural transformation data is returned correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 7: ユーティリティツール

- [x] 15. 初期化ツール実装
  - File: src/presentation/mcp/tools/init.ts
  - catdoc_initツール
  - Purpose: 新規プロジェクトの初期化
  - _Leverage: src/application/cli/init.ts (initProject)_
  - _Requirements: REQ-MCP-011_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/init.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_init tool following REQ-MCP-011, reusing initProject from CLI | Restrictions: Must follow TDD workflow, respect force option | Success: All TDD gates approved, project initialization works correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 16. グラフデータツール実装
  - File: src/presentation/mcp/tools/graph.ts
  - catdoc_get_graphツール
  - Purpose: グラフ可視化用データの取得
  - _Leverage: src/application/api/server.ts (graphエンドポイントロジック)_
  - _Requirements: REQ-MCP-012_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/tools/graph.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Tool Developer | Task: Implement catdoc_get_graph tool following REQ-MCP-012, returning nodes and edges for visualization | Restrictions: Must follow TDD workflow, include node metadata | Success: All TDD gates approved, graph data is correctly structured | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 8: ツール登録・統合

- [x] 17. ツール登録モジュール
  - File: src/presentation/mcp/tools/index.ts
  - 全ツールのエクスポートと登録関数
  - Purpose: すべてのツールをMCPサーバーに登録
  - _Leverage: 各ツールモジュール_
  - _Requirements: REQ-MCP-001_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Integration Developer | Task: Create tool registration module that exports and registers all MCP tools | Restrictions: Export all tools, provide registerTools function | Success: All 19 tools are registered and accessible | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 9: ダッシュボード連携

- [x] 18. ダッシュボード自動起動実装
  - File: src/presentation/mcp/server.ts (追記)
  - --dashboardオプション処理
  - Purpose: MCPサーバーと同時にダッシュボードを起動
  - _Leverage: src/application/cli/dashboard.ts (createDashboardServer)_
  - _Requirements: REQ-MCP-009_
  - _TDD: true_
  - _TestPath: tests/presentation/mcp/server.test.ts_
  - _Language: typescript_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: MCP Server Developer | Task: Implement --dashboard option following REQ-MCP-009, starting dashboard server alongside MCP server | Restrictions: Must follow TDD workflow, log dashboard URL to stderr | Success: All TDD gates approved, dashboard starts with MCP server | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 10: CLIコマンド追加

- [x] 19. MCP CLIコマンド追加
  - File: src/index.ts (追記)
  - catdoc mcpコマンドの追加
  - Purpose: CLIからMCPサーバーを起動可能に
  - _Leverage: src/presentation/mcp/server.ts_
  - _Requirements: REQ-MCP-001, REQ-MCP-009_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: CLI Developer | Task: Add 'catdoc mcp' command with --dashboard and --port options | Restrictions: Integrate with existing commander program, handle SIGINT gracefully | Success: 'catdoc mcp' starts MCP server, options work correctly | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 11: npm配布設定

- [x] 20. npm配布設定
  - File: package.json (更新)
  - npm公開用のメタデータ設定
  - binエントリの追加
  - Purpose: npmパッケージとして配布可能に
  - _Leverage: design.mdのnpm Package Configuration_
  - _Requirements: REQ-MCP-010_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Package Maintainer | Task: Configure package.json for npm publishing as @mayyya/catdoc-mcp following REQ-MCP-010 | Restrictions: Set name to @mayyya/catdoc-mcp, configure bin entries, set files array | Success: npm pack succeeds, package is publishable | Mark task in-progress in tasks.md before starting, mark complete when done_

- [x] 21. MCPエントリポイント作成
  - File: src/mcp.ts
  - npm bin用のMCPサーバーエントリポイント
  - Purpose: npx @mayyya/catdoc-mcpで直接起動可能に
  - _Leverage: src/presentation/mcp/server.ts_
  - _Requirements: REQ-MCP-010_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: CLI Developer | Task: Create MCP entry point for direct npx execution | Restrictions: Handle environment variables, start server immediately | Success: npx @mayyya/catdoc-mcp starts server | Mark task in-progress in tasks.md before starting, mark complete when done_

### Phase 12: ドキュメント・最終確認

- [x] 22. README更新
  - File: README.md (更新)
  - MCPサーバーの設定・使用方法を追記
  - Purpose: ユーザーがMCPサーバーを設定できるようにする
  - _Leverage: design.mdのMCP設定例_
  - _Requirements: REQ-NFR-USE-003_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer | Task: Update README.md with MCP server setup instructions, Claude Desktop config example | Restrictions: Keep existing content, add MCP section | Success: Users can configure MCP server following README | Mark task in-progress in tasks.md before starting, mark complete when done_

- [ ] 23. 統合テスト
  - File: tests/presentation/mcp/integration.test.ts
  - エンドツーエンドのMCPサーバーテスト
  - Purpose: 全機能の統合動作確認
  - _Leverage: 全ツールモジュール_
  - _Requirements: All REQ-MCP-*_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Create integration tests for MCP server covering all tools | Restrictions: Test real tool execution, verify JSON responses | Success: All tools work correctly in integration | Mark task in-progress in tasks.md before starting, mark complete when done_

- [ ] 24. 最終確認・クリーンアップ
  - lint、typecheck、全テスト実行
  - Purpose: リリース前の品質確認
  - _Requirements: All REQ-NFR-*_
  - _Prompt: Implement the task for spec mcp-server, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Release Engineer | Task: Run final quality checks (lint, typecheck, tests), fix any issues | Restrictions: All checks must pass | Success: bun run ci passes, no errors or warnings | Mark task in-progress in tasks.md before starting, mark complete when done_
