# Test Plan - Domain Model

This document outlines the testing strategy for the Chunk Display domain model.

## Test Structure

Tests are organized by domain concept, following the structure:
```
src/domain/
  ├── chunking/
  │   ├── Chunk.ts
  │   ├── Chunk.test.ts
  │   ├── ChunkSequence.ts
  │   ├── ChunkSequence.test.ts
  │   ├── ChunkingStrategy.ts
  │   ├── ChunkingStrategy.test.ts
  │   └── ChunkingService.test.ts
  ├── timing/
  │   ├── ReadingSpeed.ts
  │   ├── ReadingSpeed.test.ts
  │   ├── ChunkTiming.ts
  │   ├── ChunkTiming.test.ts
  │   └── TimingService.test.ts
  └── progression/
      ├── ChunkProgression.ts
      └── ChunkProgression.test.ts
```

---

## Critical Test Cases

### 1. Chunking Tests

#### ChunkingStrategy - Word-Based
- ✅ Chunks simple text into correct word groups
- ✅ Handles text with multiple spaces
- ✅ Handles text with newlines and tabs
- ✅ Handles punctuation attached to words
- ✅ Last chunk contains remaining words (even if less than chunk size)
- ✅ Empty text produces empty sequence
- ✅ Single word produces single chunk
- ✅ Preserves word order

#### ChunkingStrategy - Character-Based
- ✅ Chunks text by exact character count
- ✅ May split words mid-character
- ✅ Last chunk contains remaining characters
- ✅ Handles special characters and unicode
- ✅ Handles whitespace correctly
- ✅ Empty text produces empty sequence

#### Chunk (Value Object)
- ✅ Cannot create chunk with empty content
- ✅ Word count calculated correctly
- ✅ Character count matches content length
- ✅ Sequence number preserved
- ✅ Equality works correctly (same content + sequence number)
- ✅ Immutable (no setters)

#### ChunkSequence (Value Object)
- ✅ Get chunk at valid index returns chunk
- ✅ Get chunk at invalid index returns null
- ✅ getFirst() returns first chunk
- ✅ getLast() returns last chunk
- ✅ isEmpty works for empty and non-empty sequences
- ✅ hasNext() correctly identifies if next chunk exists
- ✅ hasPrevious() correctly identifies if previous chunk exists
- ✅ length property accurate
- ✅ Immutable (cannot modify chunks array)

---

### 2. Timing Tests

#### ReadingSpeed (Value Object)
- ✅ Cannot create with non-positive WPM
- ✅ Predefined speeds (SLOW, NORMAL, FAST) have correct values
- ✅ Custom WPM values work
- ✅ Immutable

#### ChunkTiming
- ✅ Calculates correct duration for multi-word chunk
- ✅ Applies minimum duration constraint (100ms)
- ✅ Applies maximum duration constraint (10000ms)
- ✅ Handles single-word chunks
- ✅ Handles single-character chunks
- ✅ Duration calculation formula: (wordCount / WPM) * 60000
- ✅ Returns integer milliseconds

#### TimingService
- ✅ Calculate duration for individual chunk
- ✅ Calculate total duration for entire sequence
- ✅ Edge case: empty sequence returns 0
- ✅ Edge case: very fast WPM still respects minimum duration

---

### 3. Progression Tests

#### ChunkProgression (Entity)
- ✅ Initial state is IDLE
- ✅ start() transitions to PLAYING
- ✅ pause() transitions to PAUSED
- ✅ resume() transitions back to PLAYING
- ✅ stop() transitions to IDLE and resets position
- ✅ Cannot start when already playing
- ✅ Cannot pause when not playing
- ✅ Cannot resume when not paused
- ✅ next() advances current index
- ✅ previous() decrements current index
- ✅ next() at end of sequence transitions to COMPLETED
- ✅ previous() at beginning stays at 0
- ✅ Emits current chunk on advancement
- ✅ Timer is cleared on stop/pause

---

## Test Data

### Sample Texts
```typescript
const SHORT_TEXT = "The quick brown fox";
const MEDIUM_TEXT = "The quick brown fox jumps over the lazy dog. Speed reading improves comprehension.";
const LONG_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
const SPECIAL_CHARS = "Hello, world! How are you? I'm fine—thanks.";
const MULTILINE_TEXT = "First line\nSecond line\nThird line";
const WHITESPACE_TEXT = "Multiple    spaces   between    words";
```

### Test Configurations
```typescript
const CONFIGS = {
  wordBased: {
    small: { chunkSize: 2, wpm: 300 },
    medium: { chunkSize: 4, wpm: 300 },
    large: { chunkSize: 6, wpm: 300 }
  },
  characterBased: {
    small: { chunkSize: 10, wpm: 300 },
    medium: { chunkSize: 20, wpm: 300 },
    large: { chunkSize: 30, wpm: 300 }
  }
};
```

---

## Property-Based Testing (Future)

Consider adding property-based tests for:
- **Coverage**: All source text characters appear in chunks
- **Ordering**: Concatenating all chunks reproduces source text (with possible whitespace normalization)
- **Boundaries**: No chunk exceeds configured size (except last chunk)
- **Timing**: All calculated durations fall within valid range

---

## Performance Tests

### Targets
- Chunk 10,000 word document in < 50ms
- Calculate timing for 1,000 chunk sequence in < 10ms
- Create ChunkSequence with 1,000 chunks in < 20ms

### Memory
- No memory leaks when progressing through large sequences
- ChunkSequence doesn't duplicate source text unnecessarily

---

## Integration Points (to UI layer)

While these are unit tests for the domain, we need to ensure:
1. Chunking service can process Obsidian note content
2. Timing service durations work with browser setTimeout/setInterval
3. Progression state changes can trigger UI updates (via callbacks/events)

---

## Test Execution

### Run all domain tests:
```bash
npm test -- src/domain
```

### Run specific test suites:
```bash
npm test -- Chunk.test.ts
npm test -- ChunkingStrategy.test.ts
npm test -- ChunkTiming.test.ts
npm test -- ChunkProgression.test.ts
```

### Watch mode during development:
```bash
npm test -- --watch src/domain
```

---

## Coverage Goals

- **Line Coverage**: 100% for domain logic (no UI dependencies)
- **Branch Coverage**: 100% for all conditional logic
- **Edge Cases**: All boundary conditions tested

Domain logic should be pure and highly testable. If coverage is below 95%, investigate why.

