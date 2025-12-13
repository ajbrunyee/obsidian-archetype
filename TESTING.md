# Testing Guide - Speed Reading Feature

## Setup

1. **Build the plugin:**
   ```bash
   npm run build
   ```

2. **Copy to Obsidian vault:**
   - Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/obsidian-archetype/` folder
   - Or use `npm run dev` for hot reload during development

3. **Enable plugin:**
   - Open Obsidian Settings → Community plugins
   - Enable "Archetype"

## Testing the Speed Reading Feature

### Basic Test

1. **Open a note** with some text
2. **Select text** (try a paragraph or two)
3. **Run command:**
   - Open Command Palette (Cmd/Ctrl + P)
   - Type "Start speed reading"
   - Press Enter

**Expected behavior:**
- Full-screen overlay appears with theme-matched background
- Selected text displays in segments (3 words at a time)
- Segments advance automatically based on reading speed (300 WPM)
- Click anywhere to dismiss and stop playback

### Test Cases

#### TC-1: Basic Display
- **Setup**: Select "The quick brown fox jumps over the lazy dog"
- **Expected**: 
  - Segment 1: "The quick brown"
  - Segment 2: "fox jumps over"
  - Segment 3: "the lazy dog"
  - Each displays for ~600ms (3 words at 300 WPM)

#### TC-2: Theme Compatibility
- **Setup**: Select any text
- **Test in light mode**: Background should match light theme
- **Test in dark mode**: Background should match dark theme
- **Expected**: Overlay uses `var(--background-primary)` and adapts

#### TC-3: Click Dismissal
- **Setup**: Start speed reading
- **Action**: Click anywhere on overlay
- **Expected**: Overlay immediately closes, playback stops

#### TC-4: Hyphenated Words
- **Setup**: Select "A well-known state-of-the-art solution works"
- **Expected**: 
  - "A well-known state-of-the-art" (keeps hyphenated words intact)
  - "solution works"

#### TC-5: Empty Selection
- **Setup**: Place cursor without selecting text
- **Action**: Run speed reading command
- **Expected**: Notice saying "Please select some text to read"

#### TC-6: Layout Stability
- **Setup**: Select text with varying lengths
- **Expected**: Display window never resizes (fixed 90vw × 70vh)

#### TC-7: Completion
- **Setup**: Select short text (2-3 words)
- **Expected**: Displays segment, then automatically closes after completion

### Manual Testing Checklist

- [ ] Overlay appears full-screen
- [ ] Text is centered and readable (48px font)
- [ ] Background matches theme
- [ ] Segments don't break hyphenated words
- [ ] Click dismisses immediately
- [ ] Display window doesn't resize
- [ ] Completes gracefully at end
- [ ] Works with different text lengths
- [ ] Handles special characters correctly
- [ ] Performance is smooth (60fps)

## Known Limitations

1. **No pause/resume** - Once started, can only stop by clicking
2. **No speed adjustment** - Fixed at 300 WPM
3. **No progress indicator** - Can't see how far through the text
4. **No ESC key** - Only click to dismiss (ESC is future enhancement)
5. **Fixed segment size** - Always 3 words (no customization yet)

## Troubleshooting

### Overlay doesn't appear
- Check browser console for errors
- Verify plugin is enabled
- Check text is actually selected

### Text is cut off
- Expected behavior for very long segments
- Uses `overflow: hidden` (no scrolling)

### Background color wrong
- Check Obsidian theme CSS variables
- Verify `var(--background-primary)` is defined

### Segments advance too fast/slow
- Currently fixed at 300 WPM
- Timing calculation: (wordCount / 300) * 60000 ms

## Next Steps for Testing

After basic functionality works:
1. Test with real reading materials
2. Gather WPM comfort level feedback
3. Test with different screen sizes
4. Test with custom themes
5. Measure comprehension retention

## Development Mode

For development with hot reload:
```bash
npm run dev
```

Changes will rebuild automatically. Refresh Obsidian to see updates.

## Debug Mode

Add console logging in SegmentPlayer for debugging:
```typescript
console.log('Current segment:', this.progression.currentChunk?.content);
console.log('Duration:', duration, 'ms');
console.log('State:', this.progression.state);
```
