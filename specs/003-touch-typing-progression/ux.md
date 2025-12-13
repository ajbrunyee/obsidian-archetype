# Spec 003: Touch Typing Progression - UX Details

## User Experience Goals

1. **Active engagement**: Transform reading from passive to active learning
2. **Motor encoding**: Build memory through muscle movement (typing)
3. **Forgiving feedback**: Encourage accuracy without punishment
4. **Flow state**: Typing rhythm becomes meditative, not stressful

---

## User Mental Model

### Shift from Passive to Active

**Auto Mode (Spec 002)**:
```
User: "I'm receiving information"
System: "Here's the next chunk" [automatic]
Feeling: Passive observer, time passes
```

**Typing Mode (Spec 003)**:
```
User: "I'm earning each chunk"
System: "Type to unlock the next one" [gated]
Feeling: Active participant, time stretches
```

**Psychological difference**:
- **Auto**: External locus of control (system paces you)
- **Typing**: Internal locus of control (you pace system)

**Educational difference**:
- **Auto**: Recognition memory (did I see this word?)
- **Typing**: Recall memory (can I reproduce this word?)

**Typing mode is harder, but more effective for retention.**

---

## User Flows

### Flow 1: First-Time Typing Mode User

**Setup**:
```
User opens settings
      ↓
Sees "Progression Mode" dropdown
      ↓
Changes from "Auto" to "Typing"
      ↓
Saves settings
      ↓
Thinks: "I wonder how this works?"
```

**First session**:
```
User selects text, starts Archetype
      ↓
[Overlay opens]
      ↓
User sees: "Hello" at top, input field below
      ↓
Thinks: "Oh, I need to type the word!"
      ↓
Types: "hello" (lowercase)
      ↓
✓ Correct → Input clears
      ↓
Next chunk: "world"
      ↓
User understands the pattern
```

**Key moment**: Realization that typing advances chunks (not auto timer)

**Emotional arc**:
1. Curiosity: "What changed?"
2. Understanding: "Oh, I type the word!"
3. Engagement: "This is active, I like it"
4. Challenge: "Can I keep up?"

---

### Flow 2: Typing a Chunk

**Timeline** (user types "example"):

```
T=0ms:    Chunk "example" displayed at top
T=0ms:    Input field focused, cursor blinking
T=150ms:  User types "e"
T=300ms:  User types "ex"
T=450ms:  User types "exa"
T=600ms:  User types "exam"
T=750ms:  User types "examp"
T=900ms:  User types "exampl"
T=1050ms: User types "example"
T=1050ms: ✓ Match detected → "✓ Correct" appears
T=1350ms: Input clears, next chunk displayed
```

**What the user sees**:
- Word at top (target)
- Input field below (their typing)
- No feedback until complete match
- Green checkmark when correct
- Brief pause, then next chunk

**What the user feels**:
- Focus on target word
- Muscle memory activates (typing)
- Brief satisfaction at checkmark
- Anticipation for next word

**Cognitive process**:
1. **See**: Visual input (word recognition)
2. **Process**: Letter-by-letter encoding
3. **Type**: Motor execution (muscle memory)
4. **Verify**: Visual confirmation (match check)
5. **Reinforce**: Positive feedback (checkmark)

**Why this deepens learning**:
- Multiple encoding paths (visual + motor + semantic)
- Active retrieval (not passive recognition)
- Immediate feedback (reinforcement learning)

---

### Flow 3: Making a Typo

**Scenario**: User types "helo" instead of "hello"

**Timeline**:

```
T=0ms:    Chunk "hello" displayed
T=600ms:  User types "helo" (missing second 'l')
T=600ms:  No match detected (system waits)
T=1200ms: User presses Enter (force-check)
T=1200ms: "✗ Try again" appears (red text)
T=1800ms: User realizes mistake
T=2000ms: User backspaces: "hel"
T=2200ms: User types "hell"
T=2400ms: User types "hello"
T=2400ms: ✓ Match detected → "✓ Correct"
T=2700ms: Next chunk
```

**What the user experiences**:
1. Types word confidently
2. Expects checkmark, doesn't appear
3. Presses Enter (seeking validation)
4. Sees error message
5. Reviews what they typed
6. Spots mistake
7. Corrects it
8. Gets checkmark
9. **Feels relief + learning reinforcement**

**Why errors are valuable**:
- Mistakes create cognitive friction (deepens memory)
- Self-correction builds metacognition
- Overcoming error feels rewarding
- User remembers mistake longer than success

**Gentle error handling**:
- ❌ Don't: Flash red screen, make buzzer sound
- ✅ Do: Show brief text feedback, allow correction
- ❌ Don't: Lock them out, require restart
- ✅ Do: Let them fix it and continue

---

### Flow 4: Different Match Modes

**Lenient Mode** (default):
```
Target: "Hello"
User types: "hello" → ✓ Match (case-insensitive)
User types: " hello " → ✓ Match (trim whitespace)
User types: "Hello" → ✓ Match (exact)
User types: "helo" → ✗ No match (typo)
```

**Strict Mode**:
```
Target: "Hello"
User types: "Hello" → ✓ Match (exact)
User types: "hello" → ✗ No match (case matters)
User types: " Hello " → ✗ No match (whitespace matters)
```

**Fuzzy Mode**:
```
Target: "Hello"
User types: "Hello" → ✓ Match (exact)
User types: "hello" → ✓ Match (case-insensitive)
User types: "Helo" → ✓ Match (1 char typo = OK)
User types: "Hllo" → ✓ Match (1 char typo = OK)
User types: "Heo" → ✗ No match (2 char diff = too far)
```

**Which mode for which user?**

| User Type | Recommended Mode | Why |
|-----------|------------------|-----|
| Beginner speed reader | Lenient | Focus on speed, not typing precision |
| Touch typing learner | Strict | Practice accurate typing |
| Casual reader | Lenient | Forgiving, less frustrating |
| Power user | Fuzzy | Balance speed and accuracy |

**Default: Lenient** (most forgiving, lowest friction)

---

## Visual Design

### Layout with Typing Mode

```
┌──────────────────────────────────────────────────┐
│                                                   │
│                  [empty space]                    │
│                                                   │
│                                                   │
│               "current chunk"                     │
│           (target text, 48px, top)                │
│                                                   │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  [typing input field, 32px, centered]      │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│              ✓ Correct / ✗ Try again              │
│             (feedback, 24px, below input)         │
│                                                   │
│                  [empty space]                    │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Key visual hierarchy**:
1. **Target text** (largest, 48px): "This is what you need to type"
2. **Input field** (medium, 32px): "This is where you type"
3. **Feedback** (smallest, 24px): "This is your result"

**Spatial relationship**:
- Target above input: Natural top-to-bottom reading flow
- Input centered: Focus attention, symmetry
- Feedback below input: Close proximity (doesn't require eye movement)

---

### Input Field Design

**Visual states**:

1. **Default** (unfocused):
   ```
   ┌──────────────────────────────┐
   │  Type the text above...      │  ← Muted border
   └──────────────────────────────┘
   ```

2. **Focused** (active):
   ```
   ┌══════════════════════════════┐
   │  hello█                      │  ← Accent border, cursor visible
   └══════════════════════════════┘
   ```

3. **Correct match** (transient):
   ```
   ┌──────────────────────────────┐
   │  hello                       │  ← Green glow (optional)
   └──────────────────────────────┘
   
              ✓ Correct
   ```

4. **Incorrect match** (transient):
   ```
   ┌──────────────────────────────┐
   │  helo                        │  ← Red shake animation (optional)
   └──────────────────────────────┘
   
             ✗ Try again
   ```

**Why these states?**
- Default: Low-key, inviting
- Focused: Clear "you're here" indicator
- Correct: Positive reinforcement
- Incorrect: Gentle correction (not punishing)

---

### Feedback Indicators

**Success (✓ Correct)**:
- Color: Green (`var(--text-success)`)
- Font size: 24px, bold
- Duration: 300ms (visible while input clears)
- Feeling: "I got it right!"

**Error (✗ Try again)**:
- Color: Red (`var(--text-error)`)
- Font size: 24px, bold
- Duration: Persistent until corrected
- Feeling: "I need to fix this"

**Neutral (empty)**:
- No feedback shown
- Opacity: 0 (invisible but in DOM)
- User is mid-typing (no verdict yet)

**Why brief success, persistent error?**
- Success: Immediate reward, then move on (maintain flow)
- Error: Stays visible until fixed (clear action item)

---

## Interaction Patterns

### Auto-Focus Management

**Behavior**:
```
Overlay opens → Input auto-focuses (cursor ready)
User types, matches → Input clears → Auto-focus restored
User clicks overlay → Focus returns to input
```

**Why auto-focus?**
- Reduces friction (no need to click input)
- User can start typing immediately
- Maintains flow (no mouse interaction needed)

**Edge case: User clicks outside input**:
- Input loses focus (browser behavior)
- User expects to type, but keyboard does nothing
- **Solution**: Click on overlay background → refocus input

---

### Enter Key Behavior

**Current behavior**:
```
User typing → Presses Enter
      ↓
Force validation check
      ↓
If match: Progress to next chunk
If no match: Show "✗ Try again"
```

**User mental model**:
- Enter = "Submit" (universal convention)
- Expects explicit "I'm done typing" signal

**Why support Enter?**
- Some users prefer explicit submission
- Fuzzy mode may match before user is done (Enter confirms intent)
- Accessibility (some users can't rely on auto-match)

**Tradeoff**: Auto-match vs Enter-to-submit

| Approach | Pros | Cons |
|----------|------|------|
| Auto-match only | Seamless, fast, no extra key | May match too early |
| Enter-to-submit only | Explicit, user control | Extra keystroke (slower) |
| Both (current) | Flexible, supports both styles | Two ways to do one thing |

**Recommendation**: Keep both (current approach). Supports different user preferences.

---

### Backspace & Correction

**Behavior**:
```
User types "helo"
      ↓
No match (system waits)
      ↓
User presses Backspace → "hel"
      ↓
User types "l" → "hell"
      ↓
User types "o" → "hello"
      ↓
✓ Match detected
```

**User experience**:
- Natural correction flow (like any text input)
- No penalty for backspacing
- Real-time comparison continues as they type

**Why allow correction?**
- Typos are inevitable (human typing)
- Forcing restart would be punishing
- Self-correction deepens learning (metacognition)

---

### Escape Hatch (ESC Key)

**Behavior**:
```
User is stuck on difficult word
      ↓
Presses ESC
      ↓
Overlay closes immediately
      ↓
Back to normal Obsidian
```

**User mental model**:
- ESC = "Get me out" (universal convention)
- Expected in any modal or overlay

**Why essential?**
- User may get frustrated, need exit
- No "skip chunk" option (would game system)
- ESC is emergency exit

---

## Settings UX

### Progression Mode Setting

**Visual presentation**:
```
Progression Mode: [Auto ▼]
  Options:
  - Auto (timer-based)
  - Typing (type to progress)
```

**Setting description**:
```
How to advance to the next chunk:
- Auto: Chunks advance automatically at configured WPM
- Typing: Type each chunk to progress (active learning)

Tip: Typing mode improves retention but is slower.
```

**Why include tip?**
- Users may not understand tradeoff
- "Slower" might seem bad, but it's intentional
- Frames typing as learning tool, not speed tool

---

### Typing Match Mode Setting

**Visual presentation**:
```
Typing Match Mode: [Lenient ▼]
  Options:
  - Lenient (ignore case/spacing)
  - Strict (exact match required)
  - Fuzzy (allow minor typos)
```

**Setting description**:
```
How strictly to match your typing:
- Lenient: Ignores capitalization and extra spaces (easiest)
- Strict: Requires exact match including case (hardest)
- Fuzzy: Allows 1-2 typos (forgiving)

Tip: Start with Lenient, switch to Strict for typing practice.
```

**Why three modes?**
- **Lenient**: Most users, focus on speed reading
- **Strict**: Touch typing practice (accuracy training)
- **Fuzzy**: Middle ground (speed + some accuracy)

**Default: Lenient** (lowest friction for majority)

---

## Edge Case UX

### Long Chunks (Multi-Word Typing)

**Scenario**: User sets wordcount=5, gets chunk "The quick brown fox jumps"

**User experience**:
```
T=0ms:    Sees "The quick brown fox jumps"
T=0ms:    Input focused, ready to type
T=5000ms: Finishes typing entire phrase
T=5000ms: ✓ Correct → Next chunk
```

**UX challenges**:
- Longer typing time (5 words vs 1 word)
- More opportunities for typos
- Harder to spot mistakes in long phrase
- May feel tedious

**Is this a problem?**
- **For learning**: Yes, longer phrases encode better
- **For speed**: No, defeats typing mode purpose
- **For users**: Mixed (some prefer phrases, some prefer words)

**Recommendation**: Document in settings:
```
Note: Typing mode works best with 1-3 words per chunk.
Larger chunks may feel slow.
```

---

### Very Fast Typers (100+ WPM typing)

**Scenario**: User types 100 WPM (5 chars/second), 5-letter word in 1 second

**Comparison to auto mode**:
- Auto at 600 WPM: 1 word per 100ms
- Typing at 100 WPM: 1 word per 1000ms
- **Typing is 10× slower**

**User experience**:
- Typing mode feels much slower than auto
- But slower = better retention (research-backed)
- Fast typers may get bored

**Is this a problem?**
- **For speed reading goal**: Yes (typing is slower)
- **For learning goal**: No (slower is better)
- **For engagement**: Maybe (depends on user)

**Recommendation**: Frame expectation in settings:
```
Typing mode prioritizes learning over speed.
Expect 50-100 WPM effective reading rate.
```

---

### Mobile Keyboards

**Challenge**: On-screen keyboards (iOS/Android)

**Issues**:
1. **Keyboard covers 50% of screen**:
   - Target text may be hidden
   - Input field may be hidden
   - User can't see what they're typing

2. **Autocorrect interferes**:
   - Keyboard suggests corrections
   - May auto-replace user's typing
   - Breaks match comparison

3. **No tactile feedback**:
   - Harder to type accurately
   - More typos expected
   - Slower typing speed

**Current mitigation**:
```typescript
inputField.autocomplete = "off";
inputField.autocorrect = "off";
inputField.spellcheck = false;
```

**Remaining issues**:
- Keyboard covering screen (OS-level, can't fix)
- Viewport resizing when keyboard appears

**Recommended approach** (future):
- Detect mobile device
- Adjust layout: Move target text higher
- Adjust input position: Above keyboard
- Or: Warn that typing mode is desktop-optimized

---

### Paste/Copy Behavior

**Scenario**: User copies target text, pastes into input

**Current behavior**: Allowed (no prevention)

**User experience**:
```
User sees "Hello"
      ↓
User highlights "Hello" (can't actually select target text)
      ↓
User types Cmd/Ctrl+C (copies from elsewhere?)
      ↓
User pastes into input
      ↓
✓ Match detected → Next chunk
```

**Is this cheating?**
- **Yes**: Defeats purpose of typing mode
- **But**: Can't practically prevent it
- **And**: User chose typing mode (self-sabotage)

**Recommendation**: Allow it (trust user)
- If they're pasting, they're not learning
- But enforcing prevention is hard (contentEditable, etc.)
- User's choice, user's loss

---

### Focus Loss (User Clicks Outside)

**Scenario**: User clicks on overlay background (not input)

**Current behavior**: Input loses focus

**User experience**:
```
User is typing
      ↓
Accidentally clicks background
      ↓
Input loses focus, cursor disappears
      ↓
User types, nothing happens
      ↓
User confused: "Why isn't it working?"
```

**Recommended fix**:
```typescript
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    // User clicked background, not input
    inputField.focus(); // Restore focus
  }
});
```

**Better UX**:
- Click anywhere → refocus input (except if clicking to dismiss)
- Tradeoff: Harder to dismiss (must click outside overlay entirely)
- Alternative: Only margins dismissable, center clicks refocus

---

## Accessibility

### Keyboard-Only Users

**Current support**: ✅ Excellent (typing mode is keyboard-based)

**Navigation**:
- Tab: N/A (only one input element)
- Type: Direct interaction
- Enter: Submit
- ESC: Dismiss
- Backspace: Correct

**No mouse required**: Typing mode is fully keyboard-accessible

---

### Screen Reader Users

**Challenge**: Screen reader timing conflicts with visual typing

**Current state**: Limited support

**What screen reader announces**:
```
"Overlay, dialog"
"Text display: Hello"
"Input field: Type the text above"
[User types 'hello']
"Input field: hello"
```

**Issues**:
- Screen reader reads target and input separately (cognitive load)
- Real-time comparison not announced
- Success/error feedback may not be announced

**Recommended improvements**:
```html
<div aria-live="polite" aria-atomic="true">
  Chunk 5 of 120: Hello
</div>

<input aria-label="Type the displayed text" />

<div aria-live="assertive" aria-atomic="true">
  Correct! Next chunk.
</div>
```

**Better UX for screen readers**:
- Each chunk announced automatically
- Success/error feedback announced
- Progress context ("5 of 120")

---

### Motor Impairments

**Challenge**: Users with limited typing ability

**Issues**:
- Typing mode may be inaccessible (too slow or difficult)
- Strict mode may be impossible (typos inevitable)
- No alternative input method

**Current mitigation**: Offer auto mode (non-typing alternative)

**Future consideration**:
- Voice input (speech-to-text)
- Switch-based input (for severe impairments)
- Or: Accept that typing mode has accessibility limits

---

## Performance

### Input Latency

**Target**: <50ms from keypress to screen update

**Measurement**:
```
User presses 'h'
      ↓
Keydown event fires
      ↓
Input value updates ('h')
      ↓
Comparison function runs
      ↓
Screen repaints
      ↓
Total: <50ms
```

**Why <50ms?**
- Typing feels "direct" (no lag)
- User doesn't notice delay
- Maintains flow state

**How to achieve**:
- Lightweight comparison function
- Debounce to 16ms (max 60fps)
- No expensive DOM operations

---

### Comparison Performance

**Current algorithm**: String comparison (O(n) where n = string length)

**Worst case**: Fuzzy mode with Levenshtein distance (O(n×m))

**Typical timing**:
- Lenient: <1ms (simple lowercase + trim)
- Strict: <0.1ms (direct equality check)
- Fuzzy: <10ms (Levenshtein on 20-char word)

**Impact**: Negligible (<16ms, within one frame)

---

## Success Metrics

### Quantitative

- ✅ Typing mode adoption: >20% of users try it
- ✅ Typing mode retention: >50% who try it use again
- ✅ Input latency: <50ms (imperceptible)
- ✅ Error rate: <10% of chunks require correction (lenient mode)
- ✅ Completion rate: >80% finish sessions (don't quit mid-way)

### Qualitative

- ✅ Users report "better retention" vs auto mode
- ✅ Users describe typing mode as "active" or "engaging"
- ✅ Users feel typing rhythm is "meditative"
- ✅ Users don't feel frustrated by errors (forgiving UX)

---

## Comparison to Auto Mode

### When to Use Auto Mode

**Best for**:
- Skimming content (quick overview)
- High reading speed goal (600+ WPM)
- Passive learning (exposure, not mastery)
- Long sessions (10+ minutes)

**User mindset**: "I want to consume information quickly"

---

### When to Use Typing Mode

**Best for**:
- Deep learning (memorization, retention)
- Language learning (vocabulary practice)
- Active engagement (fighting mind wandering)
- Short sessions (5-10 minutes)

**User mindset**: "I want to truly learn this material"

---

### Can Users Switch Mid-Session?

**Current**: No (must close, change setting, restart)

**Future enhancement** (Spec 007?):
```
Press 'M' → Toggle mode (auto ↔ typing)
Visual indicator: "Auto Mode" or "Typing Mode" in corner
```

**Tradeoff**:
- Flexibility (switch based on content)
- Complexity (more UI, more state)
- Confusion (what mode am I in?)

**Recommendation**: Keep separate for now (clear mental model)

---

## Conclusion

Typing mode transforms Archetype from a **speed reading tool** into an **active learning system**.

**Core UX principles**:
1. **Engagement through effort**: Typing creates investment
2. **Forgiveness through options**: Lenient/strict/fuzzy modes
3. **Flow through rhythm**: Typing becomes meditative
4. **Learning through encoding**: Motor memory reinforces visual memory

**The result**: Users don't just read faster—they remember better.

**The tradeoff**: Slower speed, deeper learning. And that's exactly the point.

