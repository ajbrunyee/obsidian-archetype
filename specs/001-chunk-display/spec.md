# Feature 1: Chunk Display

## Overview

Obsidian Flashread plugin - Feature 1

## Problem Statement

Reading long-form text in Obsidian can be time-consuming. Speed reading techniques require a distraction-free, stable display environment where text chunks can be presented without layout shifts or visual distractions.

## Goals

- Provide a full-screen display container for presenting text chunks
- Ensure zero layout shift between chunk transitions
- Support theme-aware styling (light/dark mode)
- Enable single-click dismissal

## Non-Goals

- Keyboard navigation (future enhancement)
- Progress indicators
- Custom color schemes beyond theme integration

---

## Requirements

### Functional

- Display text chunks in a centered, full-screen overlay
- Maintain fixed dimensions regardless of text length
- Use theme-aware background colors (light/dark mode support)
- Support single-click dismissal

### Non-Functional

- Zero layout shift between chunk transitions
- Render within 16ms of chunk update (60fps)
- Responsive to viewport size changes

---

## Design

### Component: FlashreadOverlay

The overlay is implemented as a full-screen fixed-position DOM element appended directly to `document.body`, bypassing Obsidian's Modal constraints.

```
┌─────────────────────────────────────────────────────────┐
│                    Flashread Overlay                     │
│                     (100vw × 100vh)                      │
│                                                          │
│                                                          │
│           ┌─────────────────────────────────┐           │
│           │    Text Displayer                │           │
│           │    (90vw × 70vh, fixed)         │           │
│           │                                  │           │
│           │      "current chunk"             │           │
│           │                                  │           │
│           └─────────────────────────────────┘           │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### CSS Architecture

- `.flashread-overlay`: Full-screen container with `position: fixed`, `z-index: 9999`
- `.flashread-displayer`: Fixed-size inner container (90vw × 70vh) with centered text
- Uses `var(--background-primary)` for theme integration

### Interaction Model

- Click anywhere → close overlay and stop playback
- ESC key → (future enhancement) close overlay

---

## Implementation

### File: main.ts - ViewModal.onOpen()

1. Create overlay div with class `flashread-overlay`
2. Create displayer div with class `flashread-displayer`
3. Attach click handler for dismissal
4. Append to `document.body`
5. Hide underlying Obsidian modal (`modalEl.style.display = "none"`)

### File: styles.css

```css
.flashread-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background-color: var(--background-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.flashread-displayer {
  width: 90vw; height: 70vh;
  min-width: 90vw; min-height: 70vh;
  max-width: 90vw; max-height: 70vh;
  font-size: 48px; line-height: 1.4;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  word-wrap: break-word;
}
```

---

## Edge Cases

- **Long text overflow**: Text exceeding container height is clipped (`overflow: hidden`)
- **Empty selection**: No chunks to display → immediate close
- **Theme switching**: Uses CSS variable, automatically adapts

---

## Testing Scenarios

1. **Basic display**: Open overlay → verify full-screen, centered
2. **Theme compatibility**: Test in light/dark mode → verify background matches theme
3. **Click dismissal**: Click anywhere → verify overlay closes
4. **Layout stability**: Display short/long text alternately → verify no size changes
5. **Overflow handling**: Display 5+ lines of text → verify clipping, no scroll

---

## Future Enhancements

- ESC key support for dismissal
- Fade-in/fade-out animations
- Adjustable opacity
- Custom background colors

