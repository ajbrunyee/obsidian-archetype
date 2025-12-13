# Domain Documentation - Chunk Display

This directory contains the domain model documentation for Spec 001: Chunk Display.

## 📚 Documentation Structure

### [ubiquitous-language.md](./ubiquitous-language.md)
**Purpose**: Defines the shared vocabulary used across the entire feature.

**Key Sections**:
- Core Concepts (Chunk, Text Source, Display Window, etc.)
- Domain Relationships diagram
- Business Rules
- Anti-patterns to avoid

**When to read**: 
- Before starting implementation
- When naming classes, methods, or variables
- During code reviews
- When onboarding to the project

---

### [model.md](./model.md)
**Purpose**: Describes the technical domain model with entities, value objects, and services.

**Key Sections**:
- Model Overview (UML-style diagram)
- Entities (ChunkProgression)
- Value Objects (Chunk, ChunkSequence, ChunkingStrategy, etc.)
- Domain Services (ChunkingService, TimingService)
- Enumerations
- Invariants & Constraints

**When to read**:
- Before implementing domain classes
- When designing class relationships
- When understanding business rules enforcement
- During architectural reviews

---

### [test-plan.md](./test-plan.md)
**Purpose**: Comprehensive testing strategy for the domain layer.

**Key Sections**:
- Test Structure (file organization)
- Critical Test Cases (organized by concept)
- Test Data (sample texts and configurations)
- Property-Based Testing considerations
- Performance Targets
- Coverage Goals

**When to read**:
- Before writing tests
- During TDD cycles
- When reviewing test coverage
- When troubleshooting test failures

---

## 🔄 Development Workflow

### 1. **Understand the Domain**
```
Read: ubiquitous-language.md → model.md
Goal: Understand concepts, relationships, and constraints
```

### 2. **Plan Implementation**
```
Read: model.md → test-plan.md
Goal: Identify what to build and how to test it
```

### 3. **Implement with TDD**
```
Write failing test → Implement domain class → Make test pass → Refactor
Reference: test-plan.md for test cases
Reference: model.md for invariants and behavior
```

### 4. **Verify Naming**
```
Review: ubiquitous-language.md
Goal: Ensure code uses correct domain terms
```

---

## 🎯 Implementation Order

Based on dependencies, implement in this order:

### Phase 1: Core Value Objects
1. **ReadingSpeed** (no dependencies)
2. **Chunk** (no dependencies)
3. **ChunkSequence** (depends on Chunk)
4. **ChunkingStrategy** (produces ChunkSequence)

### Phase 2: Services
5. **ChunkingService** (uses ChunkingStrategy)
6. **ChunkTiming** (uses ReadingSpeed and Chunk)
7. **TimingService** (uses ChunkTiming)

### Phase 3: Entity
8. **ChunkProgression** (uses ChunkSequence, ChunkTiming)

---

## 📐 Design Principles

### Immutability
Value objects are immutable. Benefits:
- Thread safety (if needed later)
- Predictable behavior
- Easy to test
- No defensive copying

### Pure Functions
Domain logic should be pure wherever possible:
- Chunking algorithms
- Duration calculations
- Sequence navigation

### Domain Isolation
Domain layer has **zero dependencies** on:
- Obsidian API
- UI frameworks
- Infrastructure (timers, storage, etc.)

This makes the domain:
- Highly testable
- Reusable
- Easy to understand

---

## 🧪 Testing Strategy

### Unit Tests
- Test each class in isolation
- Mock dependencies (if any)
- 100% coverage goal for domain logic

### Test Data
See `test-plan.md` for predefined test data covering:
- Normal cases
- Edge cases (empty, single item, very large)
- Special characters
- Whitespace variations

### Running Tests
```bash
# All domain tests
npm test -- src/domain

# Watch mode
npm test -- --watch src/domain

# Specific test file
npm test -- Chunk.test.ts
```

---

## 🔗 Integration with UI Layer

The domain model will be consumed by the UI layer:

```
Domain Layer (src/domain/)
    ↓ provides
UI Layer (src/views/, src/components/)
    ↓ uses
Obsidian Plugin (ArchetypePlugin.ts)
```

**Key Integration Points**:
1. User selects text → Convert to Chunks via ChunkingService
2. User starts playback → ChunkProgression manages state
3. Timer fires → ChunkProgression advances to next chunk
4. UI displays → Current chunk content in Display Window

The domain layer is **unaware** of the UI layer. The UI layer **depends on** the domain layer.

---

## 📊 Relationship to Spec

This domain model implements the core logic for:
- [Spec 001](../spec.md) - Chunk Display and progression
- Future specs will extend this domain model

The spec describes **what** the user experiences.
The domain model describes **how** the system works internally.

---

## 🚀 Next Steps

1. ✅ Read and understand ubiquitous-language.md
2. ✅ Read model.md to understand structure
3. ✅ Read test-plan.md to understand testing approach
4. ⬜ Implement Phase 1: Core Value Objects with TDD
5. ⬜ Implement Phase 2: Services with TDD
6. ⬜ Implement Phase 3: Entity with TDD
7. ⬜ Verify 100% test coverage
8. ⬜ Create UI layer integration plan

---

## 📝 Maintenance

When updating domain logic:
1. Update relevant documentation first (ubiquitous-language.md or model.md)
2. Update test-plan.md if new test cases are needed
3. Implement changes with tests
4. Update this README if structure changes

Documentation should always reflect the current implementation.

