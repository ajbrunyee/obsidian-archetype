# Archetype

Speed reading and active learning for Obsidian.

---

## What It Does

Transform passive reading into active learning through timed text segments. Open any note and run the command to speed read the entire file, or select specific text to read just that portion.

### Key Features
- Full-screen distraction-free display
- Smart sentence boundaries (never split mid-thought)
- Clean text (strips markdown formatting)
- Natural pauses between sentences
- Respects your Obsidian theme

---

## Quick Start

1. **Install**: Clone to `.obsidian/plugins/obsidian-archetype`
2. **Build**: `npm install && npm run build`
3. **Use**: 
   - Open any note
   - Command palette → "Start speed reading"
   - *Optional*: Select text first to read only that portion
4. **Stop**: Click anywhere

---

## Philosophy

> Learning quality is measured by stability, intelligibility, and convergence under constraint.

Archetype enforces constraints (fixed display, timed progression, sentence boundaries) to create a foundation for measuring reading fluency and comprehension.

---

## Development

```bash
npm install      # Install dependencies
npm run dev      # Watch mode
npm test         # Run tests (147 passing)
npm run build    # Production build
```

See [AGENTS.md](./AGENTS.md) for development workflow and [specs/](./specs/) for detailed specifications.

---

**MIT License** • [Issues](https://github.com/ajbrunyee/obsidian-archetype/issues)
