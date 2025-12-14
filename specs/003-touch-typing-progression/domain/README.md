# Domain Documentation - Touch Typing Progression

This directory contains the domain model documentation for Spec 003: Touch Typing Progression.

---

## 📚 Documentation Structure

### [ubiquitous-language.md](./ubiquitous-language.md)
**Purpose**: Defines shared vocabulary for touch typing concepts.

**Key Terms**:
- Typing Session, Target Text, User Input
- Match Strategy (Lenient/Strict/Fuzzy)
- Typing Attempt, Match Result
- Typing Speed, Accuracy
- Session states (Idle/Awaiting/Active/Completed)

**When to read**: Before implementing or discussing typing features.

---

### [model.md](./model.md)
**Purpose**: Technical domain model with entities, value objects, and services.

**Key Components**:
- **TypingSession** (Entity) - Session management and state
- **MatchStrategy** (Strategy Pattern) - Comparison algorithms
- **TypingAttempt** (Value Object) - Attempt tracking
- **TypingStatistics** (Value Object) - Metrics calculation
- **TypingMatch** (Value Object) - Match result

**When to read**: Before implementing domain classes.

---

## 🔄 Development Workflow

### 1. Understand the Domain
```
Read: ubiquitous-language.md → model.md
Goal: Understand typing concepts and relationships
```

### 2. Plan Implementation
```
Read: model.md (State Machine, Aggregates sections)
Goal: Understand state transitions and consistency rules
```

### 3. Implement with TDD
```
Write failing test → Implement domain class → Make test pass → Refactor
Reference: model.md for behavior and invariants
```

### 4. Verify Naming
```
Review: ubiquitous-language.md
Goal: Ensure code uses correct domain terms
```

---

## 🎯 Implementation Order

Based on dependencies:

### Phase 1: Match Strategies (No Dependencies)
1. **MatchStrategy** interface
2. **LenientMatchStrategy** implementation
3. **StrictMatchStrategy** implementation
4. **FuzzyMatchStrategy** implementation (Levenshtein algorithm)

**Tests**: Verify each strategy with various inputs (case, whitespace, typos).

---

### Phase 2: Value Objects
5. **TypingMatch** (depends on MatchStrategy)
6. **TypingAttempt** (depends on TypingMatch)
7. **TypingStatistics** (depends on TypingAttempt[])

**Tests**: Verify immutability, equality, and validation.

---

### Phase 3: Services
8. **TypingComparisonService** (uses MatchStrategy)
9. **TypingStatisticsService** (calculates from TypingAttempt[])

**Tests**: Verify correct application of strategies and calculations.

---

### Phase 4: Entity
10. **TypingSession** (uses all above)

**Tests**: 
- State machine transitions
- Attempt tracking
- Statistics calculation
- Invariants enforcement

---

## 📐 Design Principles

### Strategy Pattern
Match strategies are interchangeable implementations:
```typescript
interface MatchStrategy {
  matches(input: string, target: string): boolean;
}
```

**Benefits**:
- Easy to add new strategies
- Can change strategy at runtime
- Each strategy is independently testable

---

### Immutable Value Objects
`TypingMatch`, `TypingAttempt`, `TypingStatistics` are immutable.

**Benefits**:
- Thread safety (if needed later)
- Predictable behavior
- No defensive copying
- Can be safely shared

---

### Domain Isolation
Domain layer has **zero dependencies** on:
- Obsidian API
- UI frameworks
- Infrastructure (timers, storage)

**Benefits**:
- Highly testable (no mocks needed)
- Reusable (could port to web app)
- Easy to reason about

---

### Integration with Spec 001

**Reuses**:
- `Chunk` (unchanged)
- `ChunkSequence` (unchanged)
- `ChunkingService` (unchanged)

**Extends**:
- `ProgressionState` - Add `AWAITING_INPUT` state
- Create new `TypingProgression` alongside `ChunkProgression`

**Isolation**:
- Typing domain is separate from reading domain
- They share basic concepts (Chunk) but are otherwise independent

---

## 🧪 Testing Strategy

### Unit Tests

**MatchStrategy implementations**:
```typescript
describe('LenientMatchStrategy', () => {
  it('should match case-insensitively', () => {
    const strategy = new LenientMatchStrategy();
    expect(strategy.matches('Hello', 'hello')).toBe(true);
  });
  
  it('should trim whitespace', () => {
    const strategy = new LenientMatchStrategy();
    expect(strategy.matches('  Hello  ', 'Hello')).toBe(true);
  });
});
```

**TypingSession state machine**:
```typescript
describe('TypingSession', () => {
  it('should start in IDLE state', () => {
    const session = new TypingSession(chunks, strategy);
    expect(session.state).toBe(TypingSessionState.IDLE);
  });
  
  it('should transition to AWAITING_INPUT on start', () => {
    const session = new TypingSession(chunks, strategy);
    session.start();
    expect(session.state).toBe(TypingSessionState.AWAITING_INPUT);
  });
  
  it('should advance on successful match', () => {
    const session = new TypingSession(chunks, strategy);
    session.start();
    const match = session.submitInput('correct text');
    expect(match.isMatch).toBe(true);
    expect(session.currentIndex).toBe(1);
  });
});
```

---

### Property-Based Tests

**Invariants** (should always hold):
```typescript
describe('TypingSession invariants', () => {
  it('current index never exceeds chunk count', () => {
    // Property: 0 ≤ currentIndex ≤ chunkCount
    // Test with random valid inputs
  });
  
  it('accuracy is always between 0 and 1', () => {
    // Property: 0 ≤ accuracy ≤ 1
    // Test with various attempt patterns
  });
});
```

---

### Integration Tests

**With Spec 001 components**:
```typescript
describe('Typing with chunking', () => {
  it('should work with word-based chunking', () => {
    const strategy = ChunkingStrategy.wordBased(3);
    const sequence = ChunkingService.chunk(text, strategy);
    const typingSession = new TypingSession(sequence, new LenientMatchStrategy());
    // Test full flow
  });
});
```

---

## 🔗 Integration with UI Layer

```
Domain Layer (src/domain/typing/)
    ↓ provides
UI Layer (src/views/TypingPlayer.ts)
    ↓ uses
Obsidian Plugin (ArchetypePlugin.ts)
```

**Key Integration Points**:
1. User starts typing mode → Create `TypingSession`
2. User types in input field → Call `session.submitInput()`
3. Session returns `TypingMatch` → UI shows feedback
4. Session completes → UI shows `TypingStatistics`

The domain layer is **unaware** of the UI. UI layer **depends on** domain.

---

## 📊 Relationship to Spec

This domain model implements the core logic for:
- [Spec 003](../spec.md) - Touch Typing Progression
- Extends [Spec 001](../../001-chunk-display/spec.md) - Reuses chunks

The spec describes **what** the user experiences.
The domain model describes **how** the system works internally.

---

## 🚀 Next Steps

1. ⬜ Implement Phase 1: Match strategies with tests
2. ⬜ Implement Phase 2: Value objects with tests
3. ⬜ Implement Phase 3: Services with tests
4. ⬜ Implement Phase 4: TypingSession with tests
5. ⬜ Verify 100% test coverage
6. ⬜ Create UI layer (TypingPlayer component)
7. ⬜ Integrate with ArchetypePlugin

---

## 📝 Maintenance

When updating typing logic:
1. Update `ubiquitous-language.md` if terms change
2. Update `model.md` if structure changes
3. Update tests to match new behavior
4. Ensure invariants still hold
5. Update this README if workflow changes

Documentation should always reflect the current implementation.

---

## Key Differences from Spec 001

| Aspect | Spec 001 (Reading) | Spec 003 (Typing) |
|--------|-------------------|-------------------|
| Progression | Automatic (timer) | Manual (user input) |
| State | IDLE → PLAYING → COMPLETED | IDLE → AWAITING → ACTIVE → COMPLETED |
| Metrics | Reading speed (WPM) | Typing speed (CPM), Accuracy |
| User Action | Passive (watching) | Active (typing) |
| Feedback | Visual (chunk display) | Interactive (match result) |

Both share the same chunk concept but have different progression models.

---

**Status**: Ready for implementation
**Domain Complexity**: Medium (state machine + strategies + statistics)
**Estimated Implementation Time**: 3-4 days (including tests)

