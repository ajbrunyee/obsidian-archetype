# Feature 2: Chunk Player

## Overview

Archetype plugin - Feature 2

## Problem Statement

Speed reading requires text to be processed, cleaned, and presented at precise intervals. Markdown formatting must be stripped, text must be grouped into configurable chunks, and playback must be smooth and predictable.

## Goals

- Convert raw markdown text into clean word chunks
- Display chunks at configurable intervals (WPM-based)
- Show first chunk immediately (no initial delay)
- Handle all common markdown syntax
- Accurate timing with automatic cleanup

## Non-Goals

- Pause/resume functionality (future enhancement)
- Skip forward/backward controls
- Reading progress tracking
- Audio narration

---

## Requirements

### Functional

- Convert raw markdown text into clean word chunks
- Group words according to `wordcount` setting
- Display chunks at intervals determined by `wpm` setting
- Show first chunk immediately (no initial delay)
- Stop playback automatically when all chunks displayed
- Strip markdown formatting (bold, italic, links, images, etc.)

### Non-Functional

- Process selections up to 10,000 words without lag
- Accurate timing (±50ms per interval)
- Handle all Obsidian markdown syntax variants

---

## Design

### Component: ChunkPlayer

The chunk player is implemented as part of the `ViewModal` class and manages three responsibilities:

1. **Text Processing** (`createFlashes`)
2. **Playback Control** (interval management)
3. **Display Updates** (`flash`)

### Data Flow

```
User Selection
      ↓
getSelection() → raw markdown text
      ↓
createFlashes() → Flash[] array
      ↓
flash() (immediate) → display Flash[0]
      ↓
setInterval() → display Flash[1..n] at (60000 * wordcount) / wpm ms
      ↓
End of chunks → clearInterval()
```

### Text Processing Pipeline

```
Raw Text
  ↓
Strip image embeds: ![[...]] → " "
  ↓
Extract link labels: [[page|label]] → "label"
  ↓
Remove formatting: **bold**, *italic*, ~~strike~~, `code` → text
  ↓
Normalize whitespace: \t\r\n → " "
  ↓
Split on whitespace → word array
  ↓
Group into chunks (wordcount words each)
  ↓
Flash[] array
```

---

## Implementation

### Class: Flash

```typescript
class Flash {
  public text: string;
  constructor(text: string) {
    this.text = text;
  }
}
```

### Method: createFlashes(selection: string): Flash[]

Processes markdown text into clean word chunks:

1. Replace image embeds: `/!\[\[[^\]]+\]\]/g` → `" "`
2. Extract link text: `/\[\[([^\]]+)\]\]/g` → `"$1"`
3. Strip formatting markers: `/[*_~`]/g` → `""`
4. Normalize whitespace: `/[\t\r\n]+/g` → `" "`
5. Split on whitespace: `.split(/\s+/)`
6. Filter empty strings and pure hashtags
7. Group into arrays of `wordcount` size
8. Convert each group to `Flash` object with joined text

### Method: flash()

Updates the displayer with the current chunk:

```typescript
flash() {
  if (this.index >= this.flashes.length) {
    clearInterval(this.intervalId);
    return;
  }
  this.displayer.childNodes[0].nodeValue = this.flashes[this.index].text;
  this.index++;
}
```

### Playback Initialization

```typescript
// In onOpen()
this.flashes = this.createFlashes(this.selection);
this.index = 0;

// Show first chunk immediately
if (this.flashes.length > 0) {
  this.flash();
}

// Start interval for subsequent chunks
const intervalMs = (60 * 1000 * this.wordcount) / this.wpm;
this.intervalId = window.setInterval(this.flash.bind(this), intervalMs);
```

### Cleanup

```typescript
onClose() {
  if (this.intervalId !== null) {
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }
  // Remove overlay from DOM
}
```

---

## Configuration

### Settings: ArchetypeSettings

```typescript
interface ArchetypeSettings {
  wpm: string;       // Words per minute (default: "600")
  wordcount: string; // Words per chunk (default: "1")
}
```

### Interval Calculation

```
intervalMs = (60,000 ms/min × words/chunk) / (words/min)
           = (60,000 × wordcount) / wpm

Example: 600 WPM, 1 word/chunk
  → (60,000 × 1) / 600 = 100ms per chunk
```

---

## Edge Cases

- **Empty selection**: Returns empty `Flash[]`, playback ends immediately
- **Single word selection**: Creates single-chunk array, displays once
- **Markdown-only selection**: After stripping, may result in empty/whitespace chunks (filtered)
- **Very low WPM**: First chunk shows immediately, subsequent chunks delayed
- **Very high WPM**: Minimum interval ~16ms (capped by `setInterval` precision)
- **Chunk overflow**: Text wraps within displayer, clipped if exceeds container

---

## Testing Scenarios

1. **Basic playback**: Select plain text → verify chunks display at correct rate
2. **Markdown stripping**: Select `**bold** _italic_` → verify displays as `bold italic`
3. **Link handling**: Select `[[Page Name]]` → verify displays as `Page Name`
4. **Image handling**: Select `![[image.png]]` → verify image reference removed
5. **Immediate display**: Set WPM=60 (1 second/word) → verify first word shows instantly
6. **Multi-word chunks**: Set wordcount=3 → verify 3 words display together
7. **Long text**: Select 1000+ words → verify smooth playback, no lag
8. **Layout stability**: Mix short/long chunks → verify no modal resizing

---

## Future Enhancements

- Pause/resume functionality (SPACE key)
- Skip forward/backward (arrow keys)
- Progress indicator (e.g., "15 / 120 chunks")
- Reading statistics (avg WPM, time spent)
- Focal point highlighting (center letter emphasis)

