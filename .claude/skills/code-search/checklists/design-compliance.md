# Design System Compliance Checklist

## Component Usage

- [ ] Components imported from `@retryvr/ui`
- [ ] No duplicate component implementations
- [ ] Existing components used before creating new ones
- [ ] Component props match design system API

## Color Tokens

- [ ] No raw hex colors in code
- [ ] Tailwind color classes from design system
- [ ] No arbitrary color values (`text-[#abc123]`)
- [ ] Dark mode colors defined

## Spacing & Layout

- [ ] Tailwind spacing scale used
- [ ] No arbitrary spacing values
- [ ] Consistent padding/margin patterns
- [ ] Responsive breakpoints from design system

## Typography

- [ ] Font family from design system
- [ ] Font sizes from typography scale
- [ ] Line heights appropriate
- [ ] Font weights from design tokens

## Icons

- [ ] Icons from approved icon library
- [ ] Consistent icon sizes
- [ ] Proper ARIA labels on icons
- [ ] Icon color matches design tokens

## Responsive Design

- [ ] Mobile-first approach
- [ ] Breakpoints match design system
- [ ] Touch targets 44x44px minimum
- [ ] Content readable at all sizes

## Accessibility

- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
