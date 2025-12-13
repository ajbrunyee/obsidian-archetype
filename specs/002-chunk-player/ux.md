# Spec 002: Chunk Player - UX Details

## User Experience Goals

1. **Smooth, predictable rhythm**: Chunks advance at exact intervals, like a metronome
2. **Immediate start**: First chunk displays instantly (no "get ready" delay)
3. **Clean text**: Markdown formatting stripped transparently (user doesn't think about it)
4. **Natural completion**: Session ends gracefully when all chunks displayed

---

## User Flows

### Flow 1: Processing Text Selection

**Behind the scenes** (user doesn't see this):
```
User selects: "**Hello world!** Check [[this link]]"
      ↓
createFlashes() processes:
      ↓
Strip markdown: "Hello world! Check this link"
      ↓
Split into words: ["Hello", "world!", "Check", "this", "link"]
      ↓
Create chunks (wordcount=1): [Flash("Hello"), Flash("world!"), ...]
      ↓
Return to display
```

**Timing**: All processing happens in <100ms (imperceptible)

**What the user experiences**:
- Selects text with markdown formatting
- Invokes command
- Overlay opens with clean text
- **User never thinks about markdown stripping** (transparent process)

**Why transparent?**
- User's intent: "I want to read this text"
- User doesn't care about implementation details
- If user notices, we've failed (should be seamless)

---

### Flow 2: Rhythm Development (Auto Mode)

**Timeline** (600 WPM, 1 word/chunk, 10 words selected):

```
T=0ms:     [Overlay opens] → "Hello" displayed
T=100ms:   "world" displayed
T=200ms:   "this" displayed
T=300ms:   "is" displayed
T=400ms:   "a" displayed
T=500ms:   "test" displayed
T=600ms:   "of" displayed
T=700ms:   "the" displayed
T=800ms:   "reading" displayed
T=900ms:   "system" displayed
T=1000ms:  [Overlay closes]
```

**What the user sees**:
- Text appears in place (no animation)
- Each word visible for exactly 100ms
- Consistent, metronomic pace
- No variation in timing

**What the user feels**:
- **First 3-5 chunks**: "Am I keeping up?"
- **Chunks 6-20**: "I'm getting the rhythm"
- **Chunks 21+**: "I'm in flow state"
- **Throughout**: "I don't have to do anything"

**Psychological stages**:
1. **Adaptation** (0-10 seconds): Brain adjusts to speed
2. **Synchronization** (10-30 seconds): Internal timing matches display
3. **Flow** (30+ seconds): Conscious thought disappears, pure reading

---

### Flow 3: Multi-Word Chunks

**Scenario**: User sets wordcount=3 (3 words per chunk)

**Timeline** (600 WPM, 3 word/chunk, 9 words selected):

```
T=0ms:     "Hello world this"
T=300ms:   "is a test"
T=600ms:   "of reading"
T=900ms:   [End]
```

**Calculation**:
```
intervalMs = (60,000 ms/min × 3 words/chunk) / 600 words/min
           = 180,000 / 600
           = 300ms per chunk
```

**What the user experiences**:
- Phrases instead of single words
- More natural language grouping
- Easier to follow (less staccato)
- Still faster than normal reading

**Why offer multi-word chunks?**
- Some users prefer phrase-based reading
- Matches natural language parsing (phrases are semantic units)
- Reduces visual "flicker" of rapid single words
- Still faster than reading full sentences

---

## Interaction Details

### Markdown Stripping Behavior

**User-visible effects**:

| Markdown Input | Displayed Output | User Expectation |
|----------------|------------------|------------------|
| `**bold**` | `bold` | ✅ Correct (formatting removed) |
| `*italic*` | `italic` | ✅ Correct |
| `~~strike~~` | `strike` | ✅ Correct |
| `` `code` `` | `code` | ✅ Correct |
| `[[Page Name]]` | `Page Name` | ✅ Correct (shows page) |
| `[[Page\|Label]]` | `Label` | ⚠️ Ambiguous (hides page) |
| `![[image.png]]` | _(removed)_ | ⚠️ Confusing (no indication) |
| `#tag` | _(removed)_ | ⚠️ Unexpected (tag lost) |

**Cases where UX could improve**:

1. **Links with labels** (`[[Page|Label]]`):
   - Current: Shows only "Label"
   - User expectation: May want to see "Page" (context)
   - Future setting: "Show full link targets"

2. **Image embeds** (`![[image.png]]`):
   - Current: Completely removed (replaced with space)
   - User expectation: May want to know image existed
   - Future setting: "Show image filenames"

3. **Tags** (`#tag`):
   - Current: Removed entirely
   - User expectation: Unclear (is tag metadata or content?)
   - Recommendation: Keep current behavior (tags are navigation, not content)

---

### Timing Accuracy

**User expectation**: "Chunks should advance at exactly the configured speed"

**Technical reality**: `setInterval` precision is ~10-15ms

**Perceived accuracy**:
- At 600 WPM (100ms/word): ±15ms = ±15% variation
- At 200 WPM (300ms/word): ±15ms = ±5% variation
- At 1000 WPM (60ms/word): ±15ms = ±25% variation

**UX impact**:
- **Slow speeds (200-400 WPM)**: Imperceptible variation
- **Medium speeds (400-800 WPM)**: Barely noticeable
- **Fast speeds (800+ WPM)**: Noticeable jitter

**Mitigation** (future):
- Use `requestAnimationFrame` with high-precision timer
- Correct drift over time (if 5 chunks are 10ms slow, next chunk is 50ms faster)
- Track actual vs expected timing

**Current UX**: Good enough for most use cases. Users don't report timing issues.

---

### Session End Behavior

**Scenario**: All chunks have been displayed

**Code behavior**:
```typescript
flash() {
  if (this.index >= this.flashes.length) {
    clearInterval(this.intervalId);
    return; // No more chunks to display
  }
  // ...display next chunk
}
```

**What happens**:
1. Last chunk displayed
2. Timer interval fires one more time
3. Check: No more chunks
4. Interval cleared
5. **Overlay stays open** (user must click to dismiss)

**What the user sees**:
- Last chunk remains visible
- No indication that session ended
- Overlay doesn't auto-close

**What the user experiences**:
- Finishes reading
- Waits a moment (expecting next chunk)
- Realizes it's over
- Clicks to dismiss

**Is this good UX?**

**Pros**:
- User can review last chunk (not rushed)
- No surprise auto-close (jarring)
- User controls when to exit

**Cons**:
- No clear "session complete" signal
- User may wait unnecessarily (unclear if stuck or finished)

**Recommended improvement**:
```typescript
if (this.index >= this.flashes.length) {
  clearInterval(this.intervalId);
  // Option 1: Auto-close after brief delay
  setTimeout(() => this.close(), 1000);
  
  // Option 2: Show completion message
  this.displayer.textContent = "✓ Complete";
  // User still clicks to dismiss
}
```

**Suggested UX** (Option 2):
- Show "✓ Complete" or "Session complete" for 1-2 seconds
- Then auto-close OR wait for click
- Clear end signal without being abrupt

---

## Settings UX

### Words Per Minute (WPM)

**Setting**: Text input, validates 60-2000

**Default**: 600

**User mental model**: "How fast should I read?"

**Common user questions**:
1. "What's a good WPM for me?"
2. "How does this compare to normal reading?"
3. "Is 600 too fast?"

**Recommended setting description**:
```
Words Per Minute: 600

How fast chunks advance. Typical speeds:
- 200-300: Comfortable, close to normal reading
- 400-600: Speed reading, challenging but achievable
- 700+: Very fast, requires practice

Average reading: 200-250 WPM
Speed reading: 400-800 WPM
```

**Why include guidance?**
- Users have no baseline (never timed their reading before)
- "600" is abstract number without context
- Comparisons to "normal reading" help calibrate

---

### Words Per Chunk (wordcount)

**Setting**: Text input, validates 1-20

**Default**: 1

**User mental model**: "How many words should show at once?"

**Common user questions**:
1. "Why would I want more than 1 word?"
2. "What's the difference between 1 and 3?"

**Recommended setting description**:
```
Words Per Chunk: 1

How many words to display at once:
- 1: Single-word RSVP (Rapid Serial Visual Presentation)
- 3-5: Phrase-based reading (more natural)
- 10+: Sentence-based (slower, but complete thoughts)

Tip: Start with 1, increase if single words feel too choppy.
```

**Why include guidance?**
- "Chunk" is technical term (not user-facing language)
- Examples help users understand tradeoffs
- Tip encourages experimentation

---

## Edge Case UX

### Very Low WPM (60-100)

**Scenario**: User sets WPM to 60 (1 word/second)

**Timing**: Each chunk visible for 1000ms (1 second)

**User experience**:
- Extremely slow progression
- Long pauses between words
- May feel tedious or boring
- But readable for accessibility needs

**Is this valid use case?**
- **Yes**: Users with reading disabilities may need slow pace
- **Yes**: Users learning new language may need time to process
- **No**: Most users would find this unusable

**Recommendation**: Allow, but warn if <200 WPM:
```
⚠️ Warning: 60 WPM is very slow. Most users prefer 300+.
```

---

### Very High WPM (1000+)

**Scenario**: User sets WPM to 1500 (1 word per 40ms)

**Timing**: Each chunk visible for 40ms

**User experience**:
- Words flash by in blur
- Barely enough time to register each word
- Likely unreadable for most users
- Only achievable by trained speed readers

**Is this valid use case?**
- **Maybe**: Some speed readers claim 1000+ WPM (controversial)
- **Unlikely**: Most users overestimate their speed
- **Dangerous**: May cause eye strain or headaches

**Recommendation**: Allow, but warn if >1000 WPM:
```
⚠️ Warning: 1500 WPM is extremely fast. Most speed readers max out at 800-1000 WPM.
```

---

### Long Selections (10,000+ words)

**Scenario**: User selects entire chapter (15,000 words)

**Processing time**: ~100-200ms (imperceptible)

**Session duration** (at 600 WPM, 1 word/chunk):
```
15,000 words ÷ 600 words/min = 25 minutes
```

**User experience**:
- Starts reading
- After 5 minutes: "Am I halfway?"
- After 15 minutes: "How much longer?"
- May forget they started reading (no progress indicator)

**UX challenges**:
- No progress feedback (future Spec 004)
- Can't pause (future Spec 004)
- If dismissal is accidental, progress lost

**Recommended improvement**:
```typescript
if (wordCount > 5000) {
  const minutes = Math.round((wordCount / this.wpm));
  new Notice(`This session will take approximately ${minutes} minutes.`);
}
```

**Better UX**:
- Inform user of time commitment upfront
- User can decide: "25 minutes? I'll do half now, half later"
- Set expectations (no surprise marathon sessions)

---

### Empty or Whitespace-Only Selection

**Scenario**: User selects text that, after markdown stripping, is empty

**Example**: User selects `![[image.png]]` (image only, no text)

**Processing result**:
```
createFlashes(" ") → [] (empty array)
```

**Current behavior**:
- Overlay opens
- No chunks to display
- Interval runs once, sees empty array
- Overlay stays open with blank screen

**User experience**:
- Opens overlay
- Sees nothing (blank screen)
- Confused: "Is it broken?"
- Clicks to dismiss

**Recommended improvement**:
```typescript
if (this.flashes.length === 0) {
  new Notice("No readable text in selection");
  this.close();
  return;
}
```

**Better UX**:
- Detect empty selection before opening overlay
- Show error message (toast)
- Don't open overlay at all (avoid blank screen confusion)

---

## Performance Considerations

### Processing Large Selections

**User expectation**: "Instant start, no waiting"

**Technical challenge**: Regex processing + array operations on 10,000 words

**Measured performance** (estimated):
- 1,000 words: <10ms
- 10,000 words: <100ms
- 100,000 words: ~1 second

**UX impact**:
- <100ms: Imperceptible (feels instant)
- 100-500ms: Barely noticeable
- \>500ms: User perceives delay

**Current UX**: Fine for typical selections (<5,000 words)

**Recommended improvement** (if processing >500ms):
```typescript
if (selection.split(/\s+/).length > 50000) {
  new Notice("Processing large selection...");
  // Show loading indicator
}
```

---

### Memory Usage During Long Sessions

**Scenario**: User reads for 30 minutes (18,000 words at 600 WPM)

**Memory allocation**:
- Flash array: 18,000 Flash objects × ~50 bytes = 900KB
- Interval timer: 8 bytes
- DOM elements: ~1KB
- **Total**: ~1MB (negligible)

**Memory leaks to watch for**:
- Event listeners not cleaned up (✅ handled in `onClose`)
- Interval not cleared (✅ handled in `onClose`)
- Flash array not garbage collected (✅ array reference cleared on close)

**User experience**: No performance degradation over time

---

## Accessibility

### Markdown Stripping for Screen Readers

**Issue**: Screen reader users may need formatting context

**Example**:
- Visual: `**Important**` (bold = emphasis)
- After stripping: `Important` (emphasis lost)

**Impact**:
- Meaning may change ("important" vs normal text)
- User may miss author's intent

**Potential solution** (future):
```typescript
// Keep semantic markers for screen readers
"**Important**" → "<strong>Important</strong>"
"*note*" → "<em>note</em>"
```

**Tradeoff**: More complex rendering, but preserves meaning

---

### Timing for Different Processing Speeds

**Issue**: Auto-progression at fixed WPM doesn't account for cognitive differences

**Impact**:
- Users with dyslexia may need slower speeds
- Users with ADHD may need faster speeds (prevents mind wandering)
- Fixed timing may not suit everyone

**Current mitigation**: User-configurable WPM

**Future consideration**: Adaptive timing (detect reading speed, adjust automatically)

---

## Success Criteria

### Quantitative

- ✅ Process 10,000 word selection in <100ms
- ✅ Timing accuracy: ±15ms at typical WPM (400-800)
- ✅ First chunk displays at T=0 (no initial delay)
- ✅ Markdown stripped correctly (100% of common syntax)
- ✅ No memory leaks over 30+ minute sessions

### Qualitative

- ✅ Users report "smooth" progression
- ✅ Users don't notice markdown stripping (transparent)
- ✅ Users feel timing is "accurate enough"
- ✅ Users understand how to adjust WPM for their needs

---

## Conclusion

Spec 002 is the "engine" of the reading experience. While Spec 001 provides the canvas, Spec 002 provides the rhythm.

**Key UX insights**:
1. **Rhythm is everything**: Consistent timing creates flow state
2. **Immediate start matters**: First chunk at T=0 sets expectation of "no waiting"
3. **Transparency**: Best markdown processing is invisible processing
4. **Completion clarity**: Users need signal when session ends

The result: A reading experience that feels like a heartbeat—steady, predictable, and sustainable.

