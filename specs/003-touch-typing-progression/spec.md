# Feature 3: Touch Typing Progression

## Overview

Obsidian Flashread plugin - Feature 3

## Problem Statement

Passive speed reading (automatic progression) can lead to reduced retention and engagement. Active reading techniques that require user interaction—such as typing the displayed text—improve comprehension, memory encoding, and focus by forcing cognitive engagement with each chunk.

## Goals

- Enable typing-based progression as an alternative to automatic timer-based progression
- Provide real-time feedback on typing accuracy
- Support configurable error tolerance (strict vs. lenient matching)
- Track typing speed and accuracy metrics
- Allow mode switching between automatic and typing-based progression

## Non-Goals

- Typing tutorials or lessons
- Gamification (scores, achievements)
- Multi-user typing competitions
- Speech-to-text input

---

## Requirements

### Functional

- Display text chunk at top of overlay
- Provide input field for user typing
- Compare typed text to displayed chunk in real-time
- Progress to next chunk only when typing matches (within tolerance)
- Show visual feedback for correct/incorrect typing
- Support backspace and correction
- Disable automatic timer when in typing mode
- Clear input field after successful match

### Non-Functional

- Input lag < 50ms for responsive typing feedback
- Support typing speeds up to 200 WPM
- Handle chunks up to 100 characters without UI breaks
- Preserve typing state if overlay is accidentally dismissed

---

## Design

### Component: TypingProgressionController

Extends the existing `ViewModal` with typing-specific logic and UI elements.

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│                    Flashread Overlay                     │
│                     (100vw × 100vh)                      │
│                                                          │
│                                                          │
│                   "word chunk text"                      │
│                   ─────────────────                      │
│                   (target text, 48px)                    │
│                                                          │
│                                                          │
│           ┌─────────────────────────────┐               │
│           │  [typing input field]       │               │
│           └─────────────────────────────┘               │
│                                                          │
│              ✓ Correct  |  ✗ Incorrect                  │
│                 (feedback indicator)                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Interaction Model

**Typing Mode Flow:**

```
Display chunk
      ↓
Focus input field
      ↓
User types → Real-time comparison
      ↓
Match? → Yes → Clear input → Next chunk
      ↓
Match? → No → Show feedback → Continue typing
      ↓
All chunks complete → Close overlay
```

**Comparison Logic:**

1. **Strict mode**: Exact match including case and punctuation
2. **Lenient mode** (default): Case-insensitive, ignore extra whitespace
3. **Fuzzy mode**: Allow minor typos (Levenshtein distance ≤ 2)

### Configuration

**New Settings:**

```typescript
interface FlashreadSettings {
  wpm: string;                    // Existing
  wordcount: string;              // Existing
  progressionMode: string;        // "auto" | "typing"
  typingMatchMode: string;        // "strict" | "lenient" | "fuzzy"
  showTypingFeedback: boolean;    // Show correct/incorrect indicators
  requireExactMatch: boolean;     // Must match exactly to progress
}
```

---

## Implementation

### File: main.ts

#### New Class: TypingState

```typescript
class TypingState {
  currentInput: string = "";
  isCorrect: boolean = false;
  startTime: number = 0;
  chunkTimes: number[] = [];
  errorCount: number = 0;
}
```

#### Method: setupTypingMode()

Called from `onOpen()` when `progressionMode === "typing"`:

```typescript
setupTypingMode() {
  // Create input container
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("flashread-typing-container");
  
  // Create input field
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.classList.add("flashread-typing-input");
  inputField.placeholder = "Type the text above...";
  inputField.autocomplete = "off";
  inputField.autocorrect = "off";
  inputField.spellcheck = false;
  
  // Create feedback indicator
  const feedback = document.createElement("div");
  feedback.classList.add("flashread-typing-feedback");
  
  // Attach input handler
  inputField.addEventListener("input", this.onTypingInput.bind(this));
  inputField.addEventListener("keydown", this.onTypingKeydown.bind(this));
  
  inputContainer.appendChild(inputField);
  this.overlay.appendChild(inputContainer);
  this.overlay.appendChild(feedback);
  
  this.typingInput = inputField;
  this.typingFeedback = feedback;
  
  // Focus input
  setTimeout(() => inputField.focus(), 100);
  
  // Start timing
  this.typingState.startTime = Date.now();
}
```

#### Method: onTypingInput(event: InputEvent)

Real-time comparison and feedback:

```typescript
onTypingInput(event: InputEvent) {
  const input = this.typingInput.value;
  const target = this.flashes[this.index].text;
  
  const matches = this.compareText(input, target);
  
  if (matches) {
    // Correct match
    this.typingFeedback.textContent = "✓ Correct";
    this.typingFeedback.classList.add("correct");
    this.typingFeedback.classList.remove("incorrect");
    
    // Record timing
    const elapsed = Date.now() - this.typingState.startTime;
    this.typingState.chunkTimes.push(elapsed);
    
    // Progress to next chunk
    setTimeout(() => {
      this.index++;
      this.typingInput.value = "";
      this.typingState.startTime = Date.now();
      
      if (this.index < this.flashes.length) {
        this.flash(); // Display next chunk
        this.typingInput.focus();
      } else {
        this.close(); // All chunks complete
      }
    }, 300); // Brief delay to show success
    
  } else {
    // Incorrect or partial
    this.typingFeedback.textContent = "";
    this.typingFeedback.classList.remove("correct", "incorrect");
  }
}
```

#### Method: compareText(input: string, target: string): boolean

Comparison logic based on settings:

```typescript
compareText(input: string, target: string): boolean {
  const mode = this.plugin.settings.typingMatchMode;
  
  switch (mode) {
    case "strict":
      return input === target;
      
    case "lenient":
      // Case-insensitive, trim whitespace
      return input.trim().toLowerCase() === target.trim().toLowerCase();
      
    case "fuzzy":
      // Allow minor typos (Levenshtein distance ≤ 2)
      const distance = this.levenshteinDistance(
        input.trim().toLowerCase(),
        target.trim().toLowerCase()
      );
      return distance <= 2;
      
    default:
      return input.trim().toLowerCase() === target.trim().toLowerCase();
  }
}
```

#### Method: levenshteinDistance(a: string, b: string): number

Calculate edit distance for fuzzy matching:

```typescript
levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}
```

#### Method: onTypingKeydown(event: KeyboardEvent)

Handle special keys:

```typescript
onTypingKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    this.close();
  } else if (event.key === "Enter") {
    // Force check even if not exact match (for fuzzy mode)
    const input = this.typingInput.value;
    const target = this.flashes[this.index].text;
    
    if (this.compareText(input, target)) {
      // Trigger progression
      this.onTypingInput({ target: this.typingInput } as InputEvent);
    } else {
      // Show error feedback
      this.typingFeedback.textContent = "✗ Try again";
      this.typingFeedback.classList.add("incorrect");
      this.typingState.errorCount++;
    }
  }
}
```

---

## File: styles.css

### New CSS Classes

```css
/* Typing mode container */
.flashread-typing-container {
  position: absolute;
  bottom: 25vh;
  width: 60vw;
  display: flex;
  justify-content: center;
}

/* Typing input field */
.flashread-typing-input {
  width: 100%;
  font-size: 32px;
  padding: 15px 20px;
  text-align: center;
  border: 2px solid var(--text-muted);
  border-radius: 8px;
  background-color: var(--background-secondary);
  color: var(--text-normal);
  outline: none;
  transition: border-color 0.2s;
}

.flashread-typing-input:focus {
  border-color: var(--interactive-accent);
}

/* Feedback indicator */
.flashread-typing-feedback {
  position: absolute;
  bottom: 18vh;
  font-size: 24px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}

.flashread-typing-feedback.correct {
  color: var(--text-success);
  opacity: 1;
}

.flashread-typing-feedback.incorrect {
  color: var(--text-error);
  opacity: 1;
}

/* Adjust displayer position when typing mode active */
.flashread-overlay.typing-mode .flashread-displayer {
  height: 40vh;
  align-items: flex-start;
  padding-top: 15vh;
}
```

---

## Settings UI

### New Setting: Progression Mode

```typescript
new Setting(containerEl)
  .setName('Progression Mode')
  .setDesc('Choose how to advance to the next chunk')
  .addDropdown(dropdown => dropdown
    .addOption('auto', 'Automatic (timer-based)')
    .addOption('typing', 'Typing (type to progress)')
    .setValue(this.plugin.settings.progressionMode)
    .onChange(async (value) => {
      this.plugin.settings.progressionMode = value;
      await this.plugin.saveSettings();
    }));
```

### New Setting: Typing Match Mode

```typescript
new Setting(containerEl)
  .setName('Typing Match Mode')
  .setDesc('How strictly to match typed text')
  .addDropdown(dropdown => dropdown
    .addOption('lenient', 'Lenient (ignore case/spaces)')
    .addOption('strict', 'Strict (exact match)')
    .addOption('fuzzy', 'Fuzzy (allow minor typos)')
    .setValue(this.plugin.settings.typingMatchMode)
    .onChange(async (value) => {
      this.plugin.settings.typingMatchMode = value;
      await this.plugin.saveSettings();
    }));
```

---

## Edge Cases

- **Empty chunk**: Skip immediately (no typing required)
- **Very long chunks**: Input field scrolls horizontally
- **Fast typers**: Debounce matching check (every 50ms max)
- **Accidental Enter key**: Only progress if match is valid
- **Copy-paste**: Allow, but defeats purpose (user choice)
- **Mobile keyboards**: Autocomplete/autocorrect disabled
- **Focus loss**: Refocus input automatically when user clicks overlay

---

## Testing Scenarios

1. **Basic typing**: Display "hello world" → type "hello world" → verify progression
2. **Case insensitive (lenient)**: Display "Hello" → type "hello" → verify match
3. **Strict mode**: Display "Hello" → type "hello" → verify no match
4. **Fuzzy mode**: Display "hello" → type "helo" (typo) → verify match
5. **Backspace correction**: Type "helo" → backspace → "hello" → verify match
6. **Multi-word chunk**: Display "the quick brown" → type all three → verify
7. **Enter key validation**: Type incorrect text → press Enter → verify error feedback
8. **ESC dismissal**: Start typing → press ESC → verify overlay closes
9. **Long text**: Display 50+ char chunk → verify input field handles
10. **Completion**: Type all chunks correctly → verify overlay closes with stats

---

## Metrics & Analytics

### Tracked Data (optional future enhancement)

```typescript
interface TypingStats {
  totalChunks: number;
  correctChunks: number;
  averageTimePerChunk: number;    // milliseconds
  typingSpeed: number;             // characters per minute
  errorCount: number;
  accuracyRate: number;            // percentage
}
```

### Display Summary (on completion)

```
Session Complete!
─────────────────
Chunks typed: 45
Accuracy: 98%
Avg time/chunk: 2.3s
Typing speed: 187 CPM
```

---

## Future Enhancements

- Pause/resume with timer freeze
- Skip chunk (with penalty or tracking)
- Visual typing progress bar
- Highlight mismatched characters in real-time
- Dictation mode (speech-to-text)
- Practice mode with repeated chunks
- Leaderboard/stats tracking
- Custom keyboard shortcuts for progression modes

