# Technical Debt - Smart Boundary Detection

**Status**: Documented for future consideration (Not currently planned for implementation)

**Note**: This is a design exploration, NOT a committed feature. The current behavior (character-exact chunking) is the intended behavior for now.

## Issue

Character-based chunking currently splits text at arbitrary boundaries, which can break hyphenated words mid-word, creating unreadable segments for speed reading.

## Current Behavior (Problematic)

```typescript
Text: "A well-known solution"
chunkByCharacters(text, 10)

Result:
- "A well-kno"  // ❌ Split mid-word
- "wn solutio"  // ❌ Unreadable
- "n"           // ❌ Fragment
```

## Desired Behavior

Smart boundary detection should:

1. **Lookahead** when approaching chunk boundary
2. **Detect hyphenated words** (using patterns like `\w+-\w+`)
3. **Adjust boundary** to either:
   - Break AT the hyphen (natural pause: `"state-"`, `"of-the-"`, `"art"`)
   - Or keep short hyphenated word intact in next chunk

```typescript
// Desired for: "state-of-the-art" with size 6
Result:
- "state-"  // ✅ Natural break
- "of-"     // ✅ Complete component
- "the-"    // ✅ Complete component  
- "art"     // ✅ Final component
```

## Why Defer?

1. **Word-based chunking works perfectly** (most common use case)
2. Character-based is advanced/niche
3. Complex algorithm with many edge cases
4. Better to get user feedback on core feature first
5. May not be needed if users prefer word-based
6. **Current behavior is acceptable** - character-exact is predictable

## Current Behavior is CORRECT

The existing tests in `ChunkingService.test.ts` document the CORRECT current behavior:
- Character-based chunking is character-exact (no smart boundaries)
- Word-based chunking handles hyphens naturally (splits on whitespace)

**This is the intended behavior.** No tests are failing. No behavior needs fixing.

## Implementation Strategy (When Ready)

### Algorithm Outline

```typescript
function chunkByCharactersWithSmartBoundaries(
  text: string, 
  targetSize: number
): ChunkSequence {
  const chunks: Chunk[] = [];
  let pos = 0;
  
  while (pos < text.length) {
    // Start with target size
    let endPos = Math.min(pos + targetSize, text.length);
    
    // If not at end, check for better boundary
    if (endPos < text.length) {
      endPos = findSmartBoundary(text, pos, endPos, targetSize);
    }
    
    const content = text.slice(pos, endPos);
    chunks.push(new Chunk(content, chunks.length));
    pos = endPos;
  }
  
  return new ChunkSequence(chunks);
}
```

### Boundary Detection Logic

```typescript
function findSmartBoundary(
  text: string,
  start: number,
  proposedEnd: number,
  targetSize: number
): number {
  // Lookahead window (5 chars before/after proposed boundary)
  const lookbehind = text.slice(Math.max(0, proposedEnd - 5), proposedEnd);
  const lookahead = text.slice(proposedEnd, Math.min(text.length, proposedEnd + 5));
  
  // Check if we're splitting a hyphenated word
  const pattern = /(\w+)-(\w+)/;
  const window = lookbehind + lookahead;
  const match = pattern.exec(window);
  
  if (match) {
    // We're in a hyphenated word
    const hyphenPos = match.index + match[1].length;
    const absoluteHyphenPos = proposedEnd - 5 + hyphenPos;
    
    // Option 1: Break right after the hyphen
    if (Math.abs(absoluteHyphenPos + 1 - proposedEnd) <= TOLERANCE) {
      return absoluteHyphenPos + 1;
    }
    
    // Option 2: If word is short, keep it in next chunk
    const wordLength = match[0].length;
    if (wordLength <= targetSize * 0.5) {
      // Move boundary before the hyphenated word
      return findStartOfWord(text, proposedEnd);
    }
  }
  
  // No adjustment needed
  return proposedEnd;
}
```

### Configuration

Add configurable behavior:

```typescript
interface SmartBoundaryOptions {
  enabled: boolean;
  tolerance: number;  // How many chars we can deviate from target
  preferHyphenBreaks: boolean;
  keepShortWordsIntact: boolean;
}
```

### Edge Cases to Handle

1. **Multiple hyphens**: `"state-of-the-art"` → break at each?
2. **Em-dash without spaces**: `"Hello—world"` → treat like hyphen?
3. **Tolerance**: How far from target size is acceptable?
4. **Minimum chunk size**: Don't create too-small chunks
5. **Consecutive hyphens**: Rare but possible
6. **Non-word hyphens**: `"3-5 items"` vs `"well-known"`

## Priority

**Priority: P3 (Nice to Have)**

Should implement:
- After core MVP is working
- After collecting user feedback
- If users actually use character-based chunking
- If users report readability issues

## Related Files

- `src/domain/chunking/ChunkingService.ts` - Current implementation (character-exact)
- `src/domain/chunking/ChunkingService.test.ts` - Tests documenting CURRENT behavior
- `specs/001-chunk-display/domain/ubiquitous-language.md` - Segmentation Strategy

**No test files document smart boundaries** - this is deliberate. Tests are SSOT for current behavior only.

## Success Criteria

✅ Character-based chunks are readable
✅ Hyphenated words not split mid-word
✅ Chunk sizes remain close to target (±20%)
✅ All existing tests still pass
✅ Performance impact < 10% for large texts

## Estimated Effort

**~4-6 hours** including:
- Algorithm implementation (2-3h)
- Edge case handling (1-2h)
- Testing and refinement (1h)

## Alternative: Don't Fix (Current Decision)

**Current decision:**
- Document that character-based chunking is "character-exact" ✅
- Recommend word-based chunking for best readability ✅
- Only implement smart boundaries if users specifically request it ✅

**This is the pragmatic choice** given word-based works well. The current behavior is correct and intentional.

