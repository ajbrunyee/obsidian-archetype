# Ubiquitous Language - Chunk Display (Spec 001)

This document defines the domain language for the Chunk Display feature (speed reading mode). These terms align with the broader Archetype project's Ubiquitous Language while remaining specific to this bounded context.

## Alignment with Project-Wide UL

This feature implements:
- **Mode**: Speed reading constraint mode
- **Source**: SourceText (written material)
- **Segment**: TextSegment sized to working memory
- **Session**: Reading practice session
- **Constraint**: Fixed display window, timed progression

---

## Core Concepts

### SourceText (aligned with project UL)
**Definition**: The canonical written material to be read, typically from a user's selection or document content.

**Replaces**: "Text Source" from original spec
**Why**: Aligns with project-wide input domain terminology

**Properties**:
- Raw text content
- Length in characters
- May contain whitespace, punctuation, special characters

**Examples**:
- "The quick brown fox jumps over the lazy dog"
- Multi-paragraph text from an Obsidian note

---

### TextSegment (aligned with project UL)
**Definition**: A chunk of text sized to working memory, extracted from SourceText for individual display.

**Replaces**: "Chunk" from original spec
**Why**: "Segment" is the project-wide term for "smallest unit of controlled attention"

**Properties**:
- Content (string)
- Position within source (sequence number)
- Length (in characters or words)

**Invariants**:
- Must contain at least one character
- Cannot overlap with other segments
- Sequence must be contiguous (no gaps between segments)

**Examples**:
- "The quick brown" (word-based segment, size 3)
- "The quick" (character-based segment, size 9)

**Implementation Note**: In code, this remains `Chunk` class for now (technical term), but we should use "segment" in UI, docs, and discussions.

---

### Segmentation Strategy
**Definition**: The algorithm/rules for dividing SourceText into TextSegments.

**Replaces**: "Chunking Strategy" from original spec
**Why**: Consistency with "Segment" terminology

**Types**:
1. **Word-Based Segmentation**: Splits by word boundaries (whitespace)
   - Segment size measured in word count
   - Preserves word integrity

2. **Character-Based Segmentation**: Splits by character count
   - Segment size measured in character count
   - May split words mid-character

**Properties**:
- Segment Size: The number of units (words or characters) per segment
- Type: Word-based or Character-based

---

### Segment Sequence
**Definition**: An ordered collection of TextSegments derived from a single SourceText.

**Replaces**: "Chunk Sequence" from original spec

**Properties**:
- Total count of segments
- Current position/index
- Navigation state (can advance, can retreat)

**Operations**:
- Get segment at index
- Get next segment
- Get previous segment
- Get first/last segment

**Invariants**:
- Order matches source text order
- No gaps between segments
- Complete coverage of source text

---

### Display Window
**Definition**: The visual container where a single TextSegment is rendered at any given time. This is the primary **constraint** in this mode.

**Constraint Properties**:
- Fixed dimensions (no layout shift)
- Single segment visible at a time
- Timed progression (cannot control pace manually during playback)

**Properties**:
- Fixed dimensions (width, height)
- Font size and styling
- Background color (theme-aware)
- Position (centered on screen)

**Constraints**:
- Dimensions do not change between segments (zero layout shift)
- Always shows exactly one segment at a time
- Overflow is clipped (no scrolling)

---

### Segment Timing
**Definition**: The duration parameters controlling how long a segment is displayed.

**Properties**:
- **Display Duration**: Time (milliseconds) a segment remains visible
- **Transition Time**: Time between segments (if animations exist)
- **Words Per Minute (WPM)**: Reading speed metric used to calculate display duration

**Calculation**:
```
Display Duration (ms) = (Words in Segment / WPM) * 60000
```

**Constraints**:
- Minimum: 100ms (ensures visibility)
- Maximum: 10000ms (prevents excessive delays)

**Example**:
- WPM: 300
- Segment: "The quick brown" (3 words)
- Display Duration: (3 / 300) * 60000 = 600ms

---

### Segment Progression
**Definition**: The process of advancing through a Segment Sequence over time.

**Replaces**: "Chunk Progression" from original spec

**States**:
- **Idle**: Not running, awaiting start
- **Playing**: Actively displaying segments in sequence
- **Paused**: Temporarily stopped, can resume
- **Completed**: Reached end of sequence

**Operations**:
- Start: Begin progression from first or current segment
- Pause: Stop progression, retain position
- Resume: Continue from current position
- Stop: End progression, reset to beginning

**Properties**:
- Current segment index
- Playback state
- Timer/interval reference

---

### Reading Speed
**Definition**: The pace at which segments are presented, measured in Words Per Minute (WPM).

**Properties**:
- Numeric value (typical range: 200-600 WPM)
- Adjustable by user
- Affects display duration calculation

**Examples**:
- 250 WPM: Average reading speed
- 400 WPM: Fast reading speed
- 600+ WPM: Speed reading

---

## Alignment with Broader UL Concepts

### Session (project-wide)
In this context, a **Session** is:
- A bounded period of speed reading practice
- Begins when user starts segment progression
- Ends when user stops or completes sequence
- May produce **Artifacts** (reading stats, completion metrics)

### Mode (project-wide)
This feature implements a **Mode** called "Speed Reading":
- **Constraint**: Fixed display window + timed progression
- **Input**: SourceText (written material)
- **Processing**: Segmentation into TextSegments
- **Output**: Visual display of segments at controlled pace

### Constraint (project-wide)
The core **Constraints** in this mode:
1. **Display Window Size**: Fixed, no resizing
2. **Segment Duration**: Calculated from WPM, user cannot skip
3. **Single Segment Focus**: Only one segment visible at a time

These constraints force attention and reveal:
- Reading pace limitations
- Comprehension under time pressure
- Ability to process information quickly

### Fluency (project-wide)
**Fluency** in speed reading context:
- Stable comprehension as WPM increases
- Not just raw speed, but controlled understanding
- Measured by validation (can recall/reproduce content)

### Validation (project-wide)
**Validation** for speed reading:
- Not implemented in Spec 001 (display only)
- Future specs may add comprehension checks
- Evidence of convergence: maintaining comprehension as speed increases

---

## Terminology Migration Guide

For consistency with project-wide UL, prefer these terms:

| Old Term (Spec 001) | New Term (Project UL) | Context |
|---------------------|----------------------|---------|
| Text Source | SourceText | Input domain |
| Chunk | TextSegment | Segment type |
| Chunk Sequence | Segment Sequence | Collection |
| Chunking Strategy | Segmentation Strategy | Algorithm |
| Chunk Progression | Segment Progression | Playback |
| Chunk Timing | Segment Timing | Duration calculation |

**Implementation Note**: Code classes may retain "Chunk" naming for now (e.g., `Chunk.ts`, `ChunkSequence.ts`) as a technical implementation detail, but:
- Use "Segment" in UI labels
- Use "Segment" in user-facing documentation
- Use "Segment" in comments and discussions
- Consider renaming classes in future refactor

---

## Domain Relationships (Updated)

```
SourceText (canonical input)
    │
    ├─[applies]──> Segmentation Strategy
    │                   │
    │                   ├─ Word-Based (segment size in words)
    │                   └─ Character-Based (segment size in chars)
    │
    └─[produces]──> Segment Sequence
                        │
                        ├─[contains]──> TextSegment (ordered)
                        │                   │
                        │                   └─[displayed in]──> Display Window (Constraint)
                        │
                        └─[managed by]──> Segment Progression (Mode)
                                              │
                                              └─[uses]──> Segment Timing
                                                              │
                                                              └─[derived from]──> Reading Speed (WPM)
```

---

## Business Rules (Updated)

### BR-1: Segment Size Limits
- Minimum segment size: 1 unit (word or character)
- Maximum segment size: Configurable, but should fit Display Window
- Default word-based segment size: 3-5 words
- Default character-based segment size: 15-20 characters

### BR-2: Display Duration Calculation
- Based on segment word count and WPM setting
- Minimum display duration: 100ms (to ensure visibility)
- Maximum display duration: 10000ms (10 seconds)

### BR-3: Layout Stability (Constraint)
- Display Window dimensions must remain fixed
- Font size must not change between segments
- Overflow is clipped, never causes scrolling or resizing

### BR-4: Text Coverage
- All text from SourceText must be included in segments
- No text should be lost during segmentation
- Segments should not overlap

---

## Anti-Patterns to Avoid

❌ **Calling segments "words" when size could be characters**
- Use: "segment size" or specify "word count" / "character count"

❌ **Calling Display Window a "modal" or "popup"**
- Use: "Display Window" or "Overlay"

❌ **Mixing timing terms**
- Don't say "speed" when you mean "duration"
- Don't say "interval" when you mean "display duration"

❌ **Using "chunk" in user-facing contexts**
- Say: "segment" (aligned with project UL)
- Keep: "chunk" in code as implementation detail (for now)

❌ **Conflating raw speed with fluency**
- Fluency = stable comprehension under speed constraint
- Speed = raw WPM number

---

## Project Philosophy Applied to Speed Reading

From the project's core doctrine:

> **Learning quality is measured by stability, intelligibility, and convergence under constraint — not speed or polish.**

Applied to speed reading:
- **Stability**: Consistent comprehension as WPM increases
- **Intelligibility**: Clear understanding of content (not just recognition)
- **Convergence**: Improvement over time, not single-session performance
- **Constraint**: Fixed display + timed progression forces focus
- **Not speed**: High WPM alone doesn't indicate reading quality
- **Not polish**: Smooth playback doesn't mean comprehension

---

## Non-Goals (Explicitly Excluded from Spec 001)

Following project-wide philosophy:
* Single-shot correctness metrics
* Raw speed metrics without comprehension validation
* Native reading speed comparisons
* Accent/pronunciation (not applicable to reading)

Spec 001 focuses on:
* Display infrastructure (constraint implementation)
* Segment timing and progression
* Foundation for future validation specs

---

## Glossary Quick Reference

| Term | Short Definition | Project Alignment |
|------|------------------|-------------------|
| SourceText | Original input text | ✅ Project UL |
| TextSegment | Individual unit to display | ✅ Project UL |
| Segmentation Strategy | How text is divided | Aligned with "Segment" |
| Segment Sequence | Ordered collection | Aligned with "Segment" |
| Display Window | Visual container (Constraint) | ✅ Project UL |
| Segment Timing | Duration parameters | Aligned with "Segment" |
| Segment Progression | Advancing through segments | Aligned with "Segment" |
| Reading Speed | WPM setting | Speed reading specific |
| Display Duration | Time segment is visible | Speed reading specific |
| Session | Bounded practice period | ✅ Project UL |
| Mode | Speed reading rule-set | ✅ Project UL |
| Constraint | Fixed window + timing | ✅ Project UL |
| Fluency | Stable control under speed | ✅ Project UL |

---

## Future Evolution

As the project grows, this bounded context may:
1. Add **Validation** mechanisms (comprehension checks)
2. Track **Convergence** (reading speed improvement over time)
3. Measure **Fluency** (stable comprehension at higher WPM)
4. Generate **Artifacts** (session stats, reading profiles)
5. Implement **Constraint Breach** detection (user skips segments)

These additions will be defined in future specs (002, 003, etc.) and will maintain alignment with the project-wide Ubiquitous Language.
