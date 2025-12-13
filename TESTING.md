# Testing Guide

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are co-located with source files:
```
src/
├── ArchetypePlugin.ts
├── ArchetypePlugin.test.ts
├── modals/
│   ├── ViewModal.ts
│   └── ViewModal.test.ts
└── ...
```

## Mocking Obsidian API

The Obsidian API is automatically mocked via `src/__mocks__/obsidian.ts`.

### Example Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchetypePlugin } from './ArchetypePlugin';

vi.mock('obsidian');

describe('ArchetypePlugin', () => {
  let plugin: ArchetypePlugin;

  beforeEach(() => {
    plugin = new ArchetypePlugin();
    plugin.loadData = vi.fn().mockResolvedValue({});
    plugin.saveData = vi.fn().mockResolvedValue(undefined);
  });

  it('should load settings', async () => {
    await plugin.loadSettings();
    expect(plugin.settings).toBeDefined();
  });
});
```

## Coverage

Coverage reports are generated in the `coverage/` directory.
View the HTML report at `coverage/index.html`.

