# Archetype UX Documentation - Index

This directory contains comprehensive UX documentation for the Archetype plugin.

---

## Documentation Structure

### 📋 [UX-OVERVIEW.md](./UX-OVERVIEW.md)
**High-level UX philosophy and principles**

**Contents**:
- Vision and design principles
- User journey across all features
- Interaction patterns (dismissal, validation, etc.)
- Visual design language (typography, color, spacing)
- Accessibility considerations
- Performance expectations
- Success metrics

**Read this first** to understand the overall UX approach.

---

### 📐 Feature-Specific UX Documentation

Each spec has its own detailed UX documentation:

#### 1. [001-chunk-display/ux.md](./001-chunk-display/ux.md)
**Spec 001: Chunk Display**

**Focus**: Visual container and immersive reading environment

**Key topics**:
- Opening/closing the overlay flow
- Visual design details (layout, typography, colors)
- Interaction targets (click dismissal)
- Edge cases (overflow, empty selection, theme switching)
- Accessibility (keyboard, screen readers, contrast)

**Read this** to understand the reading canvas.

---

#### 2. [002-chunk-player/ux.md](./002-chunk-player/ux.md)
**Spec 002: Chunk Player**

**Focus**: Text processing and automatic progression

**Key topics**:
- Markdown stripping transparency
- Rhythm development (metronome effect)
- Multi-word chunk experience
- Timing accuracy and session completion
- Settings UX (WPM, wordcount)
- Edge cases (long selections, empty text, performance)

**Read this** to understand the reading engine.

---

#### 3. [003-touch-typing-progression/ux.md](./003-touch-typing-progression/ux.md)
**Spec 003: Touch Typing Progression**

**Focus**: Active learning through typing

**Key topics**:
- Mental model shift (passive → active)
- Typing flow and error handling
- Match modes (lenient/strict/fuzzy)
- Visual design (input field, feedback indicators)
- Interaction patterns (auto-focus, Enter key, backspace)
- Settings UX (progression mode, match mode)
- Edge cases (long chunks, mobile keyboards, fast typers)
- Comparison to auto mode

**Read this** to understand active engagement.

---

## How to Use This Documentation

### For Product/Design Decisions
1. Start with **UX-OVERVIEW.md** for design principles
2. Reference feature-specific docs for implementation details
3. Use "Success Criteria" sections to measure outcomes

### For Development
1. Read feature-specific UX doc alongside technical spec
2. Understand **user flows** before implementing features
3. Pay attention to **edge cases** and **accessibility** sections

### For Testing
1. Use **user flows** as test scenarios
2. Verify **success criteria** (quantitative and qualitative)
3. Check **edge cases** are handled gracefully

### For Documentation/Onboarding
1. **UX-OVERVIEW.md** explains the "why" to new contributors
2. Feature-specific docs show the "how" for each feature
3. Use as reference when writing user-facing docs (README, tutorials)

---

## UX Principles Quick Reference

The Archetype UX is built on **6 core principles**:

1. **Distraction-Free Focus**
   - Full-screen overlay blocks everything
   - No visible controls during reading
   - Single-click dismissal

2. **Zero Cognitive Load for Progression**
   - Auto mode: Automatic advancement
   - Typing mode: Muscle-memory typing (no button clicks)
   - Settings configured before session, not during

3. **Immediate Feedback, No Waiting**
   - First chunk displays at T=0 (no delay)
   - Typing feedback <50ms
   - Instant overlay open/close

4. **Visual Stability**
   - Fixed-size containers (90vw × 70vh)
   - No layout shifts between chunks
   - Text centered, container never changes

5. **Theme Integration, Not Customization**
   - Uses Obsidian CSS variables
   - Adapts to light/dark mode
   - No custom color pickers

6. **Progressive Engagement**
   - Start with auto mode (passive)
   - Evolve to typing mode (active)
   - User chooses engagement level

---

## Key User Flows

### Basic Reading Session (Auto Mode)
```
Select text → Start Archetype → [CHUNKS AUTO-ADVANCE] → Click to exit
```

**Duration**: Depends on WPM and text length
**Engagement**: Passive (watching)
**Goal**: Speed and comprehension

---

### Active Learning Session (Typing Mode)
```
Select text → Start Archetype → [TYPE EACH CHUNK] → ESC to exit
```

**Duration**: Slower than auto (50-100 effective WPM)
**Engagement**: Active (typing)
**Goal**: Retention and encoding

---

## Common UX Challenges & Solutions

### Challenge: "Too fast, can't keep up"
**Solution**: Lower WPM in settings (try 300-400)

### Challenge: "Where are the controls?"
**Solution**: Intentional (distraction-free design). Click anywhere to exit.

### Challenge: "How do I pause?"
**Solution**: Not yet implemented (future Spec). Click to stop, restart later.

### Challenge: "I made a typo in typing mode"
**Solution**: Backspace works, correct and continue.

### Challenge: "Empty selection, nothing happens"
**Solution**: Improved error message (see edge case in 001/ux.md)

### Challenge: "Long text, don't know how much is left"
**Solution**: Progress indicator (future Spec 004)

---

## Accessibility Summary

### ✅ Currently Supported
- Theme integration (light/dark mode)
- Large text sizes (48px display)
- Keyboard input (typing mode)
- Click dismissal (large target area)

### ⚠️ Needs Improvement
- ESC key dismissal (not yet implemented)
- Screen reader support (no ARIA labels)
- Focus management (no focus trap/restoration)
- Mobile keyboard handling (covers screen)

### 🔮 Future Enhancements
- Respect `prefers-reduced-motion`
- Configurable text size multiplier
- High contrast mode
- Voice input (speech-to-text)

---

## Performance Targets

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Overlay open | <16ms | <100ms | >200ms |
| Chunk transition | <16ms | <50ms | >100ms |
| Typing feedback | <16ms | <50ms | >100ms |
| Click dismissal | <16ms | <50ms | >100ms |
| Text processing (10K words) | <100ms | <500ms | >1000ms |

---

## Success Metrics

### Feature Adoption
- **Auto mode**: 80%+ of users try it
- **Typing mode**: 20%+ of users try it
- **Typing retention**: 50%+ of typing users continue using it

### User Satisfaction
- Users report "flow state" experience
- Users feel they read faster than normal
- Typing mode users report better retention
- Interface "disappears" (not thinking about UI)

### Technical Performance
- Zero layout shifts (measured)
- 60fps maintained during sessions
- No memory leaks over 30+ minute sessions

---

## Visual Design Summary

### Typography
```
Display text: 48px, line-height 1.4
Input text: 32px
Feedback text: 24px, bold
Font: Inherits from Obsidian
```

### Colors
```
Background: var(--background-primary)
Text: var(--text-normal)
Input border: var(--text-muted) → var(--interactive-accent) on focus
Success: var(--text-success)
Error: var(--text-error)
```

### Spacing
```
Overlay: 100vw × 100vh
Display area: 90vw × 70vh (centered)
Margins: 5vw horizontal, 5vh vertical (all clickable)
Input position: 25vh from bottom (typing mode)
```

### Animations
```
Current: None (instant transitions)
Future: Optional 100-200ms fade for slow WPM
Always: User-configurable, never mandatory
```

---

## Frequently Asked Questions (UX Perspective)

### Why no pause button?
**A**: Maintains distraction-free design. Click to exit, restart later (future: keyboard shortcut).

### Why no progress indicator?
**A**: Creates time anxiety, breaks immersion. Future: Optional (default hidden).

### Why click anywhere to dismiss?
**A**: Fitts's Law (large target = easy to hit). Natural impulse: "I want out" → click → done.

### Why no animation between chunks?
**A**: Reading is fast (600 WPM = 100ms/word). Animation would blur text. Instant changes maintain crisp readability.

### Why strip markdown formatting?
**A**: Formatting is visual noise for speed reading. Users want text content, not syntax.

### Why typing mode is slower?
**A**: Intentional. Typing prioritizes learning over speed. Motor encoding improves retention.

### Why lenient matching by default?
**A**: Lowest friction. Typing mode is for learning, not testing typing accuracy (unless user chooses strict mode).

### Why full-screen overlay?
**A**: Eliminates distractions. Peripheral vision = cognitive load. Full-screen = full focus.

---

## Related Documentation

- **Technical Specs**: See `spec.md` in each feature directory
- **Domain Models**: See `001-chunk-display/domain/` for conceptual models
- **Testing**: See `TESTING.md` in project root
- **Implementation**: See `src/` for actual code

---

## Contributing to UX Documentation

When adding new features or specs:

1. **Update UX-OVERVIEW.md** if adding new design principles
2. **Create `ux.md`** in the spec directory (use existing docs as template)
3. **Include**:
   - User experience goals
   - User flows (timeline-based)
   - Visual design details
   - Interaction patterns
   - Edge cases
   - Accessibility considerations
   - Success criteria

4. **Link from this index**

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2025-12-13 | Created UX documentation structure | AI Agent |
| 2025-12-13 | Added UX-OVERVIEW.md | AI Agent |
| 2025-12-13 | Added feature-specific UX docs (001, 002, 003) | AI Agent |

---

## Feedback

UX is iterative. As users interact with Archetype, these documents should evolve.

**Questions to answer through user research**:
- What WPM do users actually use? (vs default 600)
- Do users prefer single-word or multi-word chunks?
- Is typing mode adopted or ignored?
- What's the ideal fuzzy match tolerance?
- Do users want pause/resume controls?

Update these docs based on real-world usage and feedback.

---

**Questions about UX decisions?** Refer to the specific feature's `ux.md` file for detailed rationale.

**Implementing a feature?** Read the UX doc first to understand user expectations before coding.

**Designing a new feature?** Follow the 6 core principles and use existing docs as templates.

