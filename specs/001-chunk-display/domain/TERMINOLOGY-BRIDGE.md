# Terminology Bridge - Implementation vs Ubiquitous Language

## Context

Our **implementation** (code) uses "Chunk" terminology, but our **Ubiquitous Language** (aligned with the broader Archetype project) uses "Segment" terminology.

This document clarifies the mapping and provides guidance for future development.

---

## Why the Mismatch?

1. **Implementation came first** - We built the domain model using "Chunk" before reviewing the project-wide UL
2. **Project-wide UL uses "Segment"** - The broader Archetype vision defines "Segment" as the standard term
3. **Refactoring cost** - 112 tests and 15 files currently use "Chunk" terminology
4. **Technical debt** - This is acceptable short-term, but should be addressed before UI implementation

---

## Current Mapping

| Code (Implementation) | UL (User-Facing) | Project-Wide Term |
|----------------------|------------------|-------------------|
| `Chunk` | TextSegment | ✅ Segment |
| `ChunkSequence` | Segment Sequence | ✅ Sequence |
| `ChunkingStrategy` | Segmentation Strategy | ✅ Strategy |
| `ChunkingService` | Segmentation Service | ✅ Service |
| `ChunkingType` | Segmentation Type | ✅ Type |
| `ChunkTiming` | Segment Timing | ✅ Timing |
| `ChunkProgression` | Segment Progression | ✅ Progression |
| Text Source | SourceText | ✅ SourceText |

---

## Usage Guidelines

### ✅ Use "Segment" in:
- User-facing UI labels
- User documentation
- API documentation
- Comments in code
- Discussion with stakeholders
- Git commit messages (when user-facing)
- Spec documents

### ✅ Use "Chunk" in:
- Class names (for now)
- Method names (for now)
- Test file names
- Internal variable names
- Technical implementation details

---

## Examples

### ❌ Bad (inconsistent)
```typescript
// Comment says "segment" but code says "chunk" - confusing
// Get the current segment
const chunk = sequence.getChunk(0);
```

### ✅ Good (acknowledges mapping)
```typescript
// Get the current text segment (implemented as Chunk)
const chunk = sequence.getChunk(0);
```

### ✅ Better (future state)
```typescript
// Get the current text segment
const segment = sequence.getSegment(0);
```

---

## UI Implementation Guidance

When building UI components, **always use "Segment" terminology**:

```typescript
// ❌ Don't expose implementation detail
<div className="chunk-display">{chunk.content}</div>

// ✅ Use UL term
<div className="segment-display">{segment.content}</div>
```

```typescript
// ❌ Don't use in user-facing strings
addCommand({
  id: 'start-chunk-playback',
  name: 'Start chunk playback',
});

// ✅ Use UL term
addCommand({
  id: 'start-segment-playback',
  name: 'Start segment playback',
});
```

---

## Refactoring Plan

### Phase 1: Current State ✅
- Implementation uses "Chunk"
- Documentation updated to "Segment"
- Mapping documented (this file)

### Phase 2: UI Layer (Next)
- UI uses "Segment" terminology exclusively
- CSS classes use "segment-*" naming
- User-facing strings use "Segment"

### Phase 3: Gradual Refactor (Future)
When time permits, refactor implementation:

1. Create new `Segment` class
2. Add deprecation notices to `Chunk`
3. Update tests incrementally
4. Remove `Chunk` when all references updated

**OR** accept that "Chunk" is the technical term and "Segment" is the business term. Many codebases maintain this distinction.

---

## Decision: Technical Term vs Business Term

**Option A: Refactor Everything**
- Pros: Perfect alignment
- Cons: High refactoring cost, test churn, potential bugs

**Option B: Keep Distinction**
- Pros: Zero refactoring cost, common pattern in DDD
- Cons: Requires discipline to maintain mapping

**Recommendation**: **Option B** for now
- Document the mapping clearly (this file)
- Enforce "Segment" in UI/docs
- Consider refactor only if it causes real confusion

---

## Examples from Other Projects

Many projects maintain technical vs business term distinction:

- **Business**: "Order" / **Technical**: "PurchaseTransaction"
- **Business**: "Customer" / **Technical**: "UserAccount"
- **Business**: "Product" / **Technical**: "InventoryItem"

Similarly:
- **Business**: "TextSegment" / **Technical**: "Chunk"

This is **acceptable** as long as:
1. The mapping is documented (✅ this file)
2. UI never exposes technical terms (enforce in code review)
3. Comments bridge the gap when needed

---

## Code Review Checklist

When reviewing code, check:

- [ ] UI labels use "segment", not "chunk"
- [ ] User documentation uses "segment"
- [ ] CSS classes use "segment-*" prefix
- [ ] Command names use "segment"
- [ ] Settings labels use "segment"
- [ ] Error messages use "segment"
- [ ] Comments clarify "segment (Chunk)" when helpful
- [ ] Internal implementation can use "chunk"

---

## Project-Wide Alignment

Our terminology now aligns with the broader Archetype UL:

| Concept | Speed Reading (this spec) | Touch Typing | Language Learning |
|---------|--------------------------|--------------|-------------------|
| Input | SourceText | SourceText | SourceAudio |
| Unit | TextSegment | TextSegment | AudioSegment |
| Constraint | Display Window + Timing | ? | ? |
| Session | Reading practice | Typing practice | Speech practice |
| Mode | Speed reading | Touch typing | Pronunciation |

This consistency will make the codebase more coherent as features are added.

---

## Summary

✅ **Documentation** uses project-wide UL (Segment)
✅ **Implementation** uses technical term (Chunk)
✅ **Mapping** is documented and understood
✅ **UI** will use UL exclusively (enforced in reviews)

This approach balances pragmatism (don't rewrite working code) with consistency (use correct terms where it matters).

