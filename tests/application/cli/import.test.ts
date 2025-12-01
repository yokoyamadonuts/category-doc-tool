/**
 * CLI Import Command Tests
 * Verifies: REQ-DOC-001
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import {
  importDocument,
  importDocuments,
} from "../../../src/application/cli/import";

describe("CLI Import Command", () => {
  const testDir = "/tmp/catdoc-test-import";
  const docsDir = join(testDir, "docs");

  beforeEach(() => {
    // Clean up and create test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(docsDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  // Helper to create test markdown files
  const createTestDoc = (filename: string, content: string) => {
    writeFileSync(join(docsDir, filename), content);
    return join(docsDir, filename);
  };

  // TEST-IMPORT-001: Import single document
  describe("importDocument", () => {
    it("should import a single markdown document", async () => {
      const filePath = createTestDoc(
        "test-doc.md",
        `---
id: test-1
title: Test Document
domain: testing
---

# Test Document

This is a test document.
`
      );

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object).toBeDefined();
      expect(result.object!.id).toBe("test-1");
      expect(result.object!.title).toBe("Test Document");
      expect(result.object!.domain).toBe("testing");
    });

    it("should extract title from h1 if not in frontmatter", async () => {
      const filePath = createTestDoc(
        "no-title.md",
        `---
id: no-title-doc
domain: testing
---

# Extracted Title

Content here.
`
      );

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object!.title).toBe("Extracted Title");
    });

    it("should generate id from filename if not in frontmatter", async () => {
      const filePath = createTestDoc(
        "my-document.md",
        `# My Document

Content without frontmatter id.
`
      );

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object!.id).toBe("my-document");
    });

    it("should use default domain option", async () => {
      const filePath = createTestDoc(
        "no-domain.md",
        `---
id: no-domain-doc
---

# No Domain

Content.
`
      );

      const result = await importDocument(filePath, {
        defaultDomain: "custom-domain",
      });

      expect(result.success).toBe(true);
      expect(result.object!.domain).toBe("custom-domain");
    });

    it("should preserve metadata from frontmatter", async () => {
      const filePath = createTestDoc(
        "with-meta.md",
        `---
id: meta-doc
title: Document with Metadata
domain: testing
author: Test Author
tags:
  - tag1
  - tag2
custom_field: custom value
---

# Content

Body text.
`
      );

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object!.metadata?.author).toBe("Test Author");
      expect(result.object!.metadata?.tags).toEqual(["tag1", "tag2"]);
      expect(result.object!.metadata?.custom_field).toBe("custom value");
    });
  });

  // TEST-IMPORT-002: Import multiple documents
  describe("importDocuments", () => {
    it("should import multiple documents", async () => {
      createTestDoc(
        "doc1.md",
        `---
id: doc-1
title: Document 1
domain: test
---
# Doc 1
`
      );
      createTestDoc(
        "doc2.md",
        `---
id: doc-2
title: Document 2
domain: test
---
# Doc 2
`
      );
      createTestDoc(
        "doc3.md",
        `---
id: doc-3
title: Document 3
domain: test
---
# Doc 3
`
      );

      const results = await importDocuments([
        join(docsDir, "doc1.md"),
        join(docsDir, "doc2.md"),
        join(docsDir, "doc3.md"),
      ]);

      expect(results.successful).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.objects).toHaveLength(3);
    });

    it("should report partial success for mixed results", async () => {
      createTestDoc(
        "valid.md",
        `---
id: valid-doc
title: Valid
domain: test
---
Content.
`
      );

      const results = await importDocuments([
        join(docsDir, "valid.md"),
        join(docsDir, "nonexistent.md"),
      ]);

      expect(results.successful).toBe(1);
      expect(results.failed).toBe(1);
      expect(results.errors).toHaveLength(1);
    });

    it("should apply domain option to all documents", async () => {
      createTestDoc("a.md", "# Document A");
      createTestDoc("b.md", "# Document B");

      const results = await importDocuments(
        [join(docsDir, "a.md"), join(docsDir, "b.md")],
        { defaultDomain: "shared-domain" }
      );

      expect(results.objects[0].domain).toBe("shared-domain");
      expect(results.objects[1].domain).toBe("shared-domain");
    });
  });

  // TEST-IMPORT-003: Error handling
  describe("error handling", () => {
    it("should handle non-existent file", async () => {
      const result = await importDocument("/nonexistent/file.md");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("not found");
    });

    it("should handle invalid file extension", async () => {
      const txtFile = join(docsDir, "not-markdown.txt");
      writeFileSync(txtFile, "Plain text content");

      const result = await importDocument(txtFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain("markdown");
    });

    it("should handle empty file", async () => {
      const filePath = createTestDoc("empty.md", "");

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object!.id).toBe("empty");
    });

    it("should handle malformed frontmatter", async () => {
      const filePath = createTestDoc(
        "bad-front.md",
        `---
id: [invalid yaml
---
# Content
`
      );

      const result = await importDocument(filePath);

      // Should still parse, treating it as content without frontmatter
      expect(result.success).toBe(true);
    });
  });

  // TEST-IMPORT-004: Content extraction
  describe("content extraction", () => {
    it("should extract content without frontmatter", async () => {
      const filePath = createTestDoc(
        "content.md",
        `---
id: content-doc
title: Content Test
domain: test
---

# Main Title

This is the body content.

## Section

More content here.
`
      );

      const result = await importDocument(filePath);

      expect(result.success).toBe(true);
      expect(result.object!.content).toContain("Main Title");
      expect(result.object!.content).toContain("body content");
      expect(result.object!.content).toContain("Section");
      expect(result.object!.content).not.toContain("id: content-doc");
    });

    it("should preserve code blocks in content", async () => {
      const filePath = createTestDoc(
        "code.md",
        `---
id: code-doc
title: Code Example
domain: test
---

# Code

\`\`\`typescript
const x = 1;
\`\`\`
`
      );

      const result = await importDocument(filePath);

      expect(result.object!.content).toContain("```typescript");
      expect(result.object!.content).toContain("const x = 1;");
    });
  });
});
