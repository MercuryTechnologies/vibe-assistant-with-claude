# Rules Configuration Test: Before vs After

## Test Date: 2026-01-16

---

## BEFORE STATE

### typography.mdc
- **Has frontmatter:** ❌ NO
- **Expected behavior:** Rule may not be properly recognized by Cursor. May be treated as plain text or have undefined application behavior.

### components.mdc
- **globs format:** `src/components/**/*.tsx` (string)
- **alwaysApply:** not set (defaults to false)
- **Expected behavior:** The string format may cause parsing issues. Rule should apply intelligently but glob matching may be unreliable.

### border-radius.mdc  
- **globs format:** `**/*.tsx, **/*.css` (comma-separated string)
- **alwaysApply:** true
- **Expected behavior:** Multiple globs as comma-separated string may not parse correctly. Could fail to match intended files.

### Other rules (already correct)
- icons.mdc ✅
- no-tailwind.mdc ✅
- component-patterns.mdc ✅
- figma-color-mapping.mdc ✅
- figma-implementation-workflow.mdc ✅

---

## TEST PROMPTS

Use these prompts to test rule behavior before and after changes:

### Test 1: Typography Rule Application
**Prompt:** "Add a new heading to the Dashboard page"
**Expected BEFORE:** May not consistently apply Arcadia font rules
**Expected AFTER:** Should always reference typography.css classes and Arcadia font family

### Test 2: Components Glob Matching
**Prompt:** "Create a new button variant in src/components/ui/"
**Expected BEFORE:** May not trigger components.mdc guidance
**Expected AFTER:** Should suggest adding to component registry, following DS patterns

### Test 3: Border Radius Enforcement
**Prompt:** "Style this card with rounded corners"
**Expected BEFORE:** Glob parsing may fail, could suggest arbitrary border-radius values
**Expected AFTER:** Should enforce 4-tier system (rounded-sm/md/lg/full)

### Test 4: Cross-rule consistency
**Prompt:** "Build a filter dropdown component"
**Expected BEFORE:** Inconsistent application of design system rules
**Expected AFTER:** All relevant rules (typography, components, border-radius, icons) should apply

---

## AFTER STATE ✅ CHANGES APPLIED

### typography.mdc
- **Has frontmatter:** ✅ YES (FIXED)
- **description:** "Typography rules for the Mercury design system - always use Arcadia font family"
- **globs:** ["src/**/*.tsx", "src/**/*.css"]
- **alwaysApply:** true
- **Change:** Added complete frontmatter block

### components.mdc
- **globs format:** ["src/components/**/*.tsx"] ✅ (FIXED - now array)
- **alwaysApply:** false (apply intelligently based on description)
- **Change:** Converted globs from string to array format, explicitly set alwaysApply

### border-radius.mdc
- **globs format:** ["**/*.tsx", "**/*.css"] ✅ (FIXED - now array)
- **alwaysApply:** true
- **Change:** Converted comma-separated string to proper array format

---

## EXPECTED BEHAVIOR CHANGES

| Rule | Before | After |
|------|--------|-------|
| typography.mdc | May not apply (no frontmatter) | Will always apply to .tsx/.css files |
| components.mdc | Unreliable glob matching | Reliable matching + intelligent application |
| border-radius.mdc | Possible glob parse failure | Proper multi-file matching |

### Key Improvements:

1. **Typography enforcement is now guaranteed** - The rule will consistently apply to all React components and CSS files, ensuring Arcadia font usage.

2. **Component guidelines apply intelligently** - When you work in `src/components/`, Cursor will recognize the context and apply the component development guidelines.

3. **Border radius rules parse correctly** - Both `.tsx` and `.css` files will now properly trigger the 4-tier border radius system enforcement.

---

## HOW TO TEST

1. Open a new chat in Cursor
2. Try each test prompt above
3. Observe which rules are applied (check if the guidance matches rule content)
4. Compare behavior between before/after states

Note: You can see which rules are applied by checking if the AI mentions:
- Arcadia font family (typography.mdc)
- Component registry (components.mdc)
- 4-tier border radius system (border-radius.mdc)
- --ds-* CSS variables (figma-color-mapping.mdc)
