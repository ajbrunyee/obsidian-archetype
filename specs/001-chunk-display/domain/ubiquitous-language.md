# Ubiquitous Language - Chunk Display

This document defines the domain language for the Chunk Display feature. These terms should be used consistently across specifications, code, tests, and documentation.

## Core Concepts

### Text Source
**Definition**: The original text to be displayed, typically from a user's selection or document content.

**Properties**:
- Raw text content
- Length in characters
- May contain whitespace, punctuation, special characters

**Examples**:
- "The quick brown fox jumps over the lazy dog"
- Multi-paragraph text from a note

---

### Chunk
**Definition**: A discrete unit of text extracted from the Text Source for individual display.

**Properties**:
- Content (string)
- Position within source (start index, end index)
- Length (in characters or words)
- Sequence number (its position in the collection of chunks)

**Invariants**:
- Must contain at least one character
- Cannot overlap with other chunks
- Sequence must be contiguous (no gaps between chunks)

**Examples**:
- "The quick brown" (word-based chunk, size 3)
- "The quick" (character-based chunk, size 9)

---

### Chunking Strategy
**Definition**: The algorithm/rules for dividing Text Source into Chunks.

**Types**:
1. **Word-Based Chunking**: Splits by word boundaries (whitespace)
   - Chunk size measured in word count
   - Preserves word integrity

2. **Character-Based Chunking**: Splits by character count
   - Chunk size measured in character count
   - May split words mid-character

**Properties**:
- Chunk Size: The number of units (words or characters) per chunk
- Type: Word-based or Character-based

---

### Chunk Sequence
**Definition**: An ordered collection of Chunks derived from a single Text Source.

**Properties**:
- Total count of chunks
- Current position/index
- Navigation state (can advance, can retreat)

**Operations**:
- Get chunk at index
- Get next chunk
- Get previous chunk
- Get first/last chunk

**Invariants**:
- Order matches source text order
- No gaps between chunks
- Complete coverage of source text

---

### Display Window
**Definition**: The visual container where a single Chunk is rendered at any given time.

**Properties**:
- Fixed dimensions (width, height)
- Font size and styling
- Background color (theme-aware)
- Position (centered on screen)

**Constraints**:
- Dimensions do not change between chunks (zero layout shift)
- Always shows exactly one chunk at a time
- Overflow is clipped (no scrolling)

---

### Chunk Timing
**Definition**: The duration parameters controlling how long a chunk is displayed.

**Properties**:
- **Display Duration**: Time (milliseconds) a chunk remains visible
- **Transition Time**: Time between chunks (if animations exist)
- **Words Per Minute (WPM)**: Reading speed metric used to calculate display duration

**Calculation**:
```
Display Duration (ms) = (Words in Chunk / WPM) * 60000
```

**Example**:
- WPM: 300
- Chunk: "The quick brown" (3 words)
- Display Duration: (3 / 300) * 60000 = 600ms

---

### Chunk Progression
**Definition**: The process of advancing through a Chunk Sequence over time.

**States**:
- **Idle**: Not running, awaiting start
- **Playing**: Actively displaying chunks in sequence
- **Paused**: Temporarily stopped, can resume
- **Completed**: Reached end of sequence

**Operations**:
- Start: Begin progression from first or current chunk
- Pause: Stop progression, retain position
- Resume: Continue from current position
- Stop: End progression, reset to beginning

**Properties**:
- Current chunk index
- Playback state
- Timer/interval reference

---

### Reading Speed
**Definition**: The pace at which chunks are presented, measured in Words Per Minute (WPM).

**Properties**:
- Numeric value (typical range: 200-600 WPM)
- Adjustable by user
- Affects display duration calculation

**Examples**:
- 250 WPM: Average reading speed
- 400 WPM: Fast reading speed
- 600+ WPM: Speed reading

---

## Domain Relationships

```
Text Source
    │
    ├─[applies]──> Chunking Strategy
    │                   │
    │                   ├─ Word-Based (chunk size in words)
    │                   └─ Character-Based (chunk size in chars)
    │
    └─[produces]──> Chunk Sequence
                        │
                        ├─[contains]──> Chunk (ordered)
                        │                   │
                        │                   └─[displayed in]──> Display Window
                        │
                        └─[managed by]──> Chunk Progression
                                              │
                                              └─[uses]──> Chunk Timing
                                                              │
                                                              └─[derived from]──> Reading Speed (WPM)
```

---

## Business Rules

### BR-1: Chunk Size Limits
- Minimum chunk size: 1 unit (word or character)
- Maximum chunk size: Configurable, but should fit Display Window
- Default word-based chunk size: 3-5 words
- Default character-based chunk size: 15-20 characters

### BR-2: Display Duration Calculation
- Based on chunk word count and WPM setting
- Minimum display duration: 100ms (to ensure visibility)
- Maximum display duration: 10000ms (10 seconds)

### BR-3: Layout Stability
- Display Window dimensions must remain fixed
- Font size must not change between chunks
- Overflow is clipped, never causes scrolling or resizing

### BR-4: Text Coverage
- All text from Text Source must be included in chunks
- No text should be lost during chunking
- Chunks should not overlap

---

## Anti-Patterns to Avoid

❌ **Calling it "words" when size could be characters**
- Use: "chunk size" or specify "word count" / "character count"

❌ **Calling Display Window a "modal" or "popup"**
- Use: "Display Window" or "Overlay"

❌ **Mixing timing terms**
- Don't say "speed" when you mean "duration"
- Don't say "interval" when you mean "display duration"

❌ **Confusing chunk index with text position**
- Chunk index: Position in Chunk Sequence (0, 1, 2...)
- Text position: Character offset in Text Source (0, 5, 10...)

---

## Glossary Quick Reference

| Term | Short Definition |
|------|------------------|
| Text Source | Original input text |
| Chunk | Individual unit of text to display |
| Chunking Strategy | How text is divided (word/char-based) |
| Chunk Sequence | Ordered collection of chunks |
| Display Window | Visual container for current chunk |
| Chunk Timing | Duration parameters for display |
| Chunk Progression | Process of advancing through chunks |
| Reading Speed | WPM setting affecting timing |
| Display Duration | Time a chunk is visible |
| WPM | Words Per Minute reading speed |

