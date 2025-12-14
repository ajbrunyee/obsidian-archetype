# Touch Typing Progression - Domain Model

## Overview

This document describes the domain model for touch typing progression, where users advance through text chunks by typing them rather than automatic timer progression.

---

## Core Concepts

### 1. **TypingSession** (Entity)
Represents an active typing-based reading session with state and progression tracking.

**Responsibilities**:
- Track current position in chunk sequence
- Record typing attempts and accuracy
- Calculate typing speed (WPM/CPM)
- Manage session statistics

**State**:
```typescript
enum TypingSessionState {
  IDLE = 'idle',           // Not started
  ACTIVE = 'active',       // User typing
  AWAITING_INPUT = 'awaiting_input', // Waiting for user to start typing
  COMPLETED = 'completed'  // All chunks typed
}
```

**Invariants**:
- Session must have at least one chunk
- Cannot advance without successful match
- Statistics are read-only during active session
- Current index cannot exceed chunk count

---

### 2. **TypingMatch** (Value Object)
Represents the result of comparing user input to target text.

**Properties**:
```typescript
interface TypingMatch {
  readonly input: string;           // What user typed
  readonly target: string;          // What they should have typed
  readonly isMatch: boolean;        // Whether it matches (based on strategy)
  readonly matchStrategy: MatchStrategy;
  readonly timestamp: Date;
}
```

**Immutability**: Once created, a match result cannot change.

---

### 3. **MatchStrategy** (Strategy Pattern)
Defines how user input is compared to target text.

**Types**:
```typescript
enum MatchStrategyType {
  LENIENT = 'lenient',   // Case-insensitive, trim whitespace
  STRICT = 'strict',     // Exact match required
  FUZZY = 'fuzzy'        // Allow minor typos (Levenshtein ≤ 2)
}
```

**Strategies**:

**LenientMatchStrategy**:
```typescript
class LenientMatchStrategy implements MatchStrategy {
  matches(input: string, target: string): boolean {
    return input.trim().toLowerCase() === target.trim().toLowerCase();
  }
}
```

**StrictMatchStrategy**:
```typescript
class StrictMatchStrategy implements MatchStrategy {
  matches(input: string, target: string): boolean {
    return input === target;
  }
}
```

**FuzzyMatchStrategy**:
```typescript
class FuzzyMatchStrategy implements MatchStrategy {
  private maxDistance: number = 2;
  
  matches(input: string, target: string): boolean {
    const distance = this.levenshteinDistance(
      input.trim().toLowerCase(),
      target.trim().toLowerCase()
    );
    return distance <= this.maxDistance;
  }
  
  private levenshteinDistance(a: string, b: string): number {
    // Algorithm implementation
  }
}
```

---

### 4. **TypingAttempt** (Value Object)
Records a single typing attempt for a chunk.

**Properties**:
```typescript
interface TypingAttempt {
  readonly chunkIndex: number;     // Which chunk was typed
  readonly input: string;          // User's input
  readonly target: string;         // Target text
  readonly isCorrect: boolean;     // Match result
  readonly attemptNumber: number;  // 1st attempt, 2nd attempt, etc.
  readonly duration: number;       // Milliseconds to complete
  readonly timestamp: Date;
}
```

**Purpose**: Track all attempts (including failures) for statistics.

---

### 5. **TypingStatistics** (Value Object)
Aggregated metrics for a typing session.

**Properties**:
```typescript
interface TypingStatistics {
  readonly totalChunks: number;
  readonly completedChunks: number;
  readonly totalAttempts: number;        // Including failed attempts
  readonly successfulAttempts: number;
  readonly accuracy: number;             // 0.0-1.0
  readonly averageChunkTime: number;     // Milliseconds per chunk
  readonly typingSpeed: number;          // Characters per minute
  readonly errorCount: number;           // Failed attempts
  readonly sessionDuration: number;      // Total time in milliseconds
}
```

**Calculations**:
```typescript
accuracy = successfulAttempts / totalAttempts
typingSpeed = totalCharactersTyped / (sessionDuration / 60000)
```

---

## Model Relationships

```
TypingSession (Entity)
  ├─ has: ChunkSequence (from Spec 001)
  ├─ uses: MatchStrategy (lenient/strict/fuzzy)
  ├─ tracks: TypingAttempt[] (history)
  ├─ calculates: TypingStatistics (derived)
  └─ produces: TypingMatch (per comparison)

MatchStrategy (Interface)
  ├─ LenientMatchStrategy
  ├─ StrictMatchStrategy
  └─ FuzzyMatchStrategy

TypingAttempt (Value Object)
  └─ contains: TypingMatch result

TypingStatistics (Value Object)
  └─ derived from: TypingAttempt[]
```

---

## Domain Services

### TypingComparisonService
Compares user input to target using configured strategy.

```typescript
class TypingComparisonService {
  compare(
    input: string,
    target: string,
    strategy: MatchStrategy
  ): TypingMatch {
    return new TypingMatch(
      input,
      target,
      strategy.matches(input, target),
      strategy,
      new Date()
    );
  }
}
```

### TypingStatisticsService
Calculates session statistics from attempt history.

```typescript
class TypingStatisticsService {
  calculate(attempts: TypingAttempt[]): TypingStatistics {
    // Aggregate metrics from attempts
  }
}
```

---

## Aggregates

### TypingSession Aggregate
Root: `TypingSession`
Contains: `ChunkSequence`, `TypingAttempt[]`, `MatchStrategy`

**Boundaries**:
- Session owns all attempts
- Chunk sequence is immutable (from reading service)
- Match strategy can be changed during session (configuration)
- Statistics are calculated on-demand (not persisted)

**Consistency Rules**:
- All attempts must reference valid chunk indices
- Attempts must be chronologically ordered
- Cannot complete session with incomplete chunks
- Session state transitions must be valid

---

## State Machine

```
[IDLE]
  ↓ start()
[AWAITING_INPUT]
  ↓ type(input)
[ACTIVE]
  ↓ match successful
[AWAITING_INPUT] (next chunk)
  ↓ all chunks complete
[COMPLETED]
```

**State Transitions**:
```typescript
class TypingSession {
  start(): void {
    if (this.state !== TypingSessionState.IDLE) {
      throw new Error('Session already started');
    }
    this.state = TypingSessionState.AWAITING_INPUT;
  }
  
  submitInput(input: string): TypingMatch {
    if (this.state !== TypingSessionState.AWAITING_INPUT && 
        this.state !== TypingSessionState.ACTIVE) {
      throw new Error('Cannot submit input in current state');
    }
    
    this.state = TypingSessionState.ACTIVE;
    
    const match = this.compareInput(input);
    this.recordAttempt(match);
    
    if (match.isMatch) {
      this.advanceToNextChunk();
    }
    
    return match;
  }
  
  private advanceToNextChunk(): void {
    this.currentIndex++;
    
    if (this.currentIndex >= this.chunks.length) {
      this.state = TypingSessionState.COMPLETED;
    } else {
      this.state = TypingSessionState.AWAITING_INPUT;
    }
  }
}
```

---

## Invariants & Business Rules

### Invariants (Always True)

1. **Session must have chunks**
   ```typescript
   this.chunks.length > 0
   ```

2. **Current index within bounds**
   ```typescript
   this.currentIndex >= 0 && this.currentIndex <= this.chunks.length
   ```

3. **Attempts must be for current or previous chunks**
   ```typescript
   attempt.chunkIndex <= this.currentIndex
   ```

4. **Accuracy is between 0 and 1**
   ```typescript
   this.statistics.accuracy >= 0 && this.statistics.accuracy <= 1
   ```

5. **Completed chunks ≤ total chunks**
   ```typescript
   this.statistics.completedChunks <= this.statistics.totalChunks
   ```

### Business Rules

1. **Match Required for Progression**
   - User must successfully match target text before advancing
   - Failed attempts are recorded but don't block retry

2. **Attempt Tracking**
   - Every input submission creates an attempt record
   - Includes successes and failures
   - Ordered chronologically

3. **Statistics Calculation**
   - Derived from attempt history (not stored separately)
   - Recalculated on demand
   - Immutable once session completes

4. **Match Strategy Consistency**
   - Strategy can be changed mid-session
   - Previous attempts retain their original strategy
   - New comparisons use current strategy

---

## Integration with Existing Domain

### Reuses from Spec 001
- **Chunk** - Basic text unit (no changes needed)
- **ChunkSequence** - Ordered collection of chunks
- **ChunkingService** - Creates chunks from text

### Extends Spec 001
- **ChunkProgression** - New subclass: `TypingProgression`
- **ProgressionState** - Add `AWAITING_INPUT` state

### New Domain Elements
- **TypingSession** - Session management
- **MatchStrategy** - Comparison strategies
- **TypingAttempt** - Attempt tracking
- **TypingStatistics** - Metrics calculation

---

## Example Usage

```typescript
// Create chunks (reuse existing service)
const strategy = ChunkingStrategy.wordBased(3);
const sequence = ChunkingService.chunk(text, strategy);

// Create typing session
const matchStrategy = new LenientMatchStrategy();
const session = new TypingSession(sequence, matchStrategy);

// Start session
session.start();

// User types
const match = session.submitInput("hello world");
if (match.isMatch) {
  console.log("Correct! Moving to next chunk");
} else {
  console.log("Try again");
}

// Get statistics
const stats = session.getStatistics();
console.log(`Accuracy: ${stats.accuracy * 100}%`);
console.log(`Speed: ${stats.typingSpeed} CPM`);
```

---

## Testing Strategy

### Unit Tests

**TypingSession**:
- Start/stop session
- Submit correct input → advances
- Submit incorrect input → stays on chunk
- Multiple attempts tracked correctly
- State transitions valid

**MatchStrategy**:
- Lenient: case-insensitive, whitespace trimmed
- Strict: exact match required
- Fuzzy: typos within threshold allowed

**TypingStatistics**:
- Accuracy calculation correct
- Typing speed calculation correct
- Edge cases (zero attempts, all failures)

### Property-Based Tests
- Any valid input sequence eventually completes
- Statistics are always consistent with attempts
- State machine never reaches invalid state

---

## Performance Considerations

### Real-time Comparison
- **Target**: <50ms latency for typing feedback
- **Strategy**: Lightweight string comparisons
- **Optimization**: No expensive operations in hot path

### Statistics Calculation
- **Strategy**: Calculate on-demand (not every keystroke)
- **Caching**: Cache statistics until new attempt added
- **Complexity**: O(n) where n = number of attempts

### Memory Usage
- **Attempts**: Store all attempts (limited by chunk count)
- **Typical session**: 100 chunks × 1-3 attempts = ~300 attempts
- **Memory**: ~30KB per session (negligible)

---

## Future Enhancements

### Spaced Repetition (Future)
- Track difficult chunks (multiple failures)
- Re-present challenging chunks later
- Adaptive difficulty adjustment

### Typing Analytics (Future)
- Per-character timing (keystroke dynamics)
- Common error patterns
- Improvement tracking over time

### Collaborative Features (Future)
- Share typing challenges
- Leaderboards (opt-in)
- Typing competitions

---

**Status**: Draft
**Next Steps**: 
1. Implement core value objects (MatchStrategy, TypingMatch, TypingAttempt)
2. Implement TypingSession entity
3. Add unit tests
4. Integrate with UI layer

