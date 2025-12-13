# Plugin Rename Plan: Flashread → Archetype

## Overview
Rename the plugin from "Obsidian Flashread" to "Obsidian Archetype" to better reflect the dual-channel learning approach (speed reading + touch typing) and the philosophical/neuroscientific foundations of the plugin.

---

## Files to Modify

### 1. **manifest.json**
**Purpose**: Obsidian reads this file to identify the plugin and display it in the community plugins list.

**Changes needed**:
```json
{
  "id": "obsidian-archetype",              // CHANGE: from "obsidian-flashread"
  "name": "Archetype",                     // CHANGE: from "Obsidian Flashread"
  "version": "1.0.0",                      // KEEP (or reset to "0.1.0" for new plugin)
  "minAppVersion": "0.12.0",              // KEEP
  "description": "Learn through speed reading and active typing. Dual-channel engagement for deeper retention.",  // CHANGE
  "author": "Anthony Brunyee",            // CHANGE: from "AlexAndHisScripts"
  "authorUrl": "https://github.com/[YOUR_GITHUB_USERNAME]",  // CHANGE
  "isDesktopOnly": true                   // KEEP
}
```

**Impact**: 
- Changes the plugin ID (may require reinstall if already installed)
- Changes display name in Obsidian settings
- Updates description in plugin browser

---

### 2. **package.json**
**Purpose**: npm/Node.js package configuration.

**Changes needed**:
```json
{
  "name": "obsidian-archetype",           // CHANGE: from "obsidian-flashread"
  "version": "1.0.0",                     // KEEP (or reset to "0.1.0")
  "description": "Learn through speed reading and active typing.",  // CHANGE
  "main": "main.js",                      // KEEP
  "scripts": { ... },                     // KEEP
  "keywords": ["obsidian", "learning", "speed-reading", "typing", "active-learning"],  // CHANGE
  "author": "Anthony Brunyee",            // CHANGE: from ""
  "license": "GPLv3",                     // KEEP
  "devDependencies": { ... }              // KEEP
}
```

**Impact**: 
- Changes package name for npm
- Updates description for package managers

---

### 3. **src/main.ts**
**Purpose**: Main plugin code containing classes, interfaces, and logic.

#### Changes needed:

**Interfaces**:
```typescript
// CHANGE: FlashreadSettings → ArchetypeSettings
interface ArchetypeSettings {
  wpm: string;
  wordcount: string;
}

// CHANGE: DEFAULT_SETTINGS type
const DEFAULT_SETTINGS: ArchetypeSettings = {
  wpm: '600',
  wordcount: '1'
}
```

**Main Plugin Class**:
```typescript
// CHANGE: Flashread → Archetype
export default class Archetype extends Plugin {
  settings: ArchetypeSettings;  // CHANGE type
  // ... rest of code
}
```

**Command ID and Name**:
```typescript
this.addCommand({
  id: 'archetype-speed-read',        // CHANGE: from 'SpeedReadCmd'
  name: 'Speed Read',                // KEEP (or change to 'Learn with Archetype')
  editorCallback: (editor, view) => {
    // ... 
  }
});
```

**Settings Tab Class**:
```typescript
// CHANGE: FlashreadSettingsTab → ArchetypeSettingsTab
class ArchetypeSettingsTab extends PluginSettingTab {
  plugin: Archetype;  // CHANGE type
  
  constructor(app: App, plugin: Archetype) {  // CHANGE type
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h2', {text: 'Archetype'});  // CHANGE: from 'Obsidian Flashread'
    // ... rest of settings UI
  }
}
```

**CSS Class References** (in onOpen method):
```typescript
// Line 78: CHANGE class name
this.overlay.classList.add("archetype-overlay");  // from "flashread-overlay"

// Line 84: CHANGE class name  
displayerNode.classList.add("archetype-displayer");  // from "flashread-displayer"
```

**Impact**:
- Changes internal class and interface names
- Updates command ID (users may need to update any hotkeys)
- Updates settings page title
- Changes CSS class references

---

### 4. **styles.css**
**Purpose**: Plugin-specific styling.

**Changes needed**:
```css
/* CHANGE: .flashread-overlay → .archetype-overlay */
.archetype-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: var(--background-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* CHANGE: .flashread-displayer → .archetype-displayer */
.archetype-displayer {
  width: 90vw;
  height: 70vh;
  min-width: 90vw;
  min-height: 70vh;
  max-width: 90vw;
  max-height: 70vh;
  font-size: 48px;
  line-height: 1.4;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  word-wrap: break-word;
  white-space: normal;
}
```

**Impact**: 
- Updates CSS selectors to match new class names in TypeScript
- No functional changes, purely cosmetic namespace update

---

### 5. **README.md**
**Purpose**: User-facing documentation.

**Changes needed**:
```markdown
# Obsidian Archetype

Learn through speed reading and active typing. Obsidian plugin that combines dual-channel engagement for deeper content retention.

## About

Archetype uses speed reading combined with typing-based progression to create the ideal learning pattern. The name references both the **arcuate fasciculus** (the neural pathway connecting language comprehension to production) and the philosophical concept of an **archetype** (the perfect, original form).

### Usage
1. Install plugin from repo or the Obsidian store (name: "Archetype")
2. Set your WPM and words per chunk in: Settings → Plugin Options → Archetype
3. Open a document in **edit mode**
4. Select the text you want to learn
5. Open Command Palette and run: "Archetype: Speed Read"
6. Read the text as it appears (click anywhere to stop)

## Features
- **Speed Reading**: Display text at configurable WPM rates
- **Chunk Control**: Choose how many words appear at once
- **Distraction-Free**: Full-screen overlay for focused reading
- **Theme-Aware**: Automatically adapts to Obsidian's light/dark theme

## Roadmap
See BACKLOG.md for planned features including:
- Touch typing progression mode (type to advance)
- Pause/resume controls
- Progress indicators
- Reading statistics

## Philosophy

Learn more about the naming and conceptual foundations in [NAME.md](NAME.md).
```

**Impact**: 
- Updates all references from Flashread to Archetype
- Adds context about the plugin's philosophy
- Updates command names and paths

---

### 6. **versions.json** (Check if exists)
If this file tracks version history, update plugin name references.

---

## Execution Order

Execute changes in this order to avoid breaking references:

1. ✅ **styles.css** - Rename CSS classes (no dependencies)
2. ✅ **src/main.ts** - Update all TypeScript code (classes, interfaces, CSS references)
3. ✅ **manifest.json** - Update plugin metadata
4. ✅ **package.json** - Update package metadata
5. ✅ **README.md** - Update user documentation
6. ✅ **Rebuild** - Run `npm run build` to compile changes
7. ✅ **Test** - Reload plugin in Obsidian vault

---

## Definition of Done

All traces of the old name and author must be removed. Use this checklist to verify:

### Files - Complete Rename
- [ ] `manifest.json` - No "flashread" references, author updated
- [ ] `package.json` - No "flashread" references, author updated
- [ ] `src/main.ts` - No "Flashread" class/interface names
- [ ] `src/main.ts` - No "flashread" CSS class references
- [ ] `styles.css` - No `.flashread-*` class names
- [ ] `README.md` - No "flashread" or "Obsidian Flashread" references
- [ ] `BACKLOG.md` - No old plugin name references (if applicable)
- [ ] `LICENSE` - Copyright updated to "Anthony Brunyee" only
- [ ] `versions.json` - No old plugin references (if file exists)

### Code - No Old References
- [ ] Search entire codebase for "flashread" (case-insensitive) → 0 results
- [ ] Search entire codebase for "AlexAndHisScripts" → 0 results
- [ ] Search entire codebase for old GitHub URLs → 0 results
- [ ] All TypeScript interfaces renamed to `Archetype*`
- [ ] All TypeScript classes renamed to `Archetype*`
- [ ] All CSS classes use `archetype-` prefix
- [ ] Command ID uses `archetype-` prefix

### Repository - Clean History
- [ ] Git history removed (`rm -rf .git`)
- [ ] Fresh git repo initialized
- [ ] Initial commit message references only "Archetype"
- [ ] Remote URL points to new `obsidian-archetype` repo
- [ ] No references to old fork/upstream in git config

### Build - Functional
- [ ] `npm run build` completes without errors
- [ ] `main.js` generated successfully
- [ ] No console errors mentioning old names

### Verification Commands
Run these to ensure complete removal:

```bash
# Search for any "flashread" references (should return nothing)
grep -ri "flashread" . --exclude-dir=node_modules --exclude-dir=.git

# Search for old author (should return nothing)
grep -ri "AlexAndHisScripts" . --exclude-dir=node_modules --exclude-dir=.git

# Search for old GitHub URLs (should return nothing)
grep -ri "github.com/AlexAndHisScripts" . --exclude-dir=node_modules --exclude-dir=.git

# Verify new names are present
grep -ri "archetype" . --exclude-dir=node_modules --exclude-dir=.git | wc -l
# Should return multiple results

# Verify new author is present
grep -ri "Anthony Brunyee" . --exclude-dir=node_modules --exclude-dir=.git
# Should find results in manifest.json, package.json, LICENSE
```

### Testing - Functionality
- [ ] Plugin appears as "Archetype" in Obsidian settings
- [ ] Settings page shows "Archetype" heading
- [ ] Command Palette shows "Archetype: Speed Read" (or similar)
- [ ] Command executes and displays overlay correctly
- [ ] Overlay uses `.archetype-overlay` and `.archetype-displayer` classes
- [ ] Clicking overlay closes it properly
- [ ] Settings persist after reload
- [ ] Theme switching works (light/dark mode)

### Final Sign-Off
- [ ] All files reviewed for old references
- [ ] All grep searches return clean results
- [ ] Plugin works correctly in Obsidian
- [ ] Ready to push to new remote repository

---

## Rollback Plan

If issues arise:
1. Revert all changes via git: `git checkout HEAD~1`
2. Run `npm run build`
3. Reload plugin in Obsidian

---

## Migration Notes for Users

**If plugin is already installed:**
- The plugin ID change from `obsidian-flashread` to `obsidian-archetype` means users may need to:
  1. Uninstall the old version
  2. Install the new version
  3. Re-configure settings (WPM, word count)
  4. Update any custom hotkeys assigned to commands

**Backward Compatibility:**
- Settings data structure remains unchanged (wpm, wordcount)
- CSS classes change but this is transparent to users
- Command IDs change (may affect custom hotkeys)

---

## Additional Files to Consider

### Optional updates:
- **BACKLOG.md** - Update plugin name references if they exist
- **LICENSE** - Update copyright holder name and year (Anthony Brunyee, 2024)
- **.gitignore** - No changes needed
- **tsconfig.json** - No changes needed (compiler settings)
- **data.json** - User settings file (shouldn't modify, but note structure compatibility)

---

## Summary of Changes

| File | Change Type | Critical? |
|------|-------------|-----------|
| manifest.json | Plugin ID, name, description | ✅ Yes |
| package.json | Package name, description | ✅ Yes |
| src/main.ts | Classes, interfaces, CSS refs | ✅ Yes |
| styles.css | CSS class names | ✅ Yes |
| README.md | Documentation | ⚠️ Important |
| versions.json | Version history | ℹ️ Optional |
| BACKLOG.md | References | ℹ️ Optional |

---

## Repository Migration - Fresh Start

Since you're rewriting the implementation from specs (and the speed reading concept is common across many tools), you can start fresh:

### Clean Slate Approach

```bash
# 1. Update all code/metadata files (following plan above)

# 2. Remove existing git history
rm -rf .git

# 3. Initialize fresh git repo
git init
git add .
git commit -m "Initial commit: Archetype plugin for Obsidian

Obsidian plugin for active learning through speed reading and typing.
Implements dual-channel engagement (visual input + motor output)
for deeper content retention.

Features:
- Speed reading with configurable WPM
- Chunk-based text display
- Full-screen distraction-free overlay
- Theme-aware styling
- Prepared for touch typing progression mode"

# 4. Create new GitHub repo (name: obsidian-archetype)
# Don't initialize with README

# 5. Add remote and push
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/obsidian-archetype.git
git push -u origin main
```

### Optional: Rename Local Directory
```bash
cd ..
mv obsidian-flashread obsidian-archetype
cd obsidian-archetype
```

---

## Post-Rename Tasks

1. ✅ Update all code files (following plan above)
2. ✅ Update LICENSE with your copyright
3. ✅ Create new GitHub repository: `obsidian-archetype`
4. ✅ Initialize fresh git history
5. ✅ Push to new repository
6. 📝 Update marketplace listing when published
7. 📝 Create proper README with philosophy and usage

