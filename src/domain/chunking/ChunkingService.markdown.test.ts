import { describe, it, expect } from 'vitest';
import { ChunkingService } from './ChunkingService';
import { ChunkingStrategy } from './ChunkingStrategy';

describe('ChunkingService - Markdown Parsing', () => {
	describe('frontmatter stripping', () => {
		it('should strip YAML frontmatter', () => {
			const textWithFrontmatter = `---
title: My Document
author: John Doe
tags: [test, example]
---

This is the actual content.`;

			const sequence = ChunkingService.chunkByWords(textWithFrontmatter, 3);
			
			// Should not include any frontmatter content
			const allContent = sequence.chunks.map(c => c.content).join(' ');
			expect(allContent).not.toContain('title');
			expect(allContent).not.toContain('author');
			expect(allContent).not.toContain('John Doe');
			expect(allContent).toContain('This');
			expect(allContent).toContain('content');
		});

		it('should handle frontmatter with Windows line endings', () => {
			const textWithFrontmatter = `---\r
title: Test\r
---\r
Content here.`;

			const sequence = ChunkingService.chunkByWords(textWithFrontmatter, 2);
			
			const allContent = sequence.chunks.map(c => c.content).join(' ');
			expect(allContent).not.toContain('title');
			expect(allContent).toContain('Content');
		});

		it('should handle text without frontmatter', () => {
			const textWithoutFrontmatter = 'Just regular content here.';
			
			const sequence = ChunkingService.chunkByWords(textWithoutFrontmatter, 2);
			
			expect(sequence.length).toBeGreaterThan(0);
			const allContent = sequence.chunks.map(c => c.content).join(' ');
			expect(allContent).toContain('regular');
			expect(allContent).toContain('content');
		});

		it('should handle empty frontmatter', () => {
			const text = `---
---

Content`;

			const sequence = ChunkingService.chunkByWords(text, 1);
			
			expect(sequence.length).toBe(1);
			expect(sequence.getChunk(0)?.content).toBe('Content');
		});
	});

	describe('section parsing', () => {
		it('should create separate chunks for headings', () => {
			const textWithHeadings = `# Main Title

Some content here.

## Section One

More content.`;

			const sequence = ChunkingService.chunkByWords(textWithHeadings, 2);
			
			// Should have heading chunks
			const contents = sequence.chunks.map(c => c.content);
			expect(contents).toContain('Main Title');
			expect(contents).toContain('Section One');
		});

		it('should add section breaks between sections', () => {
			const textWithSections = `# Section 1

Content one.

# Section 2

Content two.`;

			const sequence = ChunkingService.chunkByWords(textWithSections, 2);
			
			const contents = sequence.chunks.map(c => c.content);
			// Should have ellipsis between sections
			expect(contents).toContain('...');
		});

		it('should handle nested headings', () => {
			const text = `# H1 Heading

Content under H1.

## H2 Heading

Content under H2.

### H3 Heading

Content under H3.`;

			const sequence = ChunkingService.chunkByWords(text, 3);
			
			const contents = sequence.chunks.map(c => c.content);
			expect(contents).toContain('H1 Heading');
			expect(contents).toContain('H2 Heading');
			expect(contents).toContain('H3 Heading');
		});

		it('should handle sections without headings', () => {
			const text = `Some initial content without a heading.

Then more content.`;

			const sequence = ChunkingService.chunkByWords(text, 2);
			
			expect(sequence.length).toBeGreaterThan(0);
			const allContent = sequence.chunks.map(c => c.content).join(' ');
			expect(allContent).toContain('initial');
			expect(allContent).toContain('content');
		});
	});

	describe('combined frontmatter and sections', () => {
		it('should handle document with frontmatter and sections', () => {
			const fullDocument = `---
title: Test Document
author: Test Author
---

# Introduction

This is the introduction section with some content.

## Details

Here are the details of the topic.

# Conclusion

Final thoughts here.`;

			const sequence = ChunkingService.chunkByWords(fullDocument, 3);
			
			const contents = sequence.chunks.map(c => c.content);
			
			// Should not have frontmatter
			expect(contents.join(' ')).not.toContain('Test Author');
			
			// Should have headings
			expect(contents).toContain('Introduction');
			expect(contents).toContain('Details');
			expect(contents).toContain('Conclusion');
			
			// Should have content
			expect(contents.join(' ')).toContain('introduction section');
			expect(contents.join(' ')).toContain('details of');
			expect(contents.join(' ')).toContain('Final thoughts');
			
			// Should have section breaks
			expect(contents.filter(c => c === '...').length).toBeGreaterThan(0);
		});

		it('should handle real-world markdown document', () => {
			const document = `---
tags: programming, tutorial
date: 2024-01-15
---

# Getting Started

Welcome to this tutorial.

## Installation

First, install the dependencies:
- Node.js
- npm

## Usage

Run the following command:
\`npm start\`

That's it!`;

			const sequence = ChunkingService.chunkByWords(document, 2);
			
			const contents = sequence.chunks.map(c => c.content);
			
			// No frontmatter
			expect(contents.join(' ')).not.toContain('programming');
			expect(contents.join(' ')).not.toContain('2024-01-15');
			
			// Has structure
			expect(contents).toContain('Getting Started');
			expect(contents).toContain('Installation');
			expect(contents).toContain('Usage');
			
			// Has content (markdown stripped)
			expect(contents.join(' ')).toContain('Welcome to');
			expect(contents.join(' ')).toContain('install the');
			expect(contents.join(' ')).toContain('npm start');
		});
	});

	describe('edge cases', () => {
		it('should handle empty document', () => {
			const sequence = ChunkingService.chunkByWords('', 3);
			expect(sequence.length).toBe(0);
		});

		it('should handle document with only frontmatter', () => {
			const text = `---
title: Only Frontmatter
---`;

			const sequence = ChunkingService.chunkByWords(text, 3);
			expect(sequence.length).toBe(0);
		});

		it('should handle document with only headings', () => {
			const text = `# Heading 1
## Heading 2
### Heading 3`;

			const sequence = ChunkingService.chunkByWords(text, 3);
			
			const contents = sequence.chunks.map(c => c.content);
			expect(contents).toContain('Heading 1');
			expect(contents).toContain('Heading 2');
			expect(contents).toContain('Heading 3');
		});

		it('should handle malformed frontmatter', () => {
			const text = `---
This is not proper YAML
No closing delimiter

Content here.`;

			const sequence = ChunkingService.chunkByWords(text, 2);
			
			// Should still process content
			expect(sequence.length).toBeGreaterThan(0);
		});
	});
});

