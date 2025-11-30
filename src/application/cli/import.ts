/**
 * CLI Import Command
 * Implements: REQ-DOC-001
 *
 * Import Markdown documents as category objects.
 */

import { existsSync, readFileSync } from "fs";
import { basename, extname } from "path";
import { MarkdownParser } from "../../infrastructure/parsers/MarkdownParser";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for document import
 */
export type ImportOptions = {
  defaultDomain?: string;
  force?: boolean;
};

/**
 * Imported object representation
 */
export type ImportedObject = {
  id: string;
  title: string;
  domain: string;
  content: string;
  metadata?: Record<string, unknown>;
};

/**
 * Result of single document import
 */
export type ImportResult = {
  success: boolean;
  error?: string;
  object?: ImportedObject;
  filePath?: string;
};

/**
 * Result of multiple document import
 */
export type ImportBatchResult = {
  successful: number;
  failed: number;
  objects: ImportedObject[];
  errors: Array<{ filePath: string; error: string }>;
};

// =============================================================================
// Import Functions
// =============================================================================

const parser = new MarkdownParser();

/**
 * Generate slug from filename
 */
function slugFromFilename(filePath: string): string {
  const name = basename(filePath, extname(filePath));
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/**
 * Import a single markdown document
 */
export async function importDocument(
  filePath: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const { defaultDomain = "general" } = options;

  try {
    // Check file exists
    if (!existsSync(filePath)) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
        filePath,
      };
    }

    // Check file extension
    const ext = extname(filePath).toLowerCase();
    if (ext !== ".md" && ext !== ".markdown") {
      return {
        success: false,
        error: `Not a markdown file. Expected .md or .markdown extension.`,
        filePath,
      };
    }

    // Read and parse file
    const content = readFileSync(filePath, "utf-8");
    const parsed = parser.parseContent(content);

    // Convert to category object content
    const objectContent = parser.toCategoryObjectContent(parsed, defaultDomain);

    // Use filename-based ID if not specified or is "untitled"
    const fileSlug = slugFromFilename(filePath);
    const id =
      objectContent.id && objectContent.id !== "untitled"
        ? objectContent.id
        : fileSlug;

    // Build imported object
    const importedObject: ImportedObject = {
      id,
      title: objectContent.title,
      domain: objectContent.domain,
      content: objectContent.content,
      metadata: parsed.metadata,
    };

    return {
      success: true,
      object: importedObject,
      filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filePath,
    };
  }
}

/**
 * Import multiple markdown documents
 */
export async function importDocuments(
  filePaths: string[],
  options: ImportOptions = {}
): Promise<ImportBatchResult> {
  const result: ImportBatchResult = {
    successful: 0,
    failed: 0,
    objects: [],
    errors: [],
  };

  for (const filePath of filePaths) {
    const importResult = await importDocument(filePath, options);

    if (importResult.success && importResult.object) {
      result.successful++;
      result.objects.push(importResult.object);
    } else {
      result.failed++;
      result.errors.push({
        filePath,
        error: importResult.error || "Unknown error",
      });
    }
  }

  return result;
}
