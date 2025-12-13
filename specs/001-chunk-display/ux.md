# Spec 001: Chunk Display - UX Details

## User Experience Goals

1. **Immediate immersion**: Transition from reading note to full-screen display feels seamless
2. **Visual stability**: Text area never shifts, jumps, or resizes
3. **Easy exit**: Intuitive gesture (click anywhere) to dismiss
4. **Theme consistency**: Looks native to Obsidian, not like a third-party overlay

---

## User Flows

### Flow 1: Opening the Overlay

```
User is reading in Obsidian
      ↓
Selects text passage
      ↓
Opens command palette (Cmd/Ctrl+P)
      ↓
Types "archetype" (or shortcut)
      ↓
Presses Enter
      ↓
[INSTANT TRANSITION]
      ↓
Full-screen overlay appears with first chunk
```

**Timing expectations**:
- Command → Overlay: <100ms (instant feel)
- Overlay → First chunk: 0ms (no loading state)

**What the user sees**:
- Screen darkens (if dark theme) or lightens (if light theme)
- All Obsidian UI disappears (complete takeover)
- Large text appears centered on screen
- No visible borders, buttons, or controls

**What the user feels**:
- "I'm in reading mode now"
- Mild surprise at full-screen takeover (first time)
- Focus immediately shifts to text

---

### Flow 2: Reading Chunks (Auto Mode)

```
[Chunk 1: "Hello"]
      ↓
      100ms (at 600 WPM, 1 word/chunk)
      ↓
[Chunk 2: "world"]
      ↓
      100ms
      ↓
[Chunk 3: "this"]
      ↓
      ...continues automatically...
```

**What the user sees**:
- Text changes in place (same position, same size)
- No animation, instant replacement
- No flicker or flash
- Consistent rhythm (like a metronome)

**What the user does**:
- Nothing (passive reception)
- Eyes fixed on center of screen
- May blink between chunks
- Click anywhere to exit if overwhelmed

**What the user feels**:
- Initial: "This is fast!" (adjustment period)
- After 10-20 chunks: Rhythm develops, feels natural
- After 50+ chunks: Flow state, time disappears
- Throughout: "I don't have to do anything"

---

### Flow 3: Dismissing the Overlay

```
User wants to stop reading
      ↓
Clicks anywhere on screen
      ↓
[INSTANT TRANSITION]
      ↓
Overlay disappears
      ↓
Back to normal Obsidian view
```

**Timing expectations**:
- Click → Overlay close: <50ms (instant feel)

**What the user sees**:
- Overlay vanishes (no fade-out animation)
- Original note view restored
- Selection still highlighted (if recent)

**What the user feels**:
- "I'm back in control"
- Sense of completion (even if stopped mid-way)
- Mild disorientation (transitioning from trance to normal)

**Where they click**:
- Often: Outside the text area (margins, corners)
- Sometimes: On the text itself (impulse click)
- Rarely: Accidental click (graceful, not punishing)

---

## Visual Design Details

### Layout

```
┌────────────────────────────────────────────────────┐
│                                                     │
│                    [empty space]                    │
│                         5vh                         │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │                                               │  │
│  │                                               │  │
│  │              "current chunk"                  │  │
│  │           (centered vertically &              │  │
│  │              horizontally)                    │  │
│  │                                               │  │
│  │               90vw × 70vh                     │  │
│  │            (fixed dimensions)                 │  │
│  │                                               │  │
│  └──────────────────────────────────────────────┘  │
│                    [empty space]                    │
│                         5vh                         │
│                  (clickable area)                   │
└────────────────────────────────────────────────────┘
         5vw                               5vw
      (clickable)                       (clickable)
```

**Key measurements**:
- Display area: 90vw × 70vh (leaves 5% margin on all sides)
- Outer overlay: 100vw × 100vh (truly full-screen)
- Text area: Centered within display area
- All margins are clickable dismissal targets

**Why these proportions?**
- 90vw: Wide enough for readability, narrow enough to avoid head turning
- 70vh: Tall enough for multi-line chunks, short enough to avoid vertical eye movement
- 5% margins: Visual breathing room, prevents edge-of-screen discomfort

---

### Typography

**Text Specifications**:
```css
font-size: 48px
line-height: 1.4 (67.2px)
text-align: center
font-family: inherit (uses Obsidian's font)
color: var(--text-normal)
```

**Why 48px?**
- Readable from 60-90cm (typical desk viewing distance)
- Large enough to reduce subvocalization (speed reading technique)
- Not so large that long words break awkwardly
- Comfortable for extended reading (low eye strain)

**Why line-height 1.4?**
- Optimal readability (not cramped, not loose)
- Multi-word chunks still fit comfortably
- Matches Obsidian's reading mode

**Why center-aligned?**
- Predictable eye position (no left-to-right scanning)
- Focal point established (RSVP technique)
- Feels intentional, not default

---

### Color & Theme Integration

**Light Theme**:
```
Background: #FFFFFF (or user's --background-primary)
Text: #2E3338 (or user's --text-normal)
Effect: Clean, paper-like reading surface
```

**Dark Theme**:
```
Background: #1E1E1E (or user's --background-primary)
Text: #DCDDDE (or user's --text-normal)
Effect: Low-light reading, reduced eye strain
```

**Why CSS variables?**
- Automatically adapts to theme changes (no plugin update needed)
- Respects user's color preferences (may have custom theme)
- Accessible contrast guaranteed (user chose working combination)
- No configuration burden (zero settings for color)

**Edge case: Custom themes**:
- Some Obsidian themes use unconventional colors (pink, blue, etc.)
- Plugin respects these choices
- May look unusual, but user chose it deliberately

---

### Interaction Targets

**Dismissal Target Map**:
```
┌─────────────────────────────────────────────────┐
│ ■ CLICKABLE (entire area)                       │
│                                                  │
│    ┌─────────────────────────────────────┐     │
│    │  NOT CLICKABLE                       │     │
│    │  (text display area)                 │     │
│    │  BUT STILL DISMISSES ON CLICK        │     │
│    │  (entire overlay is one target)      │     │
│    └─────────────────────────────────────┘     │
│                                                  │
│ ■ CLICKABLE (entire area)                       │
└─────────────────────────────────────────────────┘
```

**Click behavior**:
- **Anywhere on overlay** → Dismisses
- **Text itself** → Dismisses (same as margin)
- **Outside overlay** → N/A (overlay is 100vw × 100vh)

**Why entire overlay is clickable?**
- Fitts's Law: Large target = easy to hit
- No precision required (low cognitive load)
- Natural impulse: "I want out" → click → immediate result
- Works with mouse, trackpad, touch

**Alternative considered (rejected)**:
- Only margins clickable, text area inert
- **Why rejected**: Confusing (some clicks work, some don't)
- User shouldn't have to think about where to click

---

## Edge Case UX

### Long Text Overflow

**Scenario**: Chunk contains 10+ words, exceeds container height

**Visual behavior**:
```
┌──────────────────────────────────┐
│  This is a very long chunk that  │
│  contains many words and will    │
│  eventually exceed the height    │
│  of the container which is set   │
│  to 70vh and cannot grow any...  │  ← Text cuts off here
└──────────────────────────────────┘
```

**What the user sees**:
- Text is clipped at bottom edge
- No scrollbar appears
- No "..." ellipsis (just hard cut)

**What the user experiences**:
- Chunk is partially readable (top portion visible)
- Bottom portion lost
- May feel incomplete or confusing

**Why this behavior?**
- Maintains fixed container size (zero layout shift)
- Prevents scrolling (breaks reading flow)
- Rare case (default 1 word/chunk prevents this)

**Recommended mitigation** (future):
- Warning in settings: "Chunks with >20 words may be clipped"
- Or: Dynamic font-size reduction for long chunks (complex)

---

### Very Short Words

**Scenario**: Chunk contains 1-2 character word ("a", "I", "is")

**Visual behavior**:
```
┌──────────────────────────────────┐
│                                   │
│                                   │
│                 a                 │
│                                   │
│                                   │
└──────────────────────────────────┘
```

**What the user sees**:
- Single letter in vast empty space
- May feel silly or wasteful

**What the user experiences**:
- Brief flash (at 600 WPM, only visible 100ms)
- Mostly non-issue (next chunk appears quickly)

**Why this is fine**:
- Speed reading embraces single-word display
- Short words process instantly (no comprehension needed)
- Natural part of English language (articles, conjunctions)

---

### Empty Selection (No Text)

**Scenario**: User invokes command without selecting text

**Current spec behavior**: "No chunks to display → immediate close"

**What the user sees**:
- Command palette closes
- Overlay never opens (or opens and closes in <16ms)

**What the user experiences**:
- Confusion: "Did it work?"
- No feedback about what went wrong

**Recommended improvement**:
```typescript
if (selection.length === 0) {
  new Notice("Please select text before starting Archetype");
  return; // Don't open overlay
}
```

**Better UX**:
- Clear error message (toast notification)
- Obsidian's standard Notice component (familiar pattern)
- User understands what to do next (select text, retry)

---

### Theme Switching Mid-Session

**Scenario**: User has overlay open, switches Obsidian theme

**Current behavior**: CSS variable updates, overlay adapts instantly

**What the user sees**:
- Background color changes (light → dark or vice versa)
- Text color changes
- No layout shift

**What the user experiences**:
- Mild surprise (if accidental theme switch)
- Continues reading without interruption

**Why this works**:
- CSS variables update globally
- Overlay inherits changes
- No JavaScript intervention needed

---

## Accessibility Considerations

### Keyboard Users

**Current state**: No keyboard support (click-only dismissal)

**Impact**:
- Users who navigate with keyboard only (no mouse) are trapped
- ESC key does nothing (expected dismissal pattern)

**Recommended fix** (Spec 001 enhancement):
```typescript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    this.close();
  }
});
```

**Improved UX**:
- ESC key dismisses overlay (universal escape hatch)
- Keyboard and mouse users have equal access

---

### Screen Reader Users

**Current state**: No ARIA labels or live regions

**Impact**:
- Screen reader announces "overlay" or nothing
- Chunk text changes not announced
- User has no idea what's being displayed

**Recommended fix** (Future):
```html
<div class="archetype-overlay" role="dialog" aria-label="Speed reading display">
  <div class="archetype-displayer" aria-live="polite" aria-atomic="true">
    [chunk text]
  </div>
</div>
```

**Improved UX**:
- Screen reader announces each chunk change
- User understands overlay purpose
- Can follow along (though timing is challenging)

**Note**: Speed reading may not be ideal for screen reader users (audio pacing vs visual pacing conflict). But basic accessibility should still be supported.

---

### Color Contrast

**Current state**: Uses `--background-primary` and `--text-normal`

**Impact**: 
- Contrast ratio determined by user's theme
- Obsidian themes generally meet WCAG AA (4.5:1 minimum)
- Plugin inherits theme's accessibility

**Potential issue**:
- Custom themes may have poor contrast
- Plugin can't fix bad theme choices

**Recommendation**: Trust user's theme. If they can read Obsidian, they can read Archetype.

---

### Motion Sensitivity

**Current state**: No animation (instant chunk changes)

**Impact**:
- No motion to trigger sensitivity
- Rapid text changes may still be disorienting

**Future consideration**:
- Setting: "Animation speed" (none/slow/fast)
- Respect `prefers-reduced-motion` media query
- Add optional fade transition (<200ms) for sensitive users

---

## Performance Expectations

### Rendering Performance

**Target**: 60fps (16ms per frame)

**Measurement points**:
1. **Overlay open**: Time from command execution to overlay visible
2. **First chunk display**: Time from overlay visible to text rendered
3. **Chunk transitions**: Time from text update to screen repaint

**Why 60fps?**
- Matches display refresh rate (no tearing or jank)
- Feels smooth and responsive
- Reading is visual activity (frame rate matters)

**How to achieve**:
- Use CSS `position: fixed` (avoids layout thrashing)
- Update text via `.nodeValue` not `.innerHTML` (faster DOM operation)
- No JavaScript animations (CSS only, if any)

---

### Memory Usage

**Target**: <10MB for overlay + displayed chunks

**Considerations**:
- DOM elements: 2 divs (overlay + displayer)
- Text nodes: 1 text node (reused across chunks)
- Event listeners: 1 click listener

**Why low memory?**
- Obsidian is Electron app (already memory-heavy)
- Users often have multiple vaults/windows open
- Long reading sessions shouldn't leak memory

---

### Stress Testing

**Scenario**: User selects 10,000 word document

**Expected behavior**:
- Processing: <1 second to create chunks
- Display: Smooth chunk progression
- Memory: Constant (not growing with chunk count)
- Dismissal: Instant (even mid-session)

**How to test**:
1. Select War and Peace (560,000 words)
2. Start Archetype
3. Let run for 5 minutes
4. Check: No dropped frames, no memory leak
5. Click to dismiss
6. Check: Instant close, memory released

---

## User Feedback & Iteration

### Expected First-Time User Reactions

**Positive**:
- "Wow, this is different!"
- "I can read so much faster"
- "This is like a reading trance"

**Negative**:
- "Too fast, can't keep up"
- "Where are the controls?"
- "How do I pause?"

**Confused**:
- "Did it work?" (empty selection case)
- "How do I close this?" (before discovering click dismissal)
- "Why is it full-screen?" (expected modal window)

---

### UX Improvements Based on Feedback

**If users say "Too fast"**:
→ Suggest lowering WPM in settings (or add "slow down" command)

**If users say "Where are controls?"**:
→ This is intentional (distraction-free design). Document in README.

**If users say "How do I close?"**:
→ Add brief instruction overlay on first use: "Click anywhere to exit" (dismiss after 2 seconds or first click)

**If users say "I want to pause"**:
→ Future spec (Spec 004: Pause/Resume). For now, click to stop, restart where you left off.

---

## Success Criteria

### Quantitative

- ✅ Overlay opens in <100ms
- ✅ First chunk visible immediately (0ms delay)
- ✅ Chunk transitions render in <16ms (60fps)
- ✅ Click dismissal responds in <50ms
- ✅ No layout shift measured (fixed dimensions)
- ✅ Theme integration works in all official Obsidian themes

### Qualitative

- ✅ Users report "immersive" experience
- ✅ Users don't mention the interface (invisible design)
- ✅ Users naturally discover click dismissal
- ✅ Users feel overlay is "part of Obsidian" (not third-party)

---

## Conclusion

Spec 001's UX is intentionally minimal. The overlay is a blank canvas that gets out of the way. No buttons, no chrome, no distractions. Just text and focus.

The design embraces constraints:
- ✅ Fixed size = zero layout shift
- ✅ Click anywhere = zero precision required
- ✅ Theme integration = zero configuration
- ✅ Instant display = zero waiting

The result: An experience that feels less like "using a plugin" and more like "reading in a new way."

