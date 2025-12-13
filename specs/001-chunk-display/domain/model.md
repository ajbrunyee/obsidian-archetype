# Domain Model - Chunk Display

This document describes the domain model for the Chunk Display feature, including entities, value objects, and their relationships.

## Model Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Domain Model                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TextSource                 ChunkingStrategy                     │
│  ┌──────────┐              ┌────────────────┐                   │
│  │ content  │──────────>   │ type           │                   │
│  └──────────┘              │ chunkSize      │                   │
│                            │ chunk()        │                   │
│                            └────────────────┘                   │
│                                    │                             │
│                                    ▼                             │
│                            ChunkSequence                         │
│                            ┌────────────────┐                   │
│                            │ chunks[]       │                   │
│                            │ currentIndex   │                   │
│                            │ next()         │                   │
│                            │ previous()     │                   │
│                            └────────────────┘                   │
│                                    │                             │
│                                    │ contains                    │
│                                    ▼                             │
│                            Chunk                                 │
│                            ┌────────────────┐                   │
│                            │ content        │                   │
│                            │ sequenceNumber │                   │
│                            │ wordCount()    │                   │
│                            └────────────────┘                   │
│                                                                   │
│  ChunkProgression          ChunkTiming                          │
│  ┌──────────────┐         ┌────────────────┐                   │
│  │ state        │────────>│ readingSpeed   │                   │
│  │ start()      │         │ calculateDuration() │             │
│  │ pause()      │         └────────────────┘                   │
│  │ resume()     │                                               │
│  └──────────────┘                                               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Entities

### ChunkProgression
**Identity**: Unique progression session

**Attributes**:
- `sequence: ChunkSequence` - The chunks being progressed through
- `state: ProgressionState` - Current playback state
- `currentIndex: number` - Current position in sequence
- `timerId: number | null` - Reference to active timer

**Behaviors**:
- `start()` - Begin progression from beginning or current position
- `pause()` - Pause progression, retain position
- `resume()` - Continue from current position
- `stop()` - Stop and reset to beginning
- `next()` - Advance to next chunk
- `previous()` - Go back to previous chunk

**Invariants**:
- Cannot start if already playing
- Cannot pause if not playing
- currentIndex must be valid (0 <= index < sequence.length)

---

## Value Objects

### Chunk
**Definition**: Immutable unit of text

**Attributes**:
- `content: string` - The text content
- `sequenceNumber: number` - Position in sequence (0-based)

**Computed Properties**:
- `wordCount(): number` - Count of words in content
- `characterCount(): number` - Length of content

**Invariants**:
- content must not be empty
- sequenceNumber must be non-negative

**Equality**: Two chunks are equal if they have the same content and sequenceNumber

---

### ChunkSequence
**Definition**: Immutable ordered collection of chunks

**Attributes**:
- `chunks: ReadonlyArray<Chunk>` - Ordered array of chunks

**Computed Properties**:
- `length: number` - Total number of chunks
- `isEmpty: boolean` - True if no chunks

**Behaviors**:
- `getChunk(index: number): Chunk | null` - Get chunk at index
- `getFirst(): Chunk | null` - Get first chunk
- `getLast(): Chunk | null` - Get last chunk
- `hasNext(index: number): boolean` - Check if next chunk exists
- `hasPrevious(index: number): boolean` - Check if previous chunk exists

**Invariants**:
- chunks array must not be null
- All chunks must have sequential sequenceNumbers (0, 1, 2, ...)

---

### ChunkingStrategy
**Definition**: Configuration for how text is chunked

**Attributes**:
- `type: ChunkingType` - WORD_BASED or CHARACTER_BASED
- `chunkSize: number` - Number of units per chunk

**Behaviors**:
- `chunk(text: string): ChunkSequence` - Convert text to chunks

**Invariants**:
- chunkSize must be positive (> 0)

**Factory Methods**:
- `ChunkingStrategy.wordBased(size: number)`
- `ChunkingStrategy.characterBased(size: number)`

---

### ChunkTiming
**Definition**: Timing configuration for chunk display

**Attributes**:
- `readingSpeed: ReadingSpeed` - WPM setting

**Behaviors**:
- `calculateDuration(chunk: Chunk): number` - Calculate display time in milliseconds

**Invariants**:
- Calculated duration must be >= MIN_DURATION (100ms)
- Calculated duration must be <= MAX_DURATION (10000ms)

---

### ReadingSpeed
**Definition**: Words per minute reading rate

**Attributes**:
- `wpm: number` - Words per minute value

**Invariants**:
- wpm must be positive (> 0)
- wpm should typically be in range 100-800 for practical use

**Factory Methods**:
- `ReadingSpeed.fromWPM(wpm: number)`
- Predefined: `ReadingSpeed.SLOW` (200 WPM)
- Predefined: `ReadingSpeed.NORMAL` (300 WPM)
- Predefined: `ReadingSpeed.FAST` (450 WPM)

---

## Enumerations

### ChunkingType
```typescript
enum ChunkingType {
  WORD_BASED,
  CHARACTER_BASED
}
```

### ProgressionState
```typescript
enum ProgressionState {
  IDLE,
  PLAYING,
  PAUSED,
  COMPLETED
}
```

---

## Domain Services

### ChunkingService
**Responsibility**: Convert text into chunks based on strategy

**Operations**:
- `chunkByWords(text: string, wordCount: number): ChunkSequence`
- `chunkByCharacters(text: string, charCount: number): ChunkSequence`

**Business Rules**:
- Preserve word boundaries for word-based chunking
- Handle edge cases (empty text, whitespace, special characters)
- Ensure complete text coverage

---

### TimingService
**Responsibility**: Calculate display durations

**Operations**:
- `calculateChunkDuration(chunk: Chunk, wpm: number): number`
- `calculateSequenceDuration(sequence: ChunkSequence, wpm: number): number`

**Business Rules**:
- Apply MIN/MAX duration constraints
- Round to nearest millisecond
- Account for single-character chunks

---

## Aggregates

### ReadingSession (future consideration)
**Root Entity**: ChunkProgression

**Contains**:
- ChunkProgression
- ChunkSequence
- ChunkTiming
- Current chunk reference
- Display state

This could be introduced later to manage the full lifecycle of a reading session.

---

## Domain Events (future consideration)

Events that could be published by the domain:
- `ChunkDisplayed(chunkIndex: number, chunk: Chunk)`
- `ProgressionStarted(sequenceLength: number)`
- `ProgressionPaused(currentIndex: number)`
- `ProgressionCompleted(totalChunks: number)`
- `ProgressionStopped()`

---

## Invariants & Constraints

### Global Invariants
1. **Text Coverage**: All characters from source text must appear in exactly one chunk
2. **Sequential Ordering**: Chunks must maintain source text order
3. **No Overlap**: Chunks cannot contain overlapping text positions
4. **Positive Durations**: All calculated durations must be positive

### Timing Constraints
- `MIN_DISPLAY_DURATION = 100` (ms)
- `MAX_DISPLAY_DURATION = 10000` (ms)
- `MIN_WPM = 50`
- `MAX_WPM = 1000`

### Chunking Constraints
- `MIN_CHUNK_SIZE = 1`
- `MAX_CHUNK_SIZE = 100` (configurable)
- `DEFAULT_WORD_CHUNK_SIZE = 3`
- `DEFAULT_CHARACTER_CHUNK_SIZE = 15`

---

## Design Principles

### Immutability
Value objects (Chunk, ChunkSequence, ChunkingStrategy, etc.) are immutable. Once created, their state cannot change.

### Single Responsibility
Each class has one reason to change:
- Chunk: Representation of text unit
- ChunkingStrategy: Chunking algorithm
- ChunkTiming: Duration calculation
- ChunkProgression: Playback state management

### Domain-Driven Design
- Domain logic lives in the domain layer
- UI concerns (Display Window) are separate
- Infrastructure concerns (timers, intervals) are abstracted

### Testability
- Pure functions for chunking and timing calculations
- No hidden dependencies
- Easy to test in isolation

