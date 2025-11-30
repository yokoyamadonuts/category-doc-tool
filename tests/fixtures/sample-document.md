---
id: sample-doc
title: Sample Document for Testing
domain: test-domain
author: Test Suite
version: 1.0.0
tags:
  - sample
  - test
  - documentation
created: 2024-01-15
---

# Sample Document for Testing

This is a sample document used for testing the CatDoc import functionality.

## Overview

The purpose of this document is to provide a realistic example of a Markdown file
with YAML frontmatter that can be imported into CatDoc.

## References

This document references other objects:

- Related object: @related-object-id
- Connected morphism: #morphism-123

## Content Sections

### Section One

This is the first section with some content. It demonstrates how CatDoc
parses and extracts content from Markdown documents.

### Section Two

Another section with different content. CatDoc will extract the structure
of the document including all headings.

## Links

- [External Link](https://example.com)
- [Internal Link](./other-document.md)
- Wiki-style link: [[another-document]]

## Code Example

```typescript
function example(): void {
  console.log("Hello from sample document");
}
```

## Conclusion

This concludes the sample document.
