/**
 * Markdown Parser for document import
 * Implements: REQ-CAT-002
 *
 * Parses Markdown documents and extracts:
 * - Frontmatter metadata
 * - Document structure (sections, nesting)
 * - References to objects and morphisms
 * - Links to other documents
 */

import { parse as parseYaml } from "yaml";

// =============================================================================
// Types
// =============================================================================

/**
 * Document section with optional nesting
 */
export type DocumentSection = {
  title: string;
  level: number;
  content: string;
  children?: DocumentSection[];
};

/**
 * Table of contents entry
 */
export type TocEntry = {
  title: string;
  level: number;
  children: TocEntry[];
};

/**
 * Parsed document structure
 */
export type ParsedDocument = {
  title?: string;
  introduction?: string;
  metadata?: Record<string, unknown>;
  sections: DocumentSection[];
  links?: string[];
  objectReferences?: string[];
  morphismReferences?: string[];
  rawContent: string;
};

/**
 * Content format for CategoryObject
 */
export type CategoryObjectContent = {
  id: string;
  title: string;
  domain: string;
  content: string;
  metadata?: Record<string, unknown>;
};

// =============================================================================
// Markdown Parser
// =============================================================================

/**
 * Markdown Parser for importing documents
 */
export class MarkdownParser {
  /**
   * Parse markdown content string
   */
  parseContent(content: string): ParsedDocument {
    if (!content || content.trim() === "") {
      return {
        sections: [],
        rawContent: content,
      };
    }

    // Extract frontmatter
    const { metadata, bodyContent } = this.extractFrontmatter(content);

    // Extract title (first h1)
    const titleMatch = bodyContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract introduction (content before first h2)
    const introduction = this.extractIntroduction(bodyContent, title);

    // Parse sections
    const sections = this.parseSections(bodyContent);

    // Extract references
    const links = this.extractLinks(content);
    const objectReferences = this.extractObjectReferences(content);
    const morphismReferences = this.extractMorphismReferences(content);

    return {
      title,
      introduction,
      metadata,
      sections,
      links: links.length > 0 ? links : undefined,
      objectReferences:
        objectReferences.length > 0 ? objectReferences : undefined,
      morphismReferences:
        morphismReferences.length > 0 ? morphismReferences : undefined,
      rawContent: content,
    };
  }

  /**
   * Parse multiple markdown contents
   */
  parseMultiple(contents: string[]): ParsedDocument[] {
    return contents.map((content) => this.parseContent(content));
  }

  /**
   * Convert parsed document to CategoryObject content format
   */
  toCategoryObjectContent(
    doc: ParsedDocument,
    defaultDomain: string = "general"
  ): CategoryObjectContent {
    const id =
      (doc.metadata?.id as string) ||
      (doc.title ? this.slugify(doc.title) : "untitled");

    const domain = (doc.metadata?.domain as string) || defaultDomain;

    // Combine introduction and sections into content
    const contentParts: string[] = [];
    if (doc.introduction) {
      contentParts.push(doc.introduction);
    }
    for (const section of doc.sections) {
      contentParts.push(this.sectionToString(section));
    }

    return {
      id,
      title: doc.title || "Untitled",
      domain,
      content: contentParts.join("\n\n"),
      metadata: doc.metadata,
    };
  }

  /**
   * Extract table of contents from document
   */
  extractToc(doc: ParsedDocument): TocEntry[] {
    return doc.sections.map((section) => this.sectionToTocEntry(section));
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Extract frontmatter from markdown
   */
  private extractFrontmatter(content: string): {
    metadata?: Record<string, unknown>;
    bodyContent: string;
  } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { bodyContent: content };
    }

    try {
      const metadata = parseYaml(match[1]) as Record<string, unknown>;
      const bodyContent = content.slice(match[0].length);
      return { metadata, bodyContent };
    } catch {
      return { bodyContent: content };
    }
  }

  /**
   * Extract introduction text before first h2
   */
  private extractIntroduction(
    content: string,
    title?: string
  ): string | undefined {
    // Remove title if present
    let text = content;
    if (title) {
      text = text.replace(/^#\s+.+\r?\n+/, "");
    }

    // Find first h2
    const h2Index = text.search(/^##\s+/m);
    if (h2Index === -1) {
      const trimmed = text.trim();
      return trimmed || undefined;
    }

    const intro = text.slice(0, h2Index).trim();
    return intro || undefined;
  }

  /**
   * Parse sections from markdown content
   */
  private parseSections(content: string): DocumentSection[] {
    const lines = content.split(/\r?\n/);
    const sections: DocumentSection[] = [];
    const sectionStack: { section: DocumentSection; level: number }[] = [];

    let currentContent: string[] = [];
    let currentSection: DocumentSection | null = null;
    let inCodeBlock = false;

    for (const line of lines) {
      // Track code blocks
      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        currentContent.push(line);
        continue;
      }

      if (inCodeBlock) {
        currentContent.push(line);
        continue;
      }

      // Check for heading
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        // Save current section content
        if (currentSection) {
          currentSection.content = currentContent.join("\n").trim();
        }

        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();

        const newSection: DocumentSection = {
          title,
          level,
          content: "",
        };

        // Find parent section
        while (
          sectionStack.length > 0 &&
          sectionStack[sectionStack.length - 1].level >= level
        ) {
          sectionStack.pop();
        }

        if (sectionStack.length > 0) {
          const parent = sectionStack[sectionStack.length - 1].section;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newSection);
        } else if (level === 2) {
          sections.push(newSection);
        }

        if (level === 2 || sectionStack.length > 0) {
          sectionStack.push({ section: newSection, level });
        }

        currentSection = newSection;
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section content
    if (currentSection) {
      currentSection.content = currentContent.join("\n").trim();
    }

    return sections;
  }

  /**
   * Extract links from content
   */
  private extractLinks(content: string): string[] {
    const links: string[] = [];

    // Markdown links [text](url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      links.push(match[2]);
    }

    // Wiki-style links [[link]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }

    return [...new Set(links)];
  }

  /**
   * Extract object references (@obj-id)
   */
  private extractObjectReferences(content: string): string[] {
    const refs: string[] = [];
    const regex = /@([\w-]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      refs.push(match[1]);
    }
    return [...new Set(refs)];
  }

  /**
   * Extract morphism references (#morph-id)
   */
  private extractMorphismReferences(content: string): string[] {
    const refs: string[] = [];
    // Match #id but not inside code blocks or at start of headings
    const regex = /(?<!^|\n)#([\w-]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      refs.push(match[1]);
    }
    return [...new Set(refs)];
  }

  /**
   * Convert section to string
   */
  private sectionToString(section: DocumentSection): string {
    const parts = [`${"#".repeat(section.level)} ${section.title}`];
    if (section.content) {
      parts.push(section.content);
    }
    if (section.children) {
      for (const child of section.children) {
        parts.push(this.sectionToString(child));
      }
    }
    return parts.join("\n\n");
  }

  /**
   * Convert section to table of contents entry
   */
  private sectionToTocEntry(section: DocumentSection): TocEntry {
    return {
      title: section.title,
      level: section.level,
      children: section.children
        ? section.children.map((child) => this.sectionToTocEntry(child))
        : [],
    };
  }

  /**
   * Convert title to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  }
}
