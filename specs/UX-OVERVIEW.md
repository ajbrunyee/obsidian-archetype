# Archetype Plugin - UX Overview

## Vision

Archetype transforms reading in Obsidian from a passive activity into an active learning experience through speed reading and touch typing. The UX centers on **immersive focus** and **deliberate engagement**.

---

## Design Principles

### 1. Distraction-Free Focus
**Principle**: Remove all interface chrome during reading sessions.

**Implementation**:
- Full-screen overlay that blocks out everything else
- No navigation elements, buttons, or controls visible during reading
- Single-click anywhere dismisses the overlay
- No competing UI elements for attention

**Why**: Research shows that visual clutter reduces reading comprehension. By showing only the text chunk, users can achieve flow state and maintain focus.

---

### 2. Zero Cognitive Load for Progression
**Principle**: Advancing through text should be automatic or muscle-memory simple.

**Implementation**:
- **Auto mode**: Text progresses automatically at configured WPM
- **Typing mode**: Natural typing motion advances chunks (no buttons to click)
- No decisions to make during reading
- Settings configured before starting, not during

**Why**: Decision fatigue disrupts reading flow. Every button click is a cognitive interruption. Automatic or typing-based progression keeps users in a state of engagement without requiring interface navigation.

---

### 3. Immediate Feedback, No Waiting
**Principle**: Users shouldn't wait for the system to respond.

**Implementation**:
- First chunk displays immediately (0ms delay)
- Typing feedback appears in real-time (<50ms latency)
- No loading screens or progress bars
- Instant overlay open/close

**Why**: Any delay between intent and action creates friction. Immediate response maintains the feeling of direct manipulation and keeps cognitive momentum.

---

### 4. Visual Stability
**Principle**: The reading canvas never shifts, resizes, or jumps.

**Implementation**:
- Fixed-size display container (90vw × 70vh)
- Text is centered, but container dimensions never change
- Overflow is clipped, not scrolled
- No layout reflow between chunks

**Why**: Layout shifts are jarring and force the eye to refocus. A stable canvas creates a reliable visual anchor that reduces eye strain and maintains reading rhythm.

---

### 5. Theme Integration, Not Customization
**Principle**: Respect user's existing preferences rather than imposing new ones.

**Implementation**:
- Uses Obsidian's CSS variables (`--background-primary`, `--text-normal`)
- Automatically adapts to light/dark theme
- No custom color pickers or theme options
- Consistent with Obsidian's native UI

**Why**: Users have already chosen their preferred color scheme. Asking them to configure it again creates unnecessary work and introduces visual inconsistency with the rest of their vault.

---

### 6. Progressive Engagement
**Principle**: Start passive, evolve toward active participation.

**Implementation**:
- **Spec 001-002**: Auto-progression (passive reading)
- **Spec 003**: Typing-based progression (active engagement)
- Mode switching via settings (pre-session configuration)

**Why**: Different reading tasks require different engagement levels. Skimming benefits from auto-progression. Deep learning benefits from active typing. Users choose the right tool for their current goal.

---

## User Journey

### Phase 1: Configuration (Once per reading mode)
```
Settings → Set WPM → Set words/chunk → Set progression mode → Save
```

**UX Goal**: Fast, one-time setup. Sane defaults mean most users never need to adjust.

**Defaults**:
- WPM: 600 (fast but achievable)
- Words/chunk: 1 (single-word RSVP)
- Progression: Auto (passive reading)
- Typing match: Lenient (forgiving)

---

### Phase 2: Starting a Reading Session
```
Select text → Command palette → "Start Archetype" → [OVERLAY OPENS]
```

**UX Goal**: Minimal friction from reading content to entering focused mode.

**Key moments**:
1. User highlights text (standard Obsidian interaction)
2. User invokes command (muscle memory: Cmd+P → type "arch")
3. Overlay appears instantly with first chunk already displayed

**What we avoid**:
- ❌ Modal dialogs asking for confirmation
- ❌ Loading screens or spinners
- ❌ Configuration prompts mid-flow

---

### Phase 3: Reading Session (Auto Mode)
```
[CHUNK 1] → [CHUNK 2] → [CHUNK 3] → ... → [END] → [CLOSE]
```

**UX Goal**: Pure immersion. User becomes a passive receiver of timed information.

**User's experience**:
- Text appears in rhythm (like a metronome)
- No interaction required except eye movement
- Clicks anywhere to exit early
- Natural end when all chunks shown

**Emotional journey**:
- Initial: "Am I keeping up?" (anxiety)
- Middle: "I'm in the flow" (engagement)
- End: "I retained that" (satisfaction)

---

### Phase 4: Reading Session (Typing Mode)
```
[CHUNK 1] → Type → ✓ → [CHUNK 2] → Type → ✓ → ... → [STATS] → [CLOSE]
```

**UX Goal**: Active learning through motor encoding. Typing forces comprehension.

**User's experience**:
- Chunk appears at top
- Input field is auto-focused
- Typing feels responsive (real-time comparison)
- Visual confirmation (✓) before progressing
- Correctable mistakes (backspace works)
- Natural typing rhythm develops

**Emotional journey**:
- Initial: "I need to type accurately" (attention)
- Middle: "I'm encoding this information" (engagement)
- End: "I earned this knowledge" (achievement)

---

## Interaction Patterns

### Dismissal
**Primary**: Click anywhere on overlay
**Secondary** (future): ESC key

**Why click dismissal?**
- Large target area (entire screen)
- No precision required
- Natural impulse: "I want out" → click
- Works on touch devices

---

### Typing Validation
**Pattern**: Type-as-you-go validation, no explicit "submit"

**Flow**:
1. Chunk appears
2. Input auto-focuses
3. User types (feedback is silent until match)
4. When match detected → ✓ visual confirmation
5. Brief pause (300ms) → clear input → next chunk

**Why this pattern?**
- No Enter key press required (reduces interruptions)
- Match detection feels magical (system understands intent)
- Brief pause gives satisfaction moment
- Auto-clear prepares for next chunk

---

### Error Handling (Typing Mode)
**Pattern**: Gentle, non-blocking feedback

**Scenarios**:

1. **Typo while typing**:
   - No feedback (user is still typing)
   - Backspace works normally
   - Real-time comparison continues

2. **Force-check with Enter**:
   - Press Enter → explicit validation
   - If wrong → "✗ Try again" appears briefly
   - Input remains, user can correct
   - Error count tracked but not shown during session

3. **Stuck on difficult word**:
   - ESC key → exits entire session
   - No "skip chunk" option (prevents gaming the system)

**Why gentle feedback?**
- Red error messages create anxiety
- Brief appearance → doesn't linger as punishment
- Allows self-correction
- Tracks errors for optional stats, doesn't shame user

---

## Visual Design Language

### Typography
```
Display text: 48px, line-height 1.4
Input text: 32px
Feedback text: 24px, bold
```

**Why these sizes?**
- 48px: Readable from arm's length (typical reading distance)
- Large type reduces subvocalization (faster reading)
- 32px input: Large enough for confident typing without looking at keyboard
- Hierarchy: Display > Input > Feedback

---

### Color Semantics
```
Background: var(--background-primary)
Text: var(--text-normal)
Input border: var(--text-muted) → var(--interactive-accent) on focus
Success: var(--text-success)
Error: var(--text-error)
```

**Why CSS variables?**
- Respects user's theme
- No custom color configuration needed
- Accessible contrast guaranteed (user chose working theme)

---

### Spacing & Layout
```
Overlay: 100vw × 100vh (truly full-screen)
Display area: 90vw × 70vh (centered)
Input position: 25vh from bottom
Feedback position: 18vh from bottom
```

**Why these proportions?**
- 90vw/70vh: Large but not cramped, leaves breathing room
- Display centered: Natural focal point
- Input below display: Eyes scan down (Western reading pattern)
- Fixed positions: Predictable layout, no surprises

---

### Animation & Transitions
**Current state**: None (instant changes)

**Why no animation?**
- Reading speed (600+ WPM) is already fast
- Fade transitions would blur text
- Instant changes maintain crisp readability
- Zero-latency feel

**Future consideration**:
- Optional fade (100-200ms) for <400 WPM sessions
- Typing success animation (subtle scale/glow)
- Always user-configurable, never mandatory

---

## Accessibility Considerations

### Current State
✅ **Supports**:
- Theme integration (light/dark mode)
- Large text sizes
- Keyboard input (typing mode)
- Click dismissal (large target)

⚠️ **Needs Work**:
- Screen reader support (overlay has no ARIA labels)
- Keyboard navigation (no ESC key support yet)
- Focus management (trapped in overlay)
- Reduced motion preferences (no animation currently, but future-proofing needed)

### Future Improvements
- Add ARIA live regions for chunk updates
- ESC key dismissal
- Focus trap with proper restoration on close
- Respect `prefers-reduced-motion`
- Configurable text size multiplier
- High contrast mode support

---

## Mobile Considerations

### Current Design (Desktop-First)
- Full viewport overlay works on mobile
- Large text sizes work on mobile
- Click dismissal works on touch

### Mobile-Specific Challenges
1. **Typing mode on mobile keyboards**:
   - Auto-correct disabled (good)
   - But keyboard covers 50% of screen
   - Input field may be hidden behind keyboard

2. **Smaller screens**:
   - 48px text may be too large on phone
   - 90vw width leaves little margin
   - Portrait vs landscape orientation

### Recommended Mobile UX Adjustments (Future)
- Reduce text size: 32px on mobile, 48px on desktop
- Adjust input position: Higher on screen to stay above keyboard
- Consider tablet (iPad) as ideal form factor
- Portrait mode: Stack display and input vertically
- Landscape mode: Current design works

---

## Settings UX

### Philosophy
**Principle**: Configure once, read many times. Settings are pre-session, not mid-session.

### Settings Screen Layout
```
┌─────────────────────────────────────────┐
│  Archetype Settings                      │
│                                          │
│  Reading Speed                           │
│  ├─ Words per minute: [600]             │
│  └─ Words per chunk: [1]                │
│                                          │
│  Progression Mode                        │
│  ├─ Mode: [Auto ▼] (Auto/Typing)        │
│  └─ Typing match: [Lenient ▼]           │
│                                          │
│  Advanced (collapsed by default)         │
│  └─ Show typing feedback: [✓]           │
│                                          │
└─────────────────────────────────────────┘
```

### Setting Descriptions
**Tone**: Instructive but brief. Assume intelligent user.

Examples:
- "Words per minute: How fast chunks advance (300-1200 typical)"
- "Words per chunk: How many words to show at once (1 for RSVP, 3-5 for phrases)"
- "Progression mode: Auto = timer-based, Typing = type to advance"
- "Typing match: Lenient ignores case/spacing, Strict requires exact match"

### Validation
- WPM: 60-2000 (below 60 is unusable, above 2000 is inhuman)
- Words/chunk: 1-20 (beyond 20 defeats purpose)
- No invalid states possible (dropdowns for modes)

---

## Error States & Edge Cases

### Empty Selection
**Scenario**: User invokes command with no text selected

**Current behavior** (from spec): "No chunks to display → immediate close"

**Recommended UX improvement**:
- Show brief toast: "No text selected. Highlight text and try again."
- Don't open overlay at all
- Preserve command palette flow (user can retry immediately)

---

### Very Long Text (10,000+ words)
**Scenario**: User selects entire chapter/document

**Current behavior**: Process all chunks, long session

**UX considerations**:
- Processing time: Should be <1 second
- Session length: At 600 WPM with 1 word/chunk, 10,000 words = ~16 minutes
- User may want to quit early (click dismissal works)

**Recommended UX improvement**:
- Show warning if >5,000 words: "This will take ~X minutes. Continue?"
- Or: Don't warn, trust click dismissal (current approach)

---

### Very Short Text (1-5 words)
**Scenario**: User selects single sentence

**Current behavior**: Show chunks, end quickly

**UX considerations**:
- May feel jarring (overlay opens and closes in <1 second)
- But it works correctly

**Recommendation**: No change needed. Short selections are valid use case.

---

### Markdown-Heavy Text
**Scenario**: User selects text with lots of images, links, formatting

**Current behavior**: Strip formatting, may result in sparse chunks

**UX considerations**:
- Image descriptions lost (markdown `![[image.png]]` → removed)
- Link context lost (`[[Page Name|Label]]` → only "Label" shown)
- May feel incomplete

**Recommendation** (future):
- Settings option: "Include link targets" (show "Page Name" instead of "Label")
- Setting option: "Describe images" (show "image.png" instead of removing)

---

## Performance Expectations

### Latency Budgets
| Action | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Overlay open | <16ms | <100ms | >200ms |
| Chunk transition | <16ms | <50ms | >100ms |
| Typing feedback | <16ms | <50ms | >100ms |
| Click dismissal | <16ms | <50ms | >100ms |

**Why these numbers?**
- 16ms = 60fps (one frame)
- <100ms = perceived as instant
- \>200ms = noticeable lag, breaks immersion

---

### Rendering Performance
**Requirements**:
- No dropped frames during chunk progression
- No layout recalculation between chunks
- No jank when typing in input field

**How to achieve**:
- Fixed-size containers (no CSS recalc)
- Text updates via `.nodeValue` (not `.innerHTML`)
- CSS transforms for animations (GPU-accelerated)
- Debounce typing comparison to 50ms max

---

## Success Metrics

### Qualitative Goals
- ✅ Users report "losing track of time" (flow state)
- ✅ Users feel they read faster than normal
- ✅ Users remember more of what they read (typing mode)
- ✅ Interface "disappears" (not thinking about UI)

### Quantitative Metrics
- **Speed reading adoption**: % of users who enable and use regularly
- **Typing mode adoption**: % who switch from auto to typing
- **Session completion**: % of sessions completed vs abandoned mid-way
- **Settings adjustments**: Avg number of times users change WPM (low = good defaults)
- **Error rate** (typing mode): Avg errors per session (baseline for future improvements)

---

## Future UX Enhancements

### Spec 004 (Hypothetical): Progress Indicators
**UX additions**:
- Subtle progress bar at bottom (10px tall, 50% opacity)
- "15 / 120 chunks" counter in corner (small, unobtrusive)
- Option to hide (default: hidden)

**Why optional?**
- Progress bars create time anxiety
- But some users want to know "how much longer?"
- Default to hidden preserves immersion

---

### Spec 005 (Hypothetical): Pause/Resume
**UX pattern**:
- SPACE key → pause/resume (universal media control)
- Visual indicator: "PAUSED" in corner (large, unmissable)
- Resume: SPACE or click → immediate
- No pause in typing mode (defeats purpose)

**Why SPACE?**
- Universal expectation (video players, presentations)
- Large key, easy to find without looking
- Tactile feedback

---

### Spec 006 (Hypothetical): Reading Statistics
**UX pattern**:
- Stats shown after session ends (not during)
- Modal dialog with summary (typing mode only)
- "Session complete! You typed X chunks in Y minutes. Accuracy: Z%"
- Dismissible with click or ESC
- Optional (setting: "Show stats after typing session")

**Why after, not during?**
- Stats mid-session create performance anxiety
- Post-session stats feel like achievement rewards
- User can choose to see or dismiss

---

## Design Rationale Summary

### What Makes Archetype's UX Different?

**Compared to other speed reading apps**:
1. **No controls visible during reading** (most apps show play/pause/skip buttons)
2. **Obsidian-integrated** (works with your notes, not separate app)
3. **Theme-aware** (no jarring color scheme switches)
4. **Typing-based progression** (unique engagement model)
5. **Zero configuration required** (works with defaults out of box)

**Philosophy**:
> **The best interface is no interface.** When you're reading, you shouldn't see software—you should see ideas.

Archetype gets out of your way and lets you focus on the only thing that matters: the text.

---

## Questions for Future UX Research

1. **Optimal chunk size**: Is 1 word ideal, or do users prefer 3-5 word phrases?
2. **WPM sweet spot**: What WPM do users actually use (vs default 600)?
3. **Typing mode adoption**: Do users stick with auto, or migrate to typing?
4. **Session length**: How long are typical sessions (suggests if we need pause)?
5. **Error tolerance**: What % of typos are users willing to accept in fuzzy mode?
6. **Mobile usage**: Do users want this on mobile, or is it desktop-only?

These questions should inform future spec development and UX iterations.

---

## Conclusion

Archetype's UX is built on three pillars:

1. **Immersion**: Full-screen, distraction-free display
2. **Rhythm**: Automatic or typing-driven progression
3. **Simplicity**: No buttons, no chrome, no decisions mid-flow

The result is an experience that feels less like "using software" and more like "entering a reading trance." When the interface disappears, the learning remains.

