/**
 * Markdown Parser Tests
 * Verifies: REQ-CAT-002
 */
import { describe, expect, it } from "bun:test";
import { MarkdownParser } from "../../../src/infrastructure/parsers/MarkdownParser";

describe("MarkdownParser", () => {
  const parser = new MarkdownParser();

  // TEST-MD-001: Parse basic Markdown structure
  describe("parseContent", () => {
    it("should parse document with title and content", () => {
      const markdown = `# Document Title

This is the introduction paragraph.

## Section One

Content of section one.

## Section Two

Content of section two.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.title).toBe("Document Title");
      expect(doc.sections).toHaveLength(2);
      expect(doc.sections[0].title).toBe("Section One");
      expect(doc.sections[1].title).toBe("Section Two");
    });

    it("should extract frontmatter metadata", () => {
      const markdown = `---
id: doc-1
domain: mathematics
author: Test Author
tags:
  - category-theory
  - algebra
---

# Document with Frontmatter

Content here.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.metadata?.id).toBe("doc-1");
      expect(doc.metadata?.domain).toBe("mathematics");
      expect(doc.metadata?.author).toBe("Test Author");
      expect(doc.metadata?.tags).toEqual(["category-theory", "algebra"]);
    });

    it("should handle nested sections", () => {
      const markdown = `# Main Title

## Chapter 1

### Section 1.1

Content 1.1

### Section 1.2

Content 1.2

## Chapter 2

Content of chapter 2.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.sections).toHaveLength(2);
      expect(doc.sections[0].title).toBe("Chapter 1");
      expect(doc.sections[0].children).toHaveLength(2);
      expect(doc.sections[0].children![0].title).toBe("Section 1.1");
      expect(doc.sections[1].title).toBe("Chapter 2");
    });

    it("should handle document without title", () => {
      const markdown = `Just some content without a title.

## A Section

More content.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.title).toBeUndefined();
      expect(doc.introduction).toBe("Just some content without a title.");
      expect(doc.sections).toHaveLength(1);
    });

    it("should handle empty document", () => {
      const doc = parser.parseContent("");

      expect(doc.title).toBeUndefined();
      expect(doc.sections).toHaveLength(0);
    });
  });

  // TEST-MD-002: Extract section content
  describe("section content", () => {
    it("should extract section content correctly", () => {
      const markdown = `# Title

## Section

This is paragraph one.

This is paragraph two.

- List item 1
- List item 2
`;

      const doc = parser.parseContent(markdown);

      expect(doc.sections[0].content).toContain("paragraph one");
      expect(doc.sections[0].content).toContain("paragraph two");
      expect(doc.sections[0].content).toContain("List item 1");
    });

    it("should preserve code blocks", () => {
      const markdown = `# Title

## Code Section

\`\`\`typescript
const x = 1;
function test() {
  return x;
}
\`\`\`
`;

      const doc = parser.parseContent(markdown);

      expect(doc.sections[0].content).toContain("```typescript");
      expect(doc.sections[0].content).toContain("const x = 1;");
    });

    it("should extract inline code", () => {
      const markdown = `# Title

## Section

Use \`createCategory()\` to create a category.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.sections[0].content).toContain("`createCategory()`");
    });
  });

  // TEST-MD-003: Extract references and links
  describe("references and links", () => {
    it("should extract internal links", () => {
      const markdown = `# Title

## Section

See [related doc](./related.md) for more info.
Also check [[wiki-link]] style.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.links).toBeDefined();
      expect(doc.links).toContain("./related.md");
    });

    it("should extract object references", () => {
      const markdown = `# Title

## Section

This relates to objects: @obj-1, @obj-2, and @obj-3.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.objectReferences).toBeDefined();
      expect(doc.objectReferences).toContain("obj-1");
      expect(doc.objectReferences).toContain("obj-2");
      expect(doc.objectReferences).toContain("obj-3");
    });

    it("should extract morphism references", () => {
      const markdown = `# Title

## Section

The morphism #morph-f maps A to B.
`;

      const doc = parser.parseContent(markdown);

      expect(doc.morphismReferences).toBeDefined();
      expect(doc.morphismReferences).toContain("morph-f");
    });
  });

  // TEST-MD-004: Convert to CategoryObject content
  describe("toCategoryObjectContent", () => {
    it("should convert document to object content format", () => {
      const markdown = `---
id: obj-test
domain: test-domain
---

# Test Object

This is the description.

## Details

More detailed information here.
`;

      const doc = parser.parseContent(markdown);
      const content = parser.toCategoryObjectContent(doc);

      expect(content.id).toBe("obj-test");
      expect(content.title).toBe("Test Object");
      expect(content.domain).toBe("test-domain");
      expect(content.content).toContain("This is the description");
    });

    it("should generate id from title if not in frontmatter", () => {
      const markdown = `# My Test Document

Content here.
`;

      const doc = parser.parseContent(markdown);
      const content = parser.toCategoryObjectContent(doc);

      expect(content.id).toBe("my-test-document");
      expect(content.title).toBe("My Test Document");
    });

    it("should use default domain if not specified", () => {
      const markdown = `# Title

Content.
`;

      const doc = parser.parseContent(markdown);
      const content = parser.toCategoryObjectContent(doc, "default-domain");

      expect(content.domain).toBe("default-domain");
    });
  });

  // TEST-MD-005: Parse multiple documents
  describe("parseMultiple", () => {
    it("should parse multiple markdown contents", () => {
      const docs = [
        `# Doc 1\n\nContent 1.`,
        `# Doc 2\n\nContent 2.`,
        `# Doc 3\n\nContent 3.`,
      ];

      const parsed = parser.parseMultiple(docs);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].title).toBe("Doc 1");
      expect(parsed[1].title).toBe("Doc 2");
      expect(parsed[2].title).toBe("Doc 3");
    });
  });

  // TEST-MD-006: Extract table of contents
  describe("extractToc", () => {
    it("should extract table of contents", () => {
      const markdown = `# Main Title

## Chapter 1

### Section 1.1

### Section 1.2

## Chapter 2

### Section 2.1
`;

      const doc = parser.parseContent(markdown);
      const toc = parser.extractToc(doc);

      expect(toc).toHaveLength(2);
      expect(toc[0].title).toBe("Chapter 1");
      expect(toc[0].children).toHaveLength(2);
      expect(toc[1].title).toBe("Chapter 2");
      expect(toc[1].children).toHaveLength(1);
    });
  });

  // TEST-MD-007: Handle special characters and edge cases
  describe("edge cases", () => {
    it("should handle special characters in titles", () => {
      const markdown = `# Title with "quotes" and 'apostrophes'

## Section with (parentheses) & ampersand
`;

      const doc = parser.parseContent(markdown);

      expect(doc.title).toBe("Title with \"quotes\" and 'apostrophes'");
      expect(doc.sections[0].title).toBe(
        "Section with (parentheses) & ampersand"
      );
    });

    it("should handle markdown with only frontmatter", () => {
      const markdown = `---
id: meta-only
---
`;

      const doc = parser.parseContent(markdown);

      expect(doc.metadata?.id).toBe("meta-only");
      expect(doc.title).toBeUndefined();
    });

    it("should handle deeply nested sections", () => {
      const markdown = `# Title

## H2

### H3

#### H4

##### H5

###### H6
`;

      const doc = parser.parseContent(markdown);

      expect(doc.sections).toHaveLength(1);
      expect(doc.sections[0].level).toBe(2);
    });
  });
});
