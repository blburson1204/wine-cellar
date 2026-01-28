---
name: ui-accessibility
description: Use when specs include UI components (forms, tables, modals, charts) - validates WCAG 2.2 compliance, keyboard navigation, screen reader compatibility, and identifies hover-only interactions that exclude keyboard/touch users
context:fork
---

## When This Skill Applies

Invoke when spec.md includes ANY frontend UI work:

- Forms (inputs, selects, buttons)
- Data tables or grids
- Modals, dialogs, overlays
- Charts, graphs, visualizations
- Drag-and-drop interactions
- Image galleries or media

## Accessibility Audit Workflow

**Run systematic WCAG 2.2 compliance validation:**

```
Skill: code-search

Validate accessibility using wcag-accessibility.md checklist.

Scope:
- WCAG 2.2 Level AA compliance (perceivable, operable, understandable, robust principles)
- Keyboard navigation (tab order, focus indicators, keyboard shortcuts, no keyboard traps, skip links)
- Screen reader compatibility (semantic HTML, ARIA labels, roles, live regions, announcements)
- Forms accessibility (labels, error announcements, required fields, focus management)
- Interactive elements (modals, dropdowns, tooltips, keyboard alternatives, focus traps)
- Visual accessibility (color contrast, text sizing, reduce motion, high contrast mode)
- Data visualization (alt text, data tables, screen reader alternatives)

Apply hierarchical drill-down:
1. Structure scan - component files, semantic HTML usage, ARIA attribute presence
2. Interface scan - label associations, keyboard handlers, focus management
3. Implementation - actual keyboard flow, screen reader output, contrast ratios

Collect evidence with:
- Missing labels or ARIA attributes
- Keyboard navigation gaps
- Hover-only interactions
- Missing alternatives for complex UI

BLOCK on: Forms without labels, modals without keyboard support, hover-only interactions, charts without data alternatives.
```

**Output validation report** with BLOCKING issues requiring spec updates.

## BLOCKING Requirements

Spec must explicitly address these for UI features:

### Forms (MANDATORY for any form spec)

- [ ] Every input has associated `<label>` documented
- [ ] Error announcement strategy (how do screen readers hear validation
      errors?)
- [ ] Focus management (where does focus go after form submission/error?)
- [ ] Required field indicators (visual AND programmatic)

### Interactive Elements

- [ ] Keyboard alternative for hover-only interactions
- [ ] Keyboard alternative for drag-and-drop
- [ ] Focus trap for modals (focus cannot escape overlay)
- [ ] Escape key closes modals

### Data Visualization

- [ ] Alt text content specified (not just "add alt text" but WHAT it should
      say)
- [ ] Data table alternative for charts
- [ ] Screen reader access strategy for complex visualizations

### Dynamic Content

- [ ] Loading state announcements (aria-live or equivalent)
- [ ] Progress indicator accessibility
- [ ] Step/page change announcements for wizards

## Red Flags (Auto-BLOCKING)

| Phrase in Spec                       | Problem                         | Required Fix                        |
| ------------------------------------ | ------------------------------- | ----------------------------------- |
| "on hover" without alternative       | Excludes keyboard/touch users   | Add "or focus" and keyboard trigger |
| "drag and drop" without alternative  | Excludes keyboard users         | Add button/keyboard alternative     |
| Form with no label mention           | Form inaccessible               | Document label strategy             |
| "click to open modal"                | May not work for screen readers | Document keyboard activation        |
| Chart/graph with no data alternative | Data inaccessible               | Require data table or text summary  |

## ADVISORY (Recommended)

- WCAG 2.2 Level AA target documented
- Color contrast ratios for custom colors
- Touch target size for mobile (44x44px minimum)
- Animation pause/reduce-motion support

## Validation Output

```yaml
accessibility_validation:
  status: BLOCKING | PASS
  issues:
    - type: form_without_labels
      location: '## Feature: Registration Form'
      fix: 'Add label requirements for each input'
```

## Reference

WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/ Existing
pattern: `@retryvr/ui` components handle most accessibility - validate they're
being used.
