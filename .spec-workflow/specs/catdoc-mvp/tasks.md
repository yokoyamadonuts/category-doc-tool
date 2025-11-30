# Tasks Document

## TDD Reference

For tasks marked with `_TDD: true_`, you MUST follow the TDD workflow using these tools:

1. **[RED] Gate-A**: Write failing tests → `run-tests` (all fail) → `tdd-gate` validate/approve gate:A
2. **[GREEN] Gate-B**: Implement code → `run-tests` (all pass) → `tdd-gate` validate/approve gate:B
3. **[REFACTOR] Gate-C**: Refactor → `run-tests` (still pass) → `generate-trace` → `tdd-gate` validate/approve gate:C

Task cannot be marked [x] until Gate-C is approved.

---

## Phase 1: Domain Layer - Core Entities

### Task 1.1: Object Entity

- [x] 1.1 Create Object entity class
  - File: `src/domain/entities/Object.ts`
  - Implement immutable Object class with id, title, domain, metadata, content
  - Pure TypeScript implementation (no external dependencies)
  - Purpose: Represent category theory objects (documents)
  - _Leverage: None (base entity)_
  - _Requirements: REQ-DOC-001, REQ-DOC-002_
  - _TDD: true_
  - _TestPath: tests/domain/Object.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer specializing in domain-driven design and category theory

      Task: Create the Object entity class in src/domain/entities/Object.ts following these specifications:
      - Immutable class with readonly properties: id (string), title (string), domain (string), metadata (Record<string, any>), content (string | undefined)
      - Constructor accepting all properties
      - Getter methods: getId(), getTitle(), getDomain(), getMetadata(), getContent()
      - Factory method: static create(id, title, domain, metadata?, content?)
      - Validation: id and title must be non-empty strings

      Restrictions:
      - No external dependencies (pure TypeScript)
      - Do not add methods not specified
      - Follow immutability pattern

      _Leverage: None (base entity)
      _Requirements: REQ-DOC-001, REQ-DOC-002

      Success:
      - All tests pass with 80%+ coverage
      - Gate-A (RED): Tests written, all fail
      - Gate-B (GREEN): Implementation complete, all pass
      - Gate-C (REFACTOR): Code clean, traceability complete

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly using tdd-gate tool
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 1.2: Morphism Entity

- [x] 1.2 Create Morphism entity class
  - File: `src/domain/entities/Morphism.ts`
  - Implement Morphism class representing arrows between objects
  - Include compose() method for morphism composition
  - Purpose: Represent category theory morphisms (relationships)
  - _Leverage: src/domain/entities/Object.ts_
  - _Requirements: REQ-CAT-001, REQ-CAT-002_
  - _TDD: true_
  - _TestPath: tests/domain/Morphism.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer with category theory knowledge

      Task: Create the Morphism entity class in src/domain/entities/Morphism.ts:
      - Immutable class with: id (string), name (string), source (string), target (string), metadata (Record<string, any>)
      - Constructor accepting all properties
      - Getter methods: getId(), getName(), getSource(), getTarget(), getMetadata()
      - compose(other: Morphism): Morphism | null - returns composed morphism if this.target === other.source, null otherwise
      - Factory method: static create(id, name, source, target, metadata?)
      - Static identity method: static identity(objectId: string): Morphism

      Restrictions:
      - No external dependencies
      - compose() must validate composability (target === other.source)
      - Identity morphism has source === target

      _Leverage: src/domain/entities/Object.ts
      _Requirements: REQ-CAT-001, REQ-CAT-002

      Success:
      - Gate-A/B/C all approved
      - compose() correctly handles all cases
      - Identity morphisms work correctly

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 1.3: Category Entity

- [x] 1.3 Create Category entity class
  - File: `src/domain/entities/Category.ts`
  - Implement Category class containing objects and morphisms
  - Include lookup methods for objects and morphisms
  - Purpose: Represent a category with objects and morphisms
  - _Leverage: src/domain/entities/Object.ts, src/domain/entities/Morphism.ts_
  - _Requirements: REQ-CAT-001, REQ-CAT-003_
  - _TDD: true_
  - _TestPath: tests/domain/Category.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer with category theory expertise

      Task: Create the Category entity class in src/domain/entities/Category.ts:
      - Immutable class with: id (string), name (string), objects (Object[]), morphisms (Morphism[])
      - Constructor accepting all properties
      - Getter methods: getId(), getName(), getObjects(), getMorphisms()
      - Lookup methods: getObject(id: string): Object | undefined, getMorphism(id: string): Morphism | undefined
      - getMorphismsBySource(objectId: string): Morphism[]
      - getMorphismsByTarget(objectId: string): Morphism[]
      - Factory method: static create(id, name, objects?, morphisms?)

      Restrictions:
      - No external dependencies
      - Objects and morphisms arrays should be immutable (return copies)

      _Leverage: src/domain/entities/Object.ts, src/domain/entities/Morphism.ts
      _Requirements: REQ-CAT-001, REQ-CAT-003

      Success:
      - Gate-A/B/C all approved
      - All lookup methods work correctly
      - Immutability maintained

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 1.4: Functor Entity

- [x] 1.4 Create Functor entity class
  - File: `src/domain/entities/Functor.ts`
  - Implement Functor class for category mappings
  - Include mapping methods and axiom checking
  - Purpose: Represent functors between categories
  - _Leverage: src/domain/entities/Category.ts, src/domain/entities/Object.ts, src/domain/entities/Morphism.ts_
  - _Requirements: REQ-CAT-003_
  - _TDD: true_
  - _TestPath: tests/domain/Functor.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer specializing in category theory implementations

      Task: Create the Functor entity class in src/domain/entities/Functor.ts:
      - Immutable class with: id (string), name (string), sourceCategory (string), targetCategory (string), objectMapping (Map<string, string>), morphismMapping (Map<string, string>)
      - Constructor accepting all properties
      - Getter methods: getId(), getName(), getSourceCategory(), getTargetCategory()
      - mapObject(objectId: string): string | undefined
      - mapMorphism(morphismId: string): string | undefined
      - Factory method: static create(id, name, sourceCategory, targetCategory, objectMapping, morphismMapping)

      Restrictions:
      - No external dependencies
      - Maps should be immutable (return new Map on get)
      - Validation of mapping consistency is done in services

      _Leverage: src/domain/entities/Category.ts
      _Requirements: REQ-CAT-003

      Success:
      - Gate-A/B/C all approved
      - Mapping methods work correctly
      - Immutability maintained

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 1.5: NaturalTransformation Entity

- [x] 1.5 Create NaturalTransformation entity class
  - File: `src/domain/entities/NaturalTransformation.ts`
  - Implement NaturalTransformation class for functor mappings
  - Include component access methods
  - Purpose: Represent natural transformations between functors
  - _Leverage: src/domain/entities/Functor.ts, src/domain/entities/Morphism.ts_
  - _Requirements: REQ-CAT-004_
  - _TDD: true_
  - _TestPath: tests/domain/NaturalTransformation.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer with advanced category theory knowledge

      Task: Create the NaturalTransformation entity class in src/domain/entities/NaturalTransformation.ts:
      - Immutable class with: id (string), name (string), sourceFunctor (string), targetFunctor (string), components (Map<string, string>) - maps object id to morphism id
      - Constructor accepting all properties
      - Getter methods: getId(), getName(), getSourceFunctor(), getTargetFunctor()
      - getComponent(objectId: string): string | undefined
      - getAllComponents(): Map<string, string>
      - Factory method: static create(id, name, sourceFunctor, targetFunctor, components)

      Restrictions:
      - No external dependencies
      - Components map should be immutable
      - Naturality verification is done in services

      _Leverage: src/domain/entities/Functor.ts, src/domain/entities/Morphism.ts
      _Requirements: REQ-CAT-004

      Success:
      - Gate-A/B/C all approved
      - Component access works correctly
      - Immutability maintained

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 2: Domain Layer - Services

### Task 2.1: CompositionService

- [x] 2.1 Create CompositionService
  - File: `src/domain/services/CompositionService.ts`
  - Implement morphism and functor composition logic
  - Pure domain service with no external dependencies
  - Purpose: Calculate morphism and functor compositions
  - _Leverage: src/domain/entities/Morphism.ts, src/domain/entities/Functor.ts_
  - _Requirements: REQ-CAT-002_
  - _TDD: true_
  - _TestPath: tests/domain/CompositionService.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer specializing in domain services

      Task: Create CompositionService in src/domain/services/CompositionService.ts:
      - Class with methods:
        - composeMorphisms(f: Morphism, g: Morphism): Morphism | null
          - Returns g∘f if f.target === g.source
          - Composed morphism has id: `composed-${f.id}-${g.id}`, name: `${g.name}∘${f.name}`
        - composeFunctors(f: Functor, g: Functor): Functor | null
          - Returns g∘f if f.targetCategory === g.sourceCategory
          - Composes object and morphism mappings

      Restrictions:
      - No external dependencies
      - Return null for invalid compositions
      - Do not modify input entities

      _Leverage: src/domain/entities/Morphism.ts, src/domain/entities/Functor.ts
      _Requirements: REQ-CAT-002

      Success:
      - Gate-A/B/C all approved
      - Composition logic is mathematically correct
      - Edge cases handled

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 2.2: VerificationService

- [x] 2.2 Create VerificationService
  - File: `src/domain/services/VerificationService.ts`
  - Implement category axiom verification (identity, associativity)
  - Implement functor axiom verification
  - Implement natural transformation verification
  - Purpose: Verify mathematical correctness of category structures
  - _Leverage: src/domain/entities/*.ts, src/domain/services/CompositionService.ts_
  - _Requirements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004_
  - _TDD: true_
  - _TestPath: tests/domain/VerificationService.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer with deep category theory expertise

      Task: Create VerificationService in src/domain/services/VerificationService.ts:
      - Interface VerificationResult { isValid: boolean; errors: string[]; warnings: string[] }
      - Class with methods:
        - verifyCategory(category: Category): VerificationResult
          - Check identity morphism exists for each object
          - Check composition closure (f: A→B, g: B→C implies g∘f exists or is derivable)
          - Check associativity: (h∘g)∘f = h∘(g∘f)
        - verifyFunctor(functor: Functor, source: Category, target: Category): VerificationResult
          - Check identity preservation: F(id_A) = id_{F(A)}
          - Check composition preservation: F(g∘f) = F(g)∘F(f)
        - verifyNaturalTransformation(natTrans: NaturalTransformation, sourceFunctor: Functor, targetFunctor: Functor, category: Category): VerificationResult
          - Check naturality: for all f: A→B, η_B ∘ F(f) = G(f) ∘ η_A

      Restrictions:
      - No external dependencies except domain entities
      - Return detailed error messages with object/morphism IDs
      - Use CompositionService for composition calculations

      _Leverage: src/domain/entities/*.ts, src/domain/services/CompositionService.ts
      _Requirements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004

      Success:
      - Gate-A/B/C all approved
      - All category axioms verified correctly
      - Detailed error reporting

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 2.3: TraversalService

- [x] 2.3 Create TraversalService
  - File: `src/domain/services/TraversalService.ts`
  - Implement path finding between objects
  - Implement domain path finding through functors
  - Purpose: Find transformation paths through categories
  - _Leverage: src/domain/entities/*.ts_
  - _Requirements: REQ-SEARCH-001_
  - _TDD: true_
  - _TestPath: tests/domain/TraversalService.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Developer specializing in graph algorithms

      Task: Create TraversalService in src/domain/services/TraversalService.ts:
      - Interface TransformationPath { steps: Array<Functor | NaturalTransformation>; resultObject: string }
      - Class with methods:
        - findPath(source: string, target: string, category: Category): Morphism[]
          - BFS/DFS to find morphism path from source to target
          - Return empty array if no path exists
        - findAllPaths(source: string, target: string, category: Category): Morphism[][]
          - Find all possible paths (up to reasonable limit)
        - findDomainPath(sourceObj: string, targetCat: string, categories: Category[], functors: Functor[], natTransforms: NaturalTransformation[]): TransformationPath[]
          - Find paths through functors and natural transformations to reach target category

      Restrictions:
      - No external dependencies
      - Limit path search depth to avoid infinite loops
      - Return paths sorted by length

      _Leverage: src/domain/entities/*.ts
      _Requirements: REQ-SEARCH-001

      Success:
      - Gate-A/B/C all approved
      - Path finding works for complex graphs
      - Performance acceptable for 1000+ nodes

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 3: Domain Layer - Repository Interfaces

### Task 3.1: Repository Interfaces

- [x] 3.1 Create repository interfaces
  - File: `src/domain/interfaces/IRepository.ts`
  - Define interfaces for all entity repositories
  - Purpose: Abstract data access for Clean Architecture
  - _Leverage: src/domain/entities/*.ts_
  - _Requirements: REQ-SYS-001_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: TypeScript Architect specializing in Clean Architecture

      Task: Create repository interfaces in src/domain/interfaces/IRepository.ts:
      - IObjectRepository { findAll(): Promise<Object[]>; findById(id: string): Promise<Object | null>; findByCategoryId(categoryId: string): Promise<Object[]>; save(obj: Object): Promise<void>; delete(id: string): Promise<void> }
      - IMorphismRepository { findAll(): Promise<Morphism[]>; findById(id: string): Promise<Morphism | null>; findBySourceAndTarget(source: string, target: string): Promise<Morphism[]>; findComposablePath(source: string, target: string): Promise<Morphism[]>; save(morphism: Morphism): Promise<void>; delete(id: string): Promise<void> }
      - ICategoryRepository { findAll(): Promise<Category[]>; findById(id: string): Promise<Category | null>; findByName(name: string): Promise<Category | null>; save(category: Category): Promise<void>; delete(id: string): Promise<void> }
      - IFunctorRepository { findAll(): Promise<Functor[]>; findById(id: string): Promise<Functor | null>; findBySourceCategory(categoryId: string): Promise<Functor[]>; findByTargetCategory(categoryId: string): Promise<Functor[]>; save(functor: Functor): Promise<void>; delete(id: string): Promise<void> }
      - INaturalTransformationRepository { findAll(): Promise<NaturalTransformation[]>; findById(id: string): Promise<NaturalTransformation | null>; findBySourceFunctor(functorId: string): Promise<NaturalTransformation[]>; findByTargetFunctor(functorId: string): Promise<NaturalTransformation[]>; save(natTrans: NaturalTransformation): Promise<void>; delete(id: string): Promise<void> }

      Restrictions:
      - Only interface definitions, no implementations
      - Follow Promise-based async pattern
      - No external dependencies

      _Leverage: src/domain/entities/*.ts
      _Requirements: REQ-SYS-001

      Success:
      - Interfaces compile without errors
      - Complete coverage of CRUD operations
      - Consistent naming and patterns

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement interfaces
      3. Mark task as [x] in tasks.md when complete_

---

## Phase 4: Infrastructure Layer - Neo4j

### Task 4.1: Neo4j Connection

- [x] 4.1 Create Neo4j connection manager
  - File: `src/infrastructure/database/neo4j/connection.ts`
  - Implement connection pool and query execution
  - Purpose: Manage Neo4j database connections
  - _Leverage: neo4j-driver package_
  - _Requirements: REQ-SYS-001_
  - _TDD: true_
  - _TestPath: tests/infrastructure/neo4j/connection.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with Neo4j expertise

      Task: Create Neo4j connection manager in src/infrastructure/database/neo4j/connection.ts:
      - Class Neo4jConnection with:
        - constructor(uri: string, username: string, password: string)
        - async connect(): Promise<void> - establish connection with retry logic (3 retries, exponential backoff)
        - async executeQuery(cypher: string, params: Record<string, any>): Promise<QueryResult>
        - async close(): Promise<void>
        - isConnected(): boolean
      - Handle connection errors gracefully
      - Implement connection pool management

      Restrictions:
      - Use official neo4j-driver package
      - Implement proper error handling
      - Log connection events

      _Leverage: neo4j-driver package
      _Requirements: REQ-SYS-001

      Success:
      - Gate-A/B/C all approved
      - Connection retry logic works
      - Proper resource cleanup

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 4.2: Neo4j Schema

- [x] 4.2 Create Neo4j schema definitions
  - File: `src/infrastructure/database/neo4j/schema.ts`
  - Define node labels and relationship types
  - Create schema initialization queries
  - Purpose: Define graph database structure
  - _Leverage: src/domain/entities/*.ts_
  - _Requirements: REQ-SYS-001_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Database Administrator with Neo4j expertise

      Task: Create Neo4j schema in src/infrastructure/database/neo4j/schema.ts:
      - Export node labels: OBJECT, CATEGORY, FUNCTOR, NATURAL_TRANSFORMATION
      - Export relationship types: MORPHISM, IDENTITY, COMPOSED, BELONGS_TO, MAPS_OBJECT, MAPS_MORPHISM
      - Function getIndexCreationQueries(): string[] - returns Cypher queries for all indexes
      - Function getConstraintCreationQueries(): string[] - returns Cypher queries for uniqueness constraints
      - Function initializeSchema(connection: Neo4jConnection): Promise<void> - runs all schema setup

      Restrictions:
      - Follow design.md schema specifications exactly
      - Include all necessary indexes for performance

      _Leverage: src/domain/entities/*.ts
      _Requirements: REQ-SYS-001

      Success:
      - Schema matches design.md specifications
      - All indexes defined
      - Initialization works correctly

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement schema definitions
      3. Mark task as [x] in tasks.md when complete_

### Task 4.3: Neo4j Repositories

- [x] 4.3 Implement Neo4j repositories
  - Files: `src/infrastructure/database/neo4j/repositories/*.ts`
  - Implement all repository interfaces for Neo4j
  - Use Cypher queries for graph operations
  - Purpose: Provide graph data persistence
  - _Leverage: src/domain/interfaces/IRepository.ts, src/infrastructure/database/neo4j/connection.ts_
  - _Requirements: REQ-SYS-001_
  - _TDD: true_
  - _TestPath: tests/infrastructure/neo4j/repositories/*.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with Neo4j and Cypher expertise

      Task: Implement Neo4j repositories:
      - ObjectRepository.ts - implements IObjectRepository
      - MorphismRepository.ts - implements IMorphismRepository (uses MORPHISM relationships)
      - CategoryRepository.ts - implements ICategoryRepository
      - FunctorRepository.ts - implements IFunctorRepository (stores mappings as JSON properties)
      - NaturalTransformationRepository.ts - implements INaturalTransformationRepository

      Each repository:
      - Constructor takes Neo4jConnection
      - Uses Cypher queries optimized for graph operations
      - Handles entity<->node mapping

      Restrictions:
      - Use parameterized queries to prevent injection
      - Follow repository interface contracts exactly
      - Optimize queries for performance

      _Leverage: src/domain/interfaces/IRepository.ts, src/infrastructure/database/neo4j/connection.ts
      _Requirements: REQ-SYS-001

      Success:
      - Gate-A/B/C all approved for each repository
      - All interface methods implemented
      - Queries are optimized

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 5: Infrastructure Layer - Turso

### Task 5.1: Turso Connection

- [x] 5.1 Create Turso connection manager
  - File: `src/infrastructure/database/turso/connection.ts`
  - Implement connection and query execution
  - Purpose: Manage Turso database connections
  - _Leverage: @libsql/client package_
  - _Requirements: REQ-SYS-001_
  - _TDD: true_
  - _TestPath: tests/infrastructure/turso/connection.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with SQLite/Turso expertise

      Task: Create Turso connection in src/infrastructure/database/turso/connection.ts:
      - Class TursoConnection with:
        - constructor(url: string, authToken: string)
        - async connect(): Promise<void> - with retry logic
        - async execute(sql: string, params: any[]): Promise<Result>
        - async close(): Promise<void>
        - isConnected(): boolean
      - Handle connection failures gracefully
      - Support local SQLite fallback for development

      Restrictions:
      - Use @libsql/client package
      - Implement proper error handling
      - Support both remote Turso and local SQLite

      _Leverage: @libsql/client package
      _Requirements: REQ-SYS-001

      Success:
      - Gate-A/B/C all approved
      - Works with both Turso and local SQLite
      - Proper error handling

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 5.2: Turso Schema and Repositories

- [x] 5.2 Create Turso schema and repositories
  - Files: `src/infrastructure/database/turso/schema.ts`, `src/infrastructure/database/turso/repositories/*.ts`
  - Define tables for users, settings, audit_logs
  - Implement UserRepository and ConfigRepository
  - Purpose: Store metadata in relational database
  - _Leverage: src/infrastructure/database/turso/connection.ts_
  - _Requirements: REQ-SYS-001, REQ-SYS-002_
  - _TDD: true_
  - _TestPath: tests/infrastructure/turso/*.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with SQL and repository pattern expertise

      Task: Create Turso schema and repositories:
      - schema.ts:
        - Tables: users, settings, audit_logs (as defined in design.md)
        - Function getTableCreationQueries(): string[]
        - Function initializeSchema(connection: TursoConnection): Promise<void>
      - UserRepository.ts: findById, save
      - ConfigRepository.ts: get, set, getAll

      Restrictions:
      - Use prepared statements for all queries
      - Follow design.md schema exactly
      - Handle concurrent access properly

      _Leverage: src/infrastructure/database/turso/connection.ts
      _Requirements: REQ-SYS-001, REQ-SYS-002

      Success:
      - Gate-A/B/C all approved
      - Schema matches design.md
      - Repositories work correctly

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 6: Infrastructure Layer - Parsers

### Task 6.1: YAML Parser

- [x] 6.1 Create YAML parser for category.yaml
  - File: `src/infrastructure/parsers/YamlParser.ts`
  - Parse and validate category.yaml configuration
  - Convert to domain entities
  - Purpose: Load category structure from YAML
  - _Leverage: yaml package, zod package_
  - _Requirements: REQ-CAT-001, REQ-CAT-003, REQ-CAT-004_
  - _TDD: true_
  - _TestPath: tests/infrastructure/parsers/YamlParser.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with YAML/validation expertise

      Task: Create YamlParser in src/infrastructure/parsers/YamlParser.ts:
      - Interface CategoryConfig { categories, morphisms, functors, naturalTransformations }
      - Interface ValidationResult { isValid: boolean; errors: string[] }
      - Class YamlParser:
        - async parse(filePath: string): Promise<CategoryConfig>
        - validate(config: CategoryConfig): ValidationResult
        - toEntities(config: CategoryConfig): { categories: Category[]; morphisms: Morphism[]; functors: Functor[]; naturalTransformations: NaturalTransformation[] }
      - Use zod for schema validation
      - Support partial configs (missing sections allowed with warnings)

      Restrictions:
      - Use yaml package for parsing
      - Use zod for validation
      - Return detailed validation errors with line numbers if possible

      _Leverage: yaml package, zod package
      _Requirements: REQ-CAT-001, REQ-CAT-003, REQ-CAT-004

      Success:
      - Gate-A/B/C all approved
      - Parses valid YAML correctly
      - Validation catches all errors

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 6.2: Markdown Parser

- [x] 6.2 Create Markdown parser for document import
  - File: `src/infrastructure/parsers/MarkdownParser.ts`
  - Parse Markdown with YAML frontmatter
  - Extract metadata and content
  - Purpose: Import documents as objects
  - _Leverage: gray-matter or similar package_
  - _Requirements: REQ-DOC-001_
  - _TDD: true_
  - _TestPath: tests/infrastructure/parsers/MarkdownParser.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer with Markdown processing expertise

      Task: Create MarkdownParser in src/infrastructure/parsers/MarkdownParser.ts:
      - Interface ParsedDocument { id?: string; title: string; domain?: string; metadata: Record<string, any>; content: string }
      - Class MarkdownParser:
        - async parse(filePath: string): Promise<ParsedDocument>
        - async parseMany(pattern: string): Promise<ParsedDocument[]>
        - extractMetadata(content: string): { metadata: Record<string, any>; content: string }
      - Extract YAML frontmatter as metadata
      - Use filename as default id if not in frontmatter
      - Use first H1 as title if not in frontmatter

      Restrictions:
      - Handle missing frontmatter gracefully
      - Support common frontmatter fields (title, id, domain, etc.)
      - Validate file existence

      _Leverage: gray-matter or similar package
      _Requirements: REQ-DOC-001

      Success:
      - Gate-A/B/C all approved
      - Frontmatter parsed correctly
      - Content preserved accurately

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 7: Application Layer - CLI

### Task 7.1: CLI Init Command

- [x] 7.1 Create catdoc init command
  - File: `src/application/cli/init.ts`
  - Initialize .catdoc directory and databases
  - Generate template files
  - Purpose: Set up new CatDoc project
  - _Leverage: commander package, src/infrastructure/database/*.ts_
  - _Requirements: REQ-SYS-002_
  - _TDD: true_
  - _TestPath: tests/application/cli/init.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer with Node.js expertise

      Task: Create init command in src/application/cli/init.ts:
      - Function initCommand() - commander command definition
      - Creates .catdoc/ directory
      - Generates .catdoc/category.yaml template with examples
      - Generates .catdoc/config.yaml for database settings
      - Initializes Neo4j schema (if connection available)
      - Initializes Turso schema (if connection available)
      - Shows success message with next steps
      - Handles existing .catdoc/ (prompt for overwrite)

      Restrictions:
      - Use commander for CLI
      - Show progress spinners/messages
      - Handle errors gracefully with helpful messages

      _Leverage: commander package, src/infrastructure/database/*.ts
      _Requirements: REQ-SYS-002

      Success:
      - Gate-A/B/C all approved
      - Creates all required files
      - Proper error handling

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 7.2: CLI Import Command

- [x] 7.2 Create catdoc import command
  - File: `src/application/cli/import.ts`
  - Import Markdown documents as objects
  - Purpose: Add documents to CatDoc system
  - _Leverage: src/infrastructure/parsers/MarkdownParser.ts, src/infrastructure/database/neo4j/repositories/ObjectRepository.ts_
  - _Requirements: REQ-DOC-001_
  - _TDD: true_
  - _TestPath: tests/application/cli/import.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer with document processing expertise

      Task: Create import command in src/application/cli/import.ts:
      - catdoc import <file-or-pattern> - import one or more Markdown files
      - Options: --domain <domain>, --force (overwrite existing)
      - Parse Markdown with MarkdownParser
      - Create Object entities and save via ObjectRepository
      - Show progress bar for multiple files
      - Report success/failure for each file
      - Handle duplicate IDs (prompt or --force)

      Restrictions:
      - Use commander for CLI
      - Show clear progress feedback
      - Handle file not found errors

      _Leverage: src/infrastructure/parsers/MarkdownParser.ts, src/infrastructure/database/neo4j/repositories/ObjectRepository.ts
      _Requirements: REQ-DOC-001

      Success:
      - Gate-A/B/C all approved
      - Imports files correctly
      - Proper error handling

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 7.3: CLI Validate Command

- [x] 7.3 Create catdoc validate command
  - File: `src/application/cli/validate.ts`
  - Validate category structure and axioms
  - Purpose: Check mathematical correctness
  - _Leverage: src/domain/services/VerificationService.ts, src/infrastructure/parsers/YamlParser.ts_
  - _Requirements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004_
  - _TDD: true_
  - _TestPath: tests/application/cli/validate.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer with validation expertise

      Task: Create validate command in src/application/cli/validate.ts:
      - catdoc validate - validate all categories, functors, natural transformations
      - Options: --categories, --functors, --natural-transformations (validate specific types)
      - Load data from database and category.yaml
      - Run VerificationService checks
      - Display results with colored output (✓ pass, ✗ fail, ⚠ warning)
      - List all errors with specific object/morphism IDs
      - Exit code 0 if valid, 1 if errors

      Restrictions:
      - Use commander for CLI
      - Show detailed error information
      - Performance: complete in <1s for typical use

      _Leverage: src/domain/services/VerificationService.ts, src/infrastructure/parsers/YamlParser.ts
      _Requirements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004

      Success:
      - Gate-A/B/C all approved
      - All validation types work
      - Clear error messages

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 7.4: CLI Search and Trace Commands

- [x] 7.4 Create catdoc search and trace commands
  - Files: `src/application/cli/search.ts`, `src/application/cli/trace.ts`
  - Search objects and trace domain paths
  - Purpose: Find and explore document relationships
  - _Leverage: src/domain/services/TraversalService.ts, repositories_
  - _Requirements: REQ-DOC-002, REQ-SEARCH-001_
  - _TDD: true_
  - _TestPath: tests/application/cli/search.test.ts, tests/application/cli/trace.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer with search/graph expertise

      Task: Create search and trace commands:
      - search.ts:
        - catdoc search <keyword> - search by title/content
        - catdoc search --functor <name> <object-id> - find functor mapping
        - catdoc search --natural <name> <object-id> - find natural transformation component
        - Display results in table format
      - trace.ts:
        - catdoc trace <source-object-id> <target-category> - find transformation paths
        - Use TraversalService.findDomainPath
        - Display all paths with steps
        - Highlight shortest path

      Restrictions:
      - Use commander for CLI
      - Display results clearly
      - Handle "not found" cases gracefully

      _Leverage: src/domain/services/TraversalService.ts, repositories
      _Requirements: REQ-DOC-002, REQ-SEARCH-001

      Success:
      - Gate-A/B/C all approved
      - Search returns correct results
      - Trace finds all paths

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 7.5: CLI List and Show Commands

- [x] 7.5 Create catdoc list and show commands
  - File: `src/application/cli/list.ts`, `src/application/cli/show.ts`
  - List and display objects
  - Purpose: View document information
  - _Leverage: repositories_
  - _Requirements: REQ-DOC-002_
  - _TDD: true_
  - _TestPath: tests/application/cli/list.test.ts, tests/application/cli/show.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer

      Task: Create list and show commands:
      - list.ts:
        - catdoc list - list all objects in table format (id, title, domain)
        - Options: --domain <domain> (filter), --format json|table
      - show.ts:
        - catdoc show <object-id> - display object details
        - Show metadata, content preview, related morphisms

      Restrictions:
      - Use commander for CLI
      - Format output nicely
      - Handle empty results

      _Leverage: repositories
      _Requirements: REQ-DOC-002

      Success:
      - Gate-A/B/C all approved
      - List displays correctly
      - Show displays all info

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

### Task 7.6: CLI Entry Point

- [x] 7.6 Create CLI entry point
  - File: `src/index.ts`
  - Register all commands with commander
  - Purpose: Main CLI entry point
  - _Leverage: all CLI commands, commander_
  - _Requirements: REQ-SYS-002_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI Developer

      Task: Create CLI entry point in src/index.ts:
      - Import and register all commands (init, import, validate, search, trace, list, show, dashboard)
      - Set up commander program with version and description
      - Add global options (--config, --verbose)
      - Add --help with examples
      - Handle uncaught errors gracefully

      Restrictions:
      - Use commander for CLI
      - Show helpful usage information
      - Clean error output

      _Leverage: all CLI commands, commander
      _Requirements: REQ-SYS-002

      Success:
      - All commands registered
      - Help displays correctly
      - Entry point works

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement entry point
      3. Mark task as [x] in tasks.md when complete_

---

## Phase 8: Application Layer - API

### Task 8.1: Hono API Server

- [x] 8.1 Create Hono API server
  - File: `src/server.ts`, `src/application/api/*.ts`
  - Implement REST API endpoints
  - Purpose: Serve data to web dashboard
  - _Leverage: Hono framework, repositories, services_
  - _Requirements: REQ-VIS-001, REQ-VIS-003_
  - _TDD: true_
  - _TestPath: tests/application/api/*.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: API Developer with Hono expertise

      Task: Create Hono API server:
      - server.ts: Main server setup with CORS, error handling
      - objects.ts: GET /api/objects, GET /api/objects/:id
      - morphisms.ts: GET /api/morphisms, GET /api/morphisms/:id
      - categories.ts: GET /api/categories, GET /api/categories/:id
      - functors.ts: GET /api/functors, GET /api/functors/:id
      - graph.ts: GET /api/graph (returns nodes and edges for visualization)
      - validate.ts: POST /api/validate (run validation)
      - trace.ts: POST /api/trace (find transformation paths)

      Restrictions:
      - Use Hono framework
      - Bind to 127.0.0.1 only (security)
      - Return JSON responses
      - Handle errors with proper HTTP status codes

      _Leverage: Hono framework, repositories, services
      _Requirements: REQ-VIS-001, REQ-VIS-003

      Success:
      - Gate-A/B/C all approved
      - All endpoints work correctly
      - Proper error handling

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 9: Presentation Layer - Svelte Dashboard

### Task 9.1: Svelte Project Setup

- [ ] 9.1 Set up Svelte project structure
  - Files: `src/presentation/` directory structure
  - Configure SvelteKit and build
  - Purpose: Set up frontend build system
  - _Leverage: SvelteKit, Vite_
  - _Requirements: REQ-VIS-001_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Frontend Developer with Svelte expertise

      Task: Set up Svelte project:
      - Configure SvelteKit in src/presentation/
      - Set up Vite build configuration
      - Create directory structure: lib/components, lib/stores, lib/utils, routes
      - Add base styles and theme
      - Configure API client utility

      Restrictions:
      - Use SvelteKit
      - Configure for production build
      - Keep bundle size minimal

      _Leverage: SvelteKit, Vite
      _Requirements: REQ-VIS-001

      Success:
      - Project builds successfully
      - Development server works
      - Directory structure matches design

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Set up project
      3. Mark task as [x] in tasks.md when complete_

### Task 9.2: Graph Visualization Component

- [ ] 9.2 Create GraphView component
  - File: `src/presentation/lib/components/GraphView.svelte`
  - Implement interactive graph visualization
  - Purpose: Display category graph visually
  - _Leverage: cytoscape.js or similar_
  - _Requirements: REQ-VIS-001, REQ-VIS-002_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Frontend Developer with graph visualization expertise

      Task: Create GraphView component:
      - Props: { nodes: Node[], edges: Edge[], selectedNode?: string }
      - Events: on:nodeClick, on:edgeClick
      - Features:
        - Render nodes (objects) and edges (morphisms)
        - Different colors/shapes per category
        - Drag to reposition nodes
        - Zoom and pan
        - Auto-layout button (hierarchical)
        - Highlight selected node and connected edges
      - Performance: handle 100+ nodes smoothly

      Restrictions:
      - Use cytoscape.js or similar library
      - Optimize for performance
      - Responsive design

      _Leverage: cytoscape.js or similar
      _Requirements: REQ-VIS-001, REQ-VIS-002

      Success:
      - Graph renders correctly
      - Interactions work smoothly
      - Performance acceptable

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement component
      3. Mark task as [x] in tasks.md when complete_

### Task 9.3: Dashboard UI Components

- [ ] 9.3 Create dashboard UI components
  - Files: `src/presentation/lib/components/*.svelte`
  - ObjectList, MorphismList, DetailPanel, CategorySelector, FunctorView
  - Purpose: Build dashboard interface
  - _Leverage: Svelte, stores_
  - _Requirements: REQ-VIS-001, REQ-VIS-003_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Frontend Developer with Svelte expertise

      Task: Create dashboard UI components:
      - ObjectList.svelte: Display objects in list/table with search
      - MorphismList.svelte: Display morphisms with source/target info
      - DetailPanel.svelte: Show selected item details
      - CategorySelector.svelte: Dropdown/tabs to select category
      - FunctorView.svelte: Visualize functor mappings between categories

      All components:
      - Use stores for state
      - Emit events for interactions
      - Support dark/light theme

      Restrictions:
      - Keep components focused and reusable
      - Use consistent styling
      - Accessible (keyboard navigation, ARIA)

      _Leverage: Svelte, stores
      _Requirements: REQ-VIS-001, REQ-VIS-003

      Success:
      - All components work correctly
      - Styling consistent
      - Accessible

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement components
      3. Mark task as [x] in tasks.md when complete_

### Task 9.4: Main Dashboard Page

- [ ] 9.4 Create main dashboard page
  - File: `src/presentation/routes/+page.svelte`
  - Integrate all components
  - Purpose: Complete dashboard UI
  - _Leverage: all components, stores, API client_
  - _Requirements: REQ-VIS-001, REQ-VIS-002, REQ-VIS-003_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Frontend Developer with Svelte expertise

      Task: Create main dashboard page:
      - Layout: Sidebar (list + controls) + Main (graph) + Panel (details)
      - Load data from API on mount
      - Handle loading and error states
      - Integrate GraphView with selection
      - Show DetailPanel for selected nodes/edges
      - CategorySelector to filter view
      - Functor view mode toggle
      - Natural transformation visualization

      Restrictions:
      - Responsive layout
      - Handle API errors gracefully
      - Performance: load in <5s for 100 nodes

      _Leverage: all components, stores, API client
      _Requirements: REQ-VIS-001, REQ-VIS-002, REQ-VIS-003

      Success:
      - Dashboard fully functional
      - All features work
      - Good UX

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement dashboard
      3. Mark task as [x] in tasks.md when complete_

---

## Phase 10: CLI Dashboard Command

### Task 10.1: Dashboard Command

- [ ] 10.1 Create catdoc dashboard command
  - File: `src/application/cli/dashboard.ts`
  - Start Hono server and serve Svelte dashboard
  - Purpose: Launch web dashboard from CLI
  - _Leverage: src/server.ts, Svelte build_
  - _Requirements: REQ-VIS-001_
  - _TDD: true_
  - _TestPath: tests/application/cli/dashboard.test.ts_
  - _Language: ts_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: CLI/Server Developer

      Task: Create dashboard command:
      - catdoc dashboard - start dashboard server
      - Options: --port <port> (default 3000), --open (open browser)
      - Start Hono server with API routes
      - Serve Svelte static build
      - Print URL to console
      - Handle Ctrl+C gracefully

      Restrictions:
      - Use commander for CLI
      - Bind to 127.0.0.1 only
      - Show clear startup message

      _Leverage: src/server.ts, Svelte build
      _Requirements: REQ-VIS-001

      Success:
      - Gate-A/B/C all approved
      - Server starts correctly
      - Dashboard accessible

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Follow TDD workflow strictly
      3. After Gate-C approval, mark task as [x] in tasks.md_

---

## Phase 11: Integration and Testing

### Task 11.1: Integration Tests

- [ ] 11.1 Create integration tests
  - Files: `tests/integration/*.test.ts`
  - End-to-end workflow tests
  - Purpose: Verify complete system works
  - _Leverage: all components_
  - _Requirements: All_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: QA Engineer with E2E testing expertise

      Task: Create integration tests:
      - cli.test.ts: Test CLI workflow (init → import → validate → search → trace)
      - api.test.ts: Test API endpoints with real data
      - Full workflow: Create project, import docs, define categories, validate, visualize

      Restrictions:
      - Use test databases (not production)
      - Clean up after tests
      - Comprehensive coverage

      _Leverage: all components
      _Requirements: All

      Success:
      - All integration tests pass
      - Covers main user workflows
      - Reliable and repeatable

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Implement tests
      3. Mark task as [x] in tasks.md when complete_

### Task 11.2: Test Fixtures

- [ ] 11.2 Create test fixtures
  - Files: `tests/fixtures/*.yaml`, `tests/fixtures/*.md`
  - Sample data for testing
  - Purpose: Provide consistent test data
  - _Leverage: None_
  - _Requirements: All_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: QA Engineer

      Task: Create test fixtures:
      - simple-category.yaml: Basic category with 3-5 objects and morphisms
      - multi-domain.yaml: Multiple categories with functors and natural transformations
      - Sample Markdown documents with frontmatter
      - Invalid YAML files for error testing

      Restrictions:
      - Keep fixtures small but comprehensive
      - Cover edge cases
      - Well-documented

      _Leverage: None
      _Requirements: All

      Success:
      - Fixtures cover all test scenarios
      - Valid and invalid examples
      - Well-organized

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Create fixtures
      3. Mark task as [x] in tasks.md when complete_

---

## Phase 12: Documentation and Cleanup

### Task 12.1: README and Examples

- [ ] 12.1 Create documentation
  - Files: `README.md`, `examples/`
  - Usage documentation and examples
  - Purpose: Help users get started
  - _Leverage: None_
  - _Requirements: All_
  - _TDD: false_
  - _Prompt: |
      Implement the task for spec catdoc-mvp, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Technical Writer

      Task: Create documentation:
      - README.md: Overview, installation, quick start, command reference
      - examples/: Working example project with docs and category.yaml
      - CLI help text for all commands

      Restrictions:
      - Clear and concise
      - Include screenshots for dashboard
      - Keep examples minimal but complete

      _Leverage: None
      _Requirements: All

      Success:
      - README complete and accurate
      - Examples work out of the box
      - Help text helpful

      Instructions:
      1. First mark this task as [-] in tasks.md
      2. Create documentation
      3. Mark task as [x] in tasks.md when complete_
