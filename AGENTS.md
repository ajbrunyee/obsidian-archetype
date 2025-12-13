# Agent Context & Development Notes

## Project Overview

Obsidian plugin for active learning through speed reading and touch typing.

## Development Approach

### Spec-Driven Development
Implement features incrementally following the specifications in `specs/`:

1. **Spec 001**: Chunk Display ([specs/001-chunk-display/spec.md](specs/001-chunk-display/spec.md))
2. **Spec 002**: Chunk Player ([specs/002-chunk-player/spec.md](specs/002-chunk-player/spec.md))
3. **Spec 003**: Touch Typing Progression ([specs/003-touch-typing-progression/spec.md](specs/003-touch-typing-progression/spec.md))

### Workflow per Spec
```bash
# Create feature branch
git checkout -b spec-00X-feature-name

# Implement the spec incrementally
# Make commits as you go

# Merge back to main
git checkout main
git merge spec-00X-feature-name
```

## Planning & Context

For detailed planning, tasks, and development notes, see:
- **`inbox/BACKLOG.md`** - Development backlog and detailed tasks (not tracked in git)

## Reference Files
- [BACKLOG.md](BACKLOG.md) - Feature backlog and vision
- [NAME.md](NAME.md) - Project naming and branding notes
- [RENAME_PLAN.md](RENAME_PLAN.md) - Renaming strategy notes
- [VERIFICATION.md](VERIFICATION.md) - Testing and verification notes

## Notes for AI Agents

### Context Preservation
When working on this project:
1. Always check this file for current status
2. Check `inbox/BACKLOG.md` for detailed tasks and context
3. Follow the spec-driven approach - implement specs in order
4. Update planning files with progress and decisions made
5. Keep git history clean with meaningful commits

### Development Standards
- Follow TypeScript best practices
- Use Obsidian API conventions
- Write clear, descriptive commit messages
- Test changes in actual Obsidian environment when possible
- Document public APIs and complex logic
