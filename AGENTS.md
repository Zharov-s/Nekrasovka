# AGENTS.md

## Goal
Adapt the landing page for mobile, tablet, laptop, and desktop without changing brand identity or core content hierarchy.

## Project context
This project is local and lives in a folder on the Desktop, not on GitHub.
Treat the current working directory as the source of truth.
Do not assume access to a remote repository.

## Devices to support
- Mobile: 320–479px
- Large mobile: 480–767px
- Tablet: 768–1023px
- Laptop: 1024–1279px
- Desktop: 1280px+

## Primary task
Make the landing page fully responsive across all breakpoints.
Preserve the current visual language, spacing rhythm, and messaging.
Do not redesign the product from scratch.
Improve layout, readability, and interaction quality on smaller screens.

## Layout rules
- Use a mobile-first approach.
- Prefer fluid layouts with flex/grid before adding custom media queries.
- Reduce horizontal padding on small screens.
- Prevent horizontal scroll at every breakpoint.
- Stack multi-column sections into one column on mobile unless a two-column layout remains clearly readable.
- Keep hero, social proof, features, pricing, FAQ, and CTA sections visually balanced at all sizes.
- Ensure cards, badges, buttons, and media blocks wrap cleanly.
- Do not let headings or CTA rows overflow.

## Typography rules
- Scale headings, body text, and spacing by breakpoint.
- Preserve hierarchy, but shorten line length on small screens.
- Keep body text readable without zoom.
- Avoid oversized hero text on mobile.
- Buttons and nav labels must remain readable and not wrap awkwardly.

## Navigation and header
- Convert desktop navigation into a mobile-friendly pattern when needed.
- Keep the primary CTA always easy to reach.
- Make sticky/fixed header behavior safe on mobile viewport height changes.
- Ensure open/close states, overlays, and menus are keyboard accessible.

## Forms and interactions
- Mobile input font size must be at least 16px.
- Touch targets should be at least 44x44px.
- Do not disable pinch zoom.
- Preserve visible focus states.
- Hover-only interactions must have touch-safe alternatives.

## Images and media
- Make images responsive and prevent layout shifts.
- Preserve aspect ratio where needed.
- Avoid oversized media downloads on mobile if simpler variants are possible.
- Background visuals must not hide important text on small screens.

## Accessibility
- Keep WCAG 2.2 AA level where practical.
- Maintain semantic structure.
- Preserve keyboard navigation.
- Ensure contrast remains acceptable after responsive changes.
- Do not remove outlines unless replaced with visible focus styles.

## Performance constraints
- Do not add heavy UI libraries just for responsiveness.
- Reuse existing components and tokens.
- Prefer CSS/layout fixes over JavaScript workarounds.
- Avoid unnecessary DOM duplication unless there is a strong responsive reason.

## Implementation expectations
- Update only what is needed for responsiveness and layout quality.
- Reuse existing design tokens, spacing scale, and component patterns.
- Keep code simple and maintainable.
- Add comments only where the reasoning is non-obvious.

## Deliverables
1. Responsive code changes
2. Brief summary of what changed by breakpoint
3. List of any risky areas or visual compromises
4. Manual QA checklist for:
   - 320px
   - 375px
   - 768px
   - 1024px
   - 1440px

## Verification
Before finishing:
- check for horizontal overflow
- check nav/menu states
- check all CTA buttons
- check forms and inputs on mobile
- check section spacing consistency
- check heading wrapping
- check image scaling
- check keyboard navigation
- check Lighthouse/mobile issues if available

## Output format
When done, provide:
- changed files
- summary of responsive fixes
- remaining issues, if any
- exact breakpoints tested
