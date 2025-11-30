#!/usr/bin/env bun
/**
 * CatDoc CLI Entry Point
 * Implements: REQ-SYS-002
 *
 * Main entry point for the CatDoc command-line interface.
 */

import { Command } from "commander";

// Import CLI commands
import { initProject } from "./application/cli/init";
import { importDocument, importDocuments } from "./application/cli/import";
import { validateAll } from "./application/cli/validate";
import { searchObjects, searchByFunctor } from "./application/cli/search";
import { tracePath, traceDomainPath } from "./application/cli/trace";
import { listObjects, listMorphisms, listCategories } from "./application/cli/list";
import { showObject, showCategory, showFunctor } from "./application/cli/show";

// Import parsers
import { YamlParser } from "./infrastructure/parsers/YamlParser";

const program = new Command();

// Program metadata
program
  .name("catdoc")
  .description("Category theory documentation tool for organizing and navigating documents")
  .version("1.0.0");

// Global options
program
  .option("-v, --verbose", "Enable verbose output")
  .option("-c, --config <path>", "Path to configuration file", ".catdoc/config.yaml");

// Init command
program
  .command("init")
  .description("Initialize a new CatDoc project")
  .option("-f, --force", "Overwrite existing .catdoc directory")
  .option("-n, --name <name>", "Project name")
  .action(async (options) => {
    const result = await initProject({
      projectPath: process.cwd(),
      projectName: options.name,
      force: options.force,
    });

    if (result.success) {
      result.messages?.forEach((msg) => console.log(msg));
    } else {
      console.error("Error:", result.error);
      process.exit(1);
    }
  });

// Import command
program
  .command("import <files...>")
  .description("Import Markdown documents as objects")
  .option("-d, --domain <domain>", "Default domain for imported documents", "general")
  .option("-f, --force", "Overwrite existing objects")
  .action(async (files: string[], options) => {
    const result = await importDocuments(files, {
      defaultDomain: options.domain,
      force: options.force,
    });

    console.log(`Imported: ${result.successful}/${files.length} documents`);
    if (result.failed > 0) {
      console.log(`Failed: ${result.failed}`);
      result.errors.forEach((err) => {
        console.error(`  - ${err.filePath}: ${err.error}`);
      });
      process.exit(1);
    }
  });

// Validate command
program
  .command("validate")
  .description("Validate category structure and axioms")
  .option("--categories", "Validate only categories")
  .option("--functors", "Validate only functors")
  .option("--natural-transformations", "Validate only natural transformations")
  .action(async (options) => {
    try {
      // Load configuration
      const parser = new YamlParser();
      const config = await parser.parse(".catdoc/category.yaml");
      const entities = parser.toEntities(config);

      const result = validateAll({
        categories: entities.categories,
        functors: entities.functors,
        naturalTransformations: entities.naturalTransformations,
      });

      // Display results
      console.log("\nValidation Results:");
      console.log(`  Categories: ${result.summary.categoriesChecked}`);
      console.log(`  Functors: ${result.summary.functorsChecked}`);
      console.log(`  Natural Transformations: ${result.summary.naturalTransformationsChecked}`);
      console.log();

      if (result.isValid) {
        console.log("✓ All validations passed");
      } else {
        console.log("✗ Validation failed");
        result.errors.forEach((err) => console.error(`  Error: ${err}`));
        process.exit(1);
      }

      if (result.warnings.length > 0) {
        console.log();
        result.warnings.forEach((warn) => console.warn(`  Warning: ${warn}`));
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Search command
program
  .command("search <query>")
  .description("Search objects by keyword")
  .option("-d, --domain <domain>", "Filter by domain")
  .option("--functor <name>", "Search by functor mapping")
  .option("--natural <name>", "Search by natural transformation component")
  .option("-l, --limit <n>", "Limit number of results", "20")
  .action(async (query: string, options) => {
    try {
      const parser = new YamlParser();
      const config = await parser.parse(".catdoc/category.yaml");
      const entities = parser.toEntities(config);

      // Get all objects from all categories
      const allObjects = entities.categories.flatMap((c) => c.objects);

      const result = searchObjects(allObjects, {
        query,
        domain: options.domain,
        limit: parseInt(options.limit, 10),
      });

      console.log(`Found ${result.totalMatches} results (showing ${result.matches.length}):\n`);
      result.matches.forEach((obj) => {
        console.log(`  ${obj.id}: ${obj.title} [${obj.domain}]`);
      });
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Trace command
program
  .command("trace <source> <target>")
  .description("Find transformation paths between objects or to a category")
  .option("-a, --all", "Find all paths, not just the shortest")
  .option("--category", "Target is a category (trace across domains)")
  .action(async (source: string, target: string, options) => {
    try {
      const parser = new YamlParser();
      const config = await parser.parse(".catdoc/category.yaml");
      const entities = parser.toEntities(config);

      if (options.category) {
        const result = traceDomainPath(
          source,
          target,
          entities.categories,
          entities.functors,
          entities.naturalTransformations
        );

        if (result.found) {
          console.log(`Found ${result.paths.length} path(s) from ${source} to category ${target}:\n`);
          result.paths.forEach((path, i) => {
            console.log(`  Path ${i + 1}:`);
            path.steps.forEach((step) => {
              console.log(`    -> ${step.type}: ${step.name}`);
            });
            console.log(`    Result: ${path.resultObject}`);
          });
        } else {
          console.log(`No path found from ${source} to category ${target}`);
        }
      } else {
        // Find which category contains the source object
        const category = entities.categories.find((c) =>
          c.objects.some((obj) => obj.id === source)
        );

        if (!category) {
          console.error(`Object ${source} not found in any category`);
          process.exit(1);
        }

        const result = tracePath(source, target, category, { findAll: options.all });

        if (result.found) {
          console.log(`Found ${result.paths.length} path(s) from ${source} to ${target}:\n`);
          if (result.shortestPath) {
            console.log(`  Shortest path (${result.shortestPathLength} step(s)):`);
            result.shortestPath.forEach((m) => {
              console.log(`    ${m.source} --[${m.name}]--> ${m.target}`);
            });
          }
        } else {
          console.log(`No path found from ${source} to ${target}`);
        }
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List command
program
  .command("list [type]")
  .description("List objects, morphisms, or categories")
  .option("-d, --domain <domain>", "Filter by domain")
  .option("-f, --format <format>", "Output format (table/json)", "table")
  .option("-l, --limit <n>", "Limit number of results")
  .action(async (type: string = "objects", options) => {
    try {
      const parser = new YamlParser();
      const config = await parser.parse(".catdoc/category.yaml");
      const entities = parser.toEntities(config);

      const listOptions = {
        domain: options.domain,
        format: options.format as "table" | "json",
        limit: options.limit ? parseInt(options.limit, 10) : undefined,
      };

      switch (type) {
        case "objects": {
          const allObjects = entities.categories.flatMap((c) => c.objects);
          const result = listObjects(allObjects, listOptions);
          if (options.format === "json") {
            console.log(JSON.stringify(result.items, null, 2));
          } else {
            console.log(`Objects (${result.totalCount}):\n`);
            result.items.forEach((obj) => {
              console.log(`  ${obj.id.padEnd(20)} ${obj.title.padEnd(30)} [${obj.domain}]`);
            });
          }
          break;
        }
        case "morphisms": {
          const allMorphisms = entities.categories.flatMap((c) => c.morphisms);
          const result = listMorphisms(allMorphisms, listOptions);
          if (options.format === "json") {
            console.log(JSON.stringify(result.items, null, 2));
          } else {
            console.log(`Morphisms (${result.totalCount}):\n`);
            result.items.forEach((m) => {
              console.log(`  ${m.id.padEnd(15)} ${m.source} --[${m.name}]--> ${m.target}`);
            });
          }
          break;
        }
        case "categories": {
          const result = listCategories(entities.categories, listOptions);
          if (options.format === "json") {
            console.log(JSON.stringify(result.items, null, 2));
          } else {
            console.log(`Categories (${result.totalCount}):\n`);
            result.items.forEach((c) => {
              console.log(`  ${c.id.padEnd(20)} ${c.name.padEnd(30)} (${c.objectCount} objects, ${c.morphismCount} morphisms)`);
            });
          }
          break;
        }
        default:
          console.error(`Unknown type: ${type}. Use 'objects', 'morphisms', or 'categories'.`);
          process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Show command
program
  .command("show <type> <id>")
  .description("Show details of an object, category, or functor")
  .action(async (type: string, id: string) => {
    try {
      const parser = new YamlParser();
      const config = await parser.parse(".catdoc/category.yaml");
      const entities = parser.toEntities(config);

      switch (type) {
        case "object": {
          const allObjects = entities.categories.flatMap((c) => c.objects);
          const allMorphisms = entities.categories.flatMap((c) => c.morphisms);
          const obj = allObjects.find((o) => o.id === id);
          const result = showObject(obj ?? null, allMorphisms);

          if (!result.found) {
            console.error(`Object '${id}' not found`);
            process.exit(1);
          }

          console.log(`\nObject: ${result.object!.title}`);
          console.log(`  ID: ${result.object!.id}`);
          console.log(`  Domain: ${result.object!.domain}`);
          if (result.object!.metadata) {
            console.log(`  Metadata: ${JSON.stringify(result.object!.metadata)}`);
          }
          console.log(`\n  Outgoing morphisms: ${result.outgoingMorphisms!.length}`);
          result.outgoingMorphisms!.forEach((m) => {
            console.log(`    -> ${m.name} --> ${m.target}`);
          });
          console.log(`\n  Incoming morphisms: ${result.incomingMorphisms!.length}`);
          result.incomingMorphisms!.forEach((m) => {
            console.log(`    <- ${m.name} <-- ${m.source}`);
          });
          break;
        }
        case "category": {
          const cat = entities.categories.find((c) => c.id === id);
          const result = showCategory(cat ?? null);

          if (!result.found) {
            console.error(`Category '${id}' not found`);
            process.exit(1);
          }

          console.log(`\nCategory: ${result.category!.name}`);
          console.log(`  ID: ${result.category!.id}`);
          console.log(`  Objects: ${result.objectCount}`);
          console.log(`  Morphisms: ${result.morphismCount}`);
          console.log(`\n  Objects:`);
          result.objects!.forEach((obj) => {
            console.log(`    - ${obj.id}: ${obj.title}`);
          });
          console.log(`\n  Morphisms:`);
          result.morphisms!.forEach((m) => {
            console.log(`    - ${m.id}: ${m.source} --[${m.name}]--> ${m.target}`);
          });
          break;
        }
        case "functor": {
          const func = entities.functors.find((f) => f.id === id);
          const result = showFunctor(func ?? null);

          if (!result.found) {
            console.error(`Functor '${id}' not found`);
            process.exit(1);
          }

          console.log(`\nFunctor: ${result.functor!.name}`);
          console.log(`  ID: ${result.functor!.id}`);
          console.log(`  Source: ${result.functor!.sourceCategory}`);
          console.log(`  Target: ${result.functor!.targetCategory}`);
          console.log(`\n  Object mappings:`);
          result.objectMappings!.forEach((m) => {
            console.log(`    ${m.source} -> ${m.target}`);
          });
          console.log(`\n  Morphism mappings:`);
          result.morphismMappings!.forEach((m) => {
            console.log(`    ${m.source} -> ${m.target}`);
          });
          break;
        }
        default:
          console.error(`Unknown type: ${type}. Use 'object', 'category', or 'functor'.`);
          process.exit(1);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Dashboard command (placeholder for Phase 10)
program
  .command("dashboard")
  .description("Start the web dashboard")
  .option("-p, --port <port>", "Port number", "3000")
  .option("-o, --open", "Open browser automatically")
  .action((options) => {
    console.log("catdoc dashboard - Coming in Phase 10");
    console.log(`  Port: ${options.port}`);
  });

// Parse and execute
program.parse();
