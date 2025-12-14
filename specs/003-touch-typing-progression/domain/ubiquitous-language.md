# Ubiquitous Language - Touch Typing Progression

This document defines the shared vocabulary for the Touch Typing Progression feature.

---

## Core Domain Terms

### Typing Session
**Definition**: An active session where a user progresses through text chunks by typing them.

**Properties**: State (idle/active/completed), chunk sequence, match strategy, attempt history.

**Synonyms**: None (use "session" in code and docs).

**Usage**: "User starts a typing session" / "Session tracks all attempts"

---

### Target Text
**Definition**: The text chunk that the user is expected to type.

**Context**: Displayed at the top of the overlay as the reference.

**Synonyms**: "Reference text", "Expected input", "Goal text"

**Preferred**: "Target text" or just "target"

**Usage**: "User types the target text" / "Compare input to target"

---

### User Input
**Definition**: The text that the user has typed into the input field.

**Context**: Real-time text being entered by the user.

**Synonyms**: "Typed text", "Input string", "User entry"

**Preferred**: "User input" or just "input"

**Usage**: "Validate user input" / "Input matches target"

---

### Match Strategy
**Definition**: The algorithm used to determine if user input matches the target text.

**Types**: Lenient (case-insensitive), Strict (exact), Fuzzy (typo-tolerant)

**Synonyms**: "Comparison strategy", "Validation strategy"

**Preferred**: "Match strategy"

**Usage**: "Apply lenient match strategy" / "Change to strict matching"

---

### Typing Attempt
**Definition**: A single submission of user input for comparison to the target.

**Context**: Recorded for every input submission, successful or not.

**Synonyms**: "Try", "Submission", "Input event"

**Preferred**: "Attempt"

**Usage**: "Record attempt" / "User made 3 attempts on this chunk"

---

### Match Result
**Definition**: The outcome of comparing user input to target text.

**Types**: Success (match), Failure (no match)

**Synonyms**: "Comparison result", "Validation result"

**Preferred**: "Match" (boolean) or "Match result" (object)

**Usage**: "Match was successful" / "Return match result"

---

### Typing Speed
**Definition**: The rate at which the user types, measured in characters or words per minute.

**Metrics**: CPM (Characters Per Minute), WPM (Words Per Minute)

**Preferred**: Use CPM for typing mode (more precise)

**Usage**: "User's typing speed is 180 CPM" / "Calculate typing speed"

---

### Accuracy
**Definition**: The percentage of successful attempts vs total attempts.

**Calculation**: `successfulAttempts / totalAttempts * 100`

**Range**: 0-100%

**Synonyms**: "Success rate", "Correctness"

**Preferred**: "Accuracy"

**Usage**: "Session accuracy is 95%" / "Track accuracy over time"

---

### Chunk Completion Time
**Definition**: The duration from when a chunk is displayed to when it's successfully typed.

**Measurement**: Milliseconds

**Includes**: Time for all attempts (including failed ones)

**Synonyms**: "Chunk duration", "Time per chunk"

**Preferred**: "Completion time"

**Usage**: "Average completion time: 2.5 seconds"

---

## State Terms

### Idle
**Definition**: Session exists but hasn't started yet.

**Transition**: → Awaiting Input (via `start()`)

**UI State**: Session created, ready to begin

---

### Awaiting Input
**Definition**: Session is active, waiting for user to start typing the current chunk.

**Context**: Chunk is displayed, input field is focused, user hasn't typed yet.

**Transition**: → Active (when user types first character)

**UI State**: Target displayed, cursor in input field

---

### Active
**Definition**: User is currently typing (has entered at least one character).

**Context**: Real-time comparison happening as user types.

**Transition**: → Awaiting Input (on successful match, next chunk) or → Completed (last chunk matched)

**UI State**: User typing, feedback may be shown

---

### Completed
**Definition**: All chunks have been successfully typed.

**Context**: Session is finished, statistics are final.

**Transition**: None (terminal state)

**UI State**: Show statistics summary, option to close

---

## Match Strategy Terms

### Lenient Matching
**Definition**: Case-insensitive comparison with whitespace trimming.

**Use Case**: Default mode, encourages speed over precision.

**Example**: "Hello" matches "hello", " HELLO ", "HeLLo"

**Usage**: "Lenient matching ignores case differences"

---

### Strict Matching
**Definition**: Exact character-by-character comparison.

**Use Case**: Typing practice, accuracy training.

**Example**: "Hello" only matches "Hello" (not "hello")

**Usage**: "Strict matching requires exact match"

---

### Fuzzy Matching
**Definition**: Allows minor typos (Levenshtein distance ≤ 2).

**Use Case**: Balance between speed and accuracy.

**Example**: "Hello" matches "Helo", "Hllo", "Helol"

**Usage**: "Fuzzy matching tolerates 1-2 typos"

---

## Metrics Terms

### Attempt Count
**Definition**: Total number of times user submitted input for a chunk.

**Context**: Includes both successful and failed submissions.

**Usage**: "Chunk required 3 attempts to complete"

---

### Error Count
**Definition**: Number of failed attempts (inputs that didn't match).

**Calculation**: `totalAttempts - successfulAttempts`

**Usage**: "Session had 5 errors across 50 chunks"

---

### Session Duration
**Definition**: Total time from session start to completion.

**Measurement**: Milliseconds

**Includes**: All chunks, all attempts, all pauses

**Usage**: "Session completed in 5 minutes 32 seconds"

---

## Anti-Patterns (What NOT to Say)

❌ **"Validation"** → Use "Match" or "Comparison"
  - "Validation" implies correctness judgment; "match" is neutral

❌ **"Test"** → Use "Attempt"
  - "Test" implies assessment; "attempt" is user action

❌ **"Score"** → Use "Statistics" or "Metrics"
  - Avoids gamification (non-goal)

❌ **"Level" / "Achievement"** → Not used
  - No gamification in this feature

❌ **"Failure"** → Use "Mismatch" or "Unsuccessful attempt"
  - Less negative framing

❌ **"Correct" / "Incorrect"** → Use "Match" / "No match"
  - Avoids judgment (user is learning)

---

## Integration with Existing UL (Spec 001)

### Reused Terms

**Chunk** - Basic text unit (no changes)
**Chunk Sequence** - Ordered collection of chunks
**Progression** - Movement through chunks
**Session** - Active reading period

### Extended Terms

**Progression** → Now has two modes:
- Automatic progression (timer-based)
- Typing progression (input-based)

**Session State** → Extended with:
- `AWAITING_INPUT` (new state for typing mode)

---

## Example Conversations

**Developer 1**: "The user input matches the target using lenient matching."
**Developer 2**: "So we record a successful attempt and advance to the next chunk?"
**Developer 1**: "Correct. We also update the session statistics."

---

**Designer**: "What happens if the user types incorrectly?"
**Developer**: "We record an unsuccessful attempt, show feedback, but don't advance. They can try again."
**Designer**: "How many attempts are allowed?"
**Developer**: "Unlimited. We track all attempts for accuracy calculation."

---

**PM**: "Can users change the match strategy mid-session?"
**Developer**: "Yes, match strategy is configurable. New attempts use the current strategy."
**PM**: "What about previous attempts?"
**Developer**: "Previous attempts retain their original strategy for historical accuracy."

---

## Naming Conventions

### Classes
- `TypingSession` (entity)
- `TypingAttempt` (value object)
- `MatchStrategy` (interface/strategy pattern)
- `TypingStatistics` (value object)

### Methods
- `submitInput()` not `validate()` or `check()`
- `matches()` not `isCorrect()` or `isValid()`
- `recordAttempt()` not `saveResult()`
- `calculateStatistics()` not `getScore()`

### Properties
- `isMatch: boolean` not `isCorrect` or `isValid`
- `accuracy: number` not `score` or `grade`
- `attemptNumber: number` not `tryCount` or `testNumber`

---

## Context Boundaries

### Typing Context (This Feature)
- Match strategies
- Attempt tracking
- Typing statistics
- Real-time comparison

### Reading Context (Spec 001)
- Chunk creation
- Chunk sequence
- Basic progression

### Shared Context
- Chunk (shared concept)
- Progression state (extended)
- Session (extended)

---

## Glossary Quick Reference

| Term | Definition | Synonym | Usage |
|------|------------|---------|-------|
| Typing Session | Active typing-based reading session | Session | "Start typing session" |
| Target Text | Text user should type | Target, Reference | "Display target text" |
| User Input | Text user has typed | Input | "Compare user input" |
| Match Strategy | Comparison algorithm | Strategy | "Use lenient matching" |
| Typing Attempt | Single input submission | Attempt | "Record attempt" |
| Match Result | Comparison outcome | Match | "Match was successful" |
| Typing Speed | Characters per minute | CPM, Speed | "180 CPM typing speed" |
| Accuracy | Success rate (%) | Success rate | "95% accuracy" |
| Completion Time | Duration to complete chunk | Duration | "2.5 seconds" |

---

**Status**: Draft
**Last Updated**: 2025-12-13
**Context**: Touch Typing Progression (Spec 003)

