/**
 * CLI Init Command
 * Implements: REQ-SYS-002
 *
 * Initialize a new CatDoc project with directory structure and templates.
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, basename } from "path";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for project initialization
 */
export type InitOptions = {
  projectPath: string;
  projectName?: string;
  force?: boolean;
  initDatabase?: boolean;
};

/**
 * Result of initialization
 */
export type InitResult = {
  success: boolean;
  error?: string;
  messages?: string[];
  databaseInitialized?: boolean;
};

// =============================================================================
// Templates
// =============================================================================

const getCategoryYamlTemplate = (projectName: string): string => `# Category Configuration for ${projectName}
# This file defines the category structure for your documentation.

categories:
  # Example category
  - id: example-category
    name: Example Category
    objects:
      - id: obj-1
        title: First Object
        domain: example
        metadata:
          description: An example object
      - id: obj-2
        title: Second Object
        domain: example
        metadata:
          description: Another example object
    morphisms:
      - id: morph-1
        name: f
        source: obj-1
        target: obj-2
        metadata:
          description: An example morphism from obj-1 to obj-2

functors: []
# Example functor:
#   - id: F
#     name: Example Functor
#     sourceCategory: category-A
#     targetCategory: category-B
#     objectMapping:
#       obj-a: obj-b
#     morphismMapping:
#       morph-a: morph-b

naturalTransformations: []
# Example natural transformation:
#   - id: eta
#     name: η
#     sourceFunctor: F
#     targetFunctor: G
#     components:
#       obj-1: morph-component-1
`;

const getConfigYamlTemplate = (projectName: string): string => `# CatDoc Configuration
# Project settings and database connections

project:
  name: ${projectName}
  version: 1.0.0

# Neo4j Graph Database Connection
neo4j:
  uri: bolt://localhost:7687
  username: neo4j
  password: password
  # Set enabled to true once Neo4j is configured
  enabled: false

# Turso/SQLite Database Connection
turso:
  # Use local SQLite file for development
  url: file:.catdoc/data.db
  # For Turso cloud:
  # url: libsql://your-database.turso.io
  # authToken: your-auth-token
  enabled: true

# Dashboard settings
dashboard:
  port: 3000
  host: 127.0.0.1

# Import settings
import:
  defaultDomain: general
  watchMode: false
`;

const getExampleDocTemplate = (): string => `---
id: example-document
title: Example Document
domain: example
author: Your Name
tags:
  - example
  - documentation
---

# Example Document

This is an example document that demonstrates the structure of CatDoc documents.

## Overview

Documents in CatDoc use YAML frontmatter to specify metadata like:
- **id**: Unique identifier for the document
- **title**: Display title
- **domain**: Category domain this document belongs to
- **tags**: Optional tags for organization

## Content

Your document content goes here. You can use standard Markdown formatting.

### References

You can reference other objects using @object-id syntax.
You can reference morphisms using #morphism-id syntax.

### Links

Link to other documents: [Related Document](./related.md)

Or use wiki-style links: [[other-document]]
`;

// =============================================================================
// Init Function
// =============================================================================

/**
 * Initialize a new CatDoc project
 */
export async function initProject(options: InitOptions): Promise<InitResult> {
  const { projectPath, projectName, force = false, initDatabase = false } = options;
  const messages: string[] = [];

  try {
    // Check if project path exists
    if (!existsSync(projectPath)) {
      return {
        success: false,
        error: `Project path does not exist: ${projectPath}`,
      };
    }

    const catdocDir = join(projectPath, ".catdoc");
    const docsDir = join(catdocDir, "docs");

    // Check if .catdoc already exists
    if (existsSync(catdocDir) && !force) {
      return {
        success: false,
        error: `.catdoc directory already exists. Use --force to overwrite.`,
      };
    }

    // Determine project name
    const finalProjectName = projectName || basename(projectPath) || "CatDoc Project";

    // Create directories
    mkdirSync(catdocDir, { recursive: true });
    mkdirSync(docsDir, { recursive: true });
    messages.push("Created .catdoc directory structure");

    // Generate category.yaml
    writeFileSync(
      join(catdocDir, "category.yaml"),
      getCategoryYamlTemplate(finalProjectName)
    );
    messages.push("Created category.yaml template");

    // Generate config.yaml
    writeFileSync(
      join(catdocDir, "config.yaml"),
      getConfigYamlTemplate(finalProjectName)
    );
    messages.push("Created config.yaml with database settings");

    // Generate example document
    writeFileSync(join(docsDir, "example.md"), getExampleDocTemplate());
    messages.push("Created example document template");

    // Database initialization (skipped by default)
    let databaseInitialized = false;
    if (initDatabase) {
      // Database initialization would go here
      // For now, we skip it and let the user configure databases first
      messages.push("Database initialization skipped (configure databases in config.yaml first)");
    }

    messages.push("");
    messages.push("CatDoc project initialized successfully!");
    messages.push("Next steps:");
    messages.push("  1. Edit .catdoc/category.yaml to define your categories");
    messages.push("  2. Configure database connections in .catdoc/config.yaml");
    messages.push("  3. Import documents: catdoc import <file.md>");
    messages.push("  4. Start dashboard: catdoc dashboard");

    return {
      success: true,
      messages,
      databaseInitialized,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
