# Archetype Plugin - Specifications

This directory contains all feature specifications, domain models, and UX documentation for the Archetype plugin.

---

## 📖 Quick Navigation

### Start Here
- **[UX-INDEX.md](./UX-INDEX.md)** - UX documentation overview and index
- **[UX-OVERVIEW.md](./UX-OVERVIEW.md)** - High-level UX philosophy and principles

### Feature Specifications
1. **[001-chunk-display/](./001-chunk-display/)** - Full-screen display and visual stability
2. **[002-chunk-player/](./002-chunk-player/)** - Text processing and automatic progression
3. **[003-touch-typing-progression/](./003-touch-typing-progression/)** - Active learning through typing

---

## 📚 Documentation Types

### Technical Specifications (`spec.md`)
**Purpose**: Define functional and non-functional requirements

**Contents**:
- Problem statement
- Goals and non-goals
- Requirements
- Design (components, data flow)
- Implementation details
- Edge cases
- Testing scenarios

**Audience**: Developers, testers

---

### UX Documentation (`ux.md`)
**Purpose**: Define user experience goals and interaction design

**Contents**:
- User experience goals
- User flows (with timelines)
- Visual design details
- Interaction patterns
- Edge case UX
- Accessibility considerations
- Success criteria

**Audience**: Designers, developers, product managers

---

### Domain Documentation (`domain/`)
**Purpose**: Define domain models and ubiquitous language

**Contents**:
- Ubiquitous language definitions
- Domain model (entities, value objects, services)
- Terminology bridges
- Test plans

**Audience**: Developers (domain-driven design)

---

## 🗺️ Spec Overview

### Spec 001: Chunk Display
**Status**: ✅ Domain model implemented, UI in progress

**What it does**:
- Full-screen overlay for distraction-free reading
- Fixed-size display container (90vw × 70vh)
- Theme-aware styling (light/dark mode)
- Single-click dismissal

**Key files**:
- [spec.md](./001-chunk-display/spec.md) - Technical specification
- [ux.md](./001-chunk-display/ux.md) - UX details
- [domain/](./001-chunk-display/domain/) - Domain model documentation

**Implementation**:
- Domain layer: `src/domain/chunking/`, `src/domain/timing/`, `src/domain/progression/`
- UI layer: `src/views/`

---

### Spec 002: Chunk Player
**Status**: ⬜ Not yet implemented

**What it does**:
- Processes markdown text into clean word chunks
- Groups words according to `wordcount` setting
- Displays chunks at intervals determined by `wpm` setting
- Strips markdown formatting automatically
- Handles automatic session completion

**Key files**:
- [spec.md](./002-chunk-player/spec.md) - Technical specification
- [ux.md](./002-chunk-player/ux.md) - UX details

**Dependencies**:
- Spec 001 (display container required)

---

### Spec 003: Touch Typing Progression
**Status**: ⬜ Not yet implemented

**What it does**:
- Typing-based progression (alternative to auto timer)
- Real-time feedback on typing accuracy
- Configurable match modes (lenient/strict/fuzzy)
- Tracks typing speed and accuracy
- Mode switching between auto and typing

**Key files**:
- [spec.md](./003-touch-typing-progression/spec.md) - Technical specification
- [ux.md](./003-touch-typing-progression/ux.md) - UX details

**Dependencies**:
- Spec 001 (display container)
- Spec 002 (chunk creation)

---

## 🎯 Development Workflow

### For New Features

1. **Understand UX First**
   ```
   Read: UX-OVERVIEW.md → Feature-specific ux.md
   Goal: Understand user expectations before coding
   ```

2. **Read Technical Spec**
   ```
   Read: spec.md
   Goal: Understand requirements and design
   ```

3. **Study Domain Model** (if applicable)
   ```
   Read: domain/README.md → domain/model.md
   Goal: Understand domain concepts and relationships
   ```

4. **Implement with TDD**
   ```
   Write test → Implement → Pass → Refactor
   Reference: domain/test-plan.md for test cases
   ```

5. **Verify UX**
   ```
   Review: ux.md success criteria
   Goal: Ensure implementation meets UX goals
   ```

---

### For Code Reviews

**Check**:
1. ✅ Implementation matches technical spec
2. ✅ UX goals are met (user flows work as documented)
3. ✅ Domain terminology is correct (if using domain layer)
4. ✅ Edge cases are handled (see spec.md and ux.md)
5. ✅ Accessibility considerations addressed
6. ✅ Performance targets met

---

### For Testing

**Test sources**:
1. **spec.md** → "Testing Scenarios" section (functional tests)
2. **ux.md** → "User Flows" section (integration tests)
3. **domain/test-plan.md** → Domain layer unit tests

**Coverage goals**:
- Domain layer: 100%
- UI layer: 80%+
- Integration: All user flows

---

## 🧩 Spec Dependencies

```
Spec 001: Chunk Display (foundation)
    ↓
Spec 002: Chunk Player (builds on 001)
    ↓
Spec 003: Touch Typing (builds on 001 + 002)
```

**Implementation order**: Must implement in sequence (001 → 002 → 003)

---

## 📐 Design Principles (Across All Specs)

### 1. Distraction-Free Focus
- Full-screen overlay blocks everything
- No visible controls during reading
- Simple dismissal (click anywhere)

### 2. Zero Cognitive Load
- Auto progression (no buttons to click)
- Settings configured before session
- Natural interaction patterns (typing, clicking)

### 3. Immediate Feedback
- First chunk displays at T=0
- Real-time typing feedback (<50ms)
- Instant overlay open/close

### 4. Visual Stability
- Fixed-size containers (no layout shift)
- Consistent positioning
- Predictable behavior

### 5. Theme Integration
- Uses Obsidian CSS variables
- Adapts to light/dark mode
- No custom color configuration

### 6. Progressive Engagement
- Start passive (auto mode)
- Evolve to active (typing mode)
- User chooses engagement level

**Read more**: [UX-OVERVIEW.md](./UX-OVERVIEW.md)

---

## 🎨 Visual Design Language

### Typography
```
Display text: 48px, line-height 1.4
Input text: 32px
Feedback text: 24px, bold
```

### Colors
```
Background: var(--background-primary)
Text: var(--text-normal)
Borders: var(--text-muted) / var(--interactive-accent)
Success: var(--text-success)
Error: var(--text-error)
```

### Spacing
```
Overlay: 100vw × 100vh (full-screen)
Display: 90vw × 70vh (centered)
Margins: 5vw/5vh (clickable)
```

**Read more**: [UX-OVERVIEW.md - Visual Design Language](./UX-OVERVIEW.md#visual-design-language)

---

## ♿ Accessibility Standards

### Current Support
- ✅ Theme integration (light/dark)
- ✅ Large text sizes
- ✅ Keyboard input (typing mode)
- ✅ Large click targets

### Planned Improvements
- ⬜ ESC key dismissal
- ⬜ Screen reader support (ARIA)
- ⬜ Focus management
- ⬜ Respect `prefers-reduced-motion`
- ⬜ Configurable text sizes

**Read more**: Each spec's `ux.md` has "Accessibility" section

---

## ⚡ Performance Targets

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Overlay open | <16ms | <100ms | >200ms |
| Chunk transition | <16ms | <50ms | >100ms |
| Typing feedback | <16ms | <50ms | >100ms |
| Click dismissal | <16ms | <50ms | >100ms |
| Text processing (10K words) | <100ms | <500ms | >1s |

**Why these numbers?**
- 16ms = 60fps (one frame)
- <100ms = perceived as instant
- \>200ms = noticeable lag

**Read more**: [UX-OVERVIEW.md - Performance Expectations](./UX-OVERVIEW.md#performance-expectations)

---

## 📊 Success Metrics

### Feature Adoption
- **Auto mode**: 80%+ of users try it
- **Typing mode**: 20%+ of users try it
- **Typing retention**: 50%+ continue using

### User Satisfaction
- Users report "flow state" experience
- Users feel they read faster
- Typing users report better retention
- Interface "disappears"

### Technical Performance
- Zero layout shifts (measured)
- 60fps during sessions
- No memory leaks (30+ min sessions)

**Read more**: Each spec's `ux.md` has "Success Criteria" section

---

## 🔮 Future Specs (Planned)

### Spec 004: Pause/Resume Controls
- SPACE key to pause/resume
- Visual pause indicator
- Resume from exact position

### Spec 005: Progress Indicators
- Optional progress bar (bottom of screen)
- "X / Y chunks" counter
- Estimated time remaining

### Spec 006: Reading Statistics
- Post-session summary (typing mode)
- WPM calculation
- Accuracy percentage
- Time per chunk

### Spec 007: Mode Switching
- Mid-session toggle (auto ↔ typing)
- Keyboard shortcut ('M' key)
- Visual mode indicator

### Spec 008: Adaptive Timing
- Detect reading speed
- Auto-adjust WPM
- Personalized pacing

**Note**: These are ideas, not committed features. Prioritize based on user feedback.

---

## 📁 Directory Structure

```
specs/
├── UX-INDEX.md              # This file
├── UX-OVERVIEW.md           # High-level UX philosophy
│
├── 001-chunk-display/
│   ├── spec.md              # Technical specification
│   ├── ux.md                # UX details
│   ├── PROGRESS.md          # Implementation status
│   ├── FUTURE-*.md          # Future enhancement ideas
│   └── domain/              # Domain model documentation
│       ├── README.md
│       ├── model.md
│       ├── ubiquitous-language.md
│       ├── TERMINOLOGY-BRIDGE.md
│       └── test-plan.md
│
├── 002-chunk-player/
│   ├── spec.md              # Technical specification
│   └── ux.md                # UX details
│
└── 003-touch-typing-progression/
    ├── spec.md              # Technical specification
    └── ux.md                # UX details
```

---

## 🤝 Contributing

### Adding a New Spec

1. **Create directory**: `specs/00X-feature-name/`

2. **Create spec.md** with sections:
   - Overview
   - Problem Statement
   - Goals / Non-Goals
   - Requirements
   - Design
   - Implementation
   - Edge Cases
   - Testing Scenarios

3. **Create ux.md** with sections:
   - User Experience Goals
   - User Flows
   - Visual Design Details
   - Interaction Patterns
   - Edge Case UX
   - Accessibility
   - Success Criteria

4. **Update this index**:
   - Add to "Spec Overview"
   - Update dependency diagram
   - Add to directory structure

5. **Create domain docs** (if needed):
   - `domain/README.md`
   - `domain/model.md`
   - `domain/ubiquitous-language.md`

---

### Updating Existing Specs

**When code changes**:
1. Update `spec.md` if requirements change
2. Update `ux.md` if user experience changes
3. Update domain docs if domain model changes
4. Keep docs in sync with implementation

**When user feedback received**:
1. Note feedback in `ux.md` (add to "Edge Case UX" or "User Feedback" section)
2. Decide: Quick fix or new spec?
3. Update success metrics if needed

---

## 🔗 Related Documentation

- **[AGENTS.md](../AGENTS.md)** - Development workflow and agent context
- **[inbox/BACKLOG.md](../inbox/BACKLOG.md)** - Current tasks and decisions
- **[TESTING.md](../TESTING.md)** - Testing strategy
- **[README.md](../README.md)** - Project overview

---

## 🎓 Learning Path

### For New Developers

**Week 1: Understanding**
1. Read UX-OVERVIEW.md
2. Read Spec 001 (spec.md + ux.md)
3. Read domain/ubiquitous-language.md
4. Explore existing code in `src/domain/`

**Week 2: Domain Layer**
1. Read domain/model.md
2. Read domain/test-plan.md
3. Run existing tests
4. Implement a small domain class

**Week 3: UI Layer**
1. Read Spec 002 (spec.md + ux.md)
2. Explore UI code in `src/views/`
3. Understand integration points
4. Implement a small UI component

**Week 4: Integration**
1. Read Spec 003 (spec.md + ux.md)
2. Implement a full feature end-to-end
3. Write integration tests
4. Get code review

---

### For UX Designers

**Focus on**:
1. UX-OVERVIEW.md (principles)
2. Each spec's ux.md (flows and feedback)
3. Success criteria (metrics)
4. Edge case UX (pain points)

**Skip**:
- Technical implementation details
- Domain model internals
- Test plans

**Collaborate on**:
- New feature UX flows
- Accessibility improvements
- User feedback analysis

---

### For Product Managers

**Focus on**:
1. UX-OVERVIEW.md (vision)
2. Each spec's "Problem Statement" and "Goals"
3. Success metrics
4. Future specs (roadmap)

**Use for**:
- Feature prioritization
- User story writing
- Stakeholder communication
- Success measurement

---

## 📞 Questions?

**About UX decisions**: See feature-specific `ux.md` files
**About technical implementation**: See `spec.md` files
**About domain model**: See `domain/` directories
**About development workflow**: See [AGENTS.md](../AGENTS.md)

---

## 📝 Maintenance

This index should be updated when:
- ✅ New specs are added
- ✅ Spec statuses change (⬜ → 🔄 → ✅)
- ✅ Directory structure changes
- ✅ New documentation types are added
- ✅ Design principles evolve

**Last updated**: 2025-12-13

