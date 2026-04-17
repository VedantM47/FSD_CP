# Git Merge Conflict Resolution

## Problem
PostCSS was failing to parse `SingleHackathon.css` with the error:
```
at Parser.unknownWord
at Parser.decl
```

## Root Cause
The CSS file contained **Git merge conflict markers** that were accidentally committed:
- `<<<<<<< HEAD`
- `=======`
- `>>>>>>> 1aaf7158a97c4cd0f3907c063abc4a46726cbc1a`

These markers are not valid CSS syntax and caused the parser to fail.

## Conflicts Found and Resolved

### Conflict 1: Tabs Container Styling (Line ~144)
```css
/* BEFORE (with conflict) */
<<<<<<< HEAD
  top: 72px;
  background: #F2F2F2; 
  z-index: 999;
  margin-bottom: 80px;
=======
  top: 80px;
  background: #F4F7F9;
  z-index: 10;
>>>>>>> 1aaf7158a97c4cd0f3907c063abc4a46726cbc1a

/* AFTER (resolved) */
  top: 72px;
  background: #F2F2F2; 
  z-index: 999;
  margin-bottom: 80px;
```

**Resolution:** Kept HEAD version with correct values.

### Conflict 2: Content Card Scroll Margin (Line ~188)
```css
/* BEFORE (with conflict) */
<<<<<<< HEAD
  scroll-margin-top: 240px;
  margin-top: 0;
  margin-bottom: 24px;
}

/* AFTER (resolved) */
  scroll-margin-top: 240px;
  margin-top: 0;
  margin-bottom: 24px;
}
```

**Resolution:** Kept HEAD version with increased scroll margin.

### Conflict 3: Last Content Card (Line ~210)
```css
/* BEFORE (with conflict) */
.sh-content-card:last-of-type {
  margin-bottom: 40px;
=======
  scroll-margin-top: 120px;
>>>>>>> 1aaf7158a97c4cd0f3907c063abc4a46726cbc1a
}

/* AFTER (resolved) */
.sh-content-card:last-of-type {
  margin-bottom: 40px;
}
```

**Resolution:** Removed conflicting scroll-margin-top, kept proper closing.

### Conflict 4: Duplicate Styles Section (Line ~598)
```css
/* BEFORE (with conflict) */
<<<<<<< HEAD
=======
/* 3. The Navbar "Magic Fix" */
.sh-content-card {
  scroll-margin-top: 120px !important;
}
.sh-tabs-container {
  position: sticky !important;
  top: 80px !important;
}
>>>>>>> 1aaf7158a97c4cd0f3907c063abc4a46726cbc1a

/* AFTER (resolved) */
/* Removed entire conflicting section */
```

**Resolution:** Removed duplicate/conflicting styles from merge branch.

## Files Modified
- `src/client/src/styles/SingleHackathon.css`

## Verification
After resolution:
- ✅ Open braces: 121
- ✅ Close braces: 121
- ✅ Balanced: YES
- ✅ No merge conflict markers remaining
- ✅ PostCSS parsing successful

## How to Avoid This

### 1. Check for Merge Conflicts Before Committing
```bash
git status
git diff
```

### 2. Search for Conflict Markers
```bash
grep -r "<<<<<<< HEAD" .
grep -r "=======" .
grep -r ">>>>>>>" .
```

### 3. Use Git Tools
Most IDEs highlight merge conflicts:
- VS Code: Shows conflicts with colored backgrounds
- Git GUI tools: Provide merge conflict resolution interfaces

### 4. Test Build After Merge
```bash
npm run build
# or
npm run dev
```

## Result
✅ CSS file is now valid
✅ PostCSS can parse the file
✅ Build process works correctly
✅ All styling changes preserved from HEAD
✅ Conflicting old styles removed

## Key Values Kept (from HEAD)
- Tabs `top: 72px` (correct navbar offset)
- Tabs `margin-bottom: 80px` (physical spacing)
- Tabs `z-index: 999` (proper stacking)
- Content `scroll-margin-top: 240px` (proper scroll offset)
- Background `#F2F2F2` (correct color)

## Discarded Values (from merge branch)
- Tabs `top: 80px` (incorrect)
- Tabs `z-index: 10` (too low)
- Content `scroll-margin-top: 120px` (insufficient)
- Background `#F4F7F9` (wrong color)
- Duplicate `!important` overrides (bad practice)
