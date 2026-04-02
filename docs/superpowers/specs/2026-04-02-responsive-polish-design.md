# Full Responsive Adaptation & Polish

**Date:** 2026-04-02
**Approach:** Approach 2 — Full polish with Framer Motion (no form refactor)

## Scope

Complete mobile adaptation of all 11 sections, replacement of CSS-only animations with Framer Motion for 60fps smoothness, technical fixes (viewport, unused deps, image optimization, accessibility).

---

## Section 1: Critical Fixes & Infrastructure

### Viewport Meta Tag
- Add `export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }` to `layout.tsx`
- Currently missing entirely — critical mobile rendering bug

### Safe Area Insets
- Add `viewport-fit=cover` to viewport config
- Use `env(safe-area-inset-bottom)` on FloatingWhatsApp and other fixed elements

### Touch Targets
- All interactive elements minimum 44x44px
- Audit: footer links, nav links, FAQ question buttons, quiz option buttons

### Unused Dependencies
- Remove from package.json: `react-hook-form`, `@hookform/resolvers`, `class-variance-authority`
- Keep `zod` — used in API route validation

### Image Optimization
- HeroSection: keep `sizes="100vw"` (full-bleed background, correct), verify `priority` prop is present for LCP
- All other images: ensure lazy loading (no `priority` prop)
- WhyUsSection: already correct (`sizes="(min-width: 768px) 50vw, 100vw"`)

---

## Section 2: Mobile Adaptation by Component

### Header / Mobile Menu
- Animate menu open/close with Framer Motion (slide-down + fade)
- Stagger menu items with 0.05s delay
- Add backdrop overlay (dark semi-transparent) when menu is open
- Close on backdrop tap
- Close on swipe up (optional, stretch goal)

### HeroSection
- Change `min-h-[90vh]` to `min-h-[80vh] md:min-h-[90vh]`
- Stats row: adaptive gaps `gap-4 md:gap-8`

### ContactSection
- Make email field visible on all screen sizes (remove `hidden md:block`)
- Contact info grid: `grid-cols-1 sm:grid-cols-2` (was always `grid-cols-2`)

### ValuesCards
- Remove `min-h-[220px]`, use `min-h-0` on mobile
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (was `md:grid-cols-3` only)

### QuizSection
- Keep `grid-cols-2` on mobile but increase button padding and min-height for touch targets
- Ensure touch-friendly sizing (min 48px height per option)

### FAQSection
- Gap: `gap-3 md:gap-4`
- Question touch area: minimum 48px height

### Footer
- Adaptive gaps: `gap-6 md:gap-8`

### FloatingWhatsApp
- Position: `bottom-4 right-4 sm:bottom-6 sm:right-6`
- Add `pb-[env(safe-area-inset-bottom)]` padding
- Z-index: `z-[60]` (above header's z-50)

---

## Section 3: Animations (Framer Motion)

### AnimatedSection Replacement
- Replace IntersectionObserver-based component with Framer Motion `motion.div` + `whileInView`
- `viewport={{ once: true, amount: 0.1 }}` to match current threshold behavior
- Spring physics: `damping: 25, stiffness: 120`

Animation presets (same 4 types, smoother):
- `fade-up`: `{ y: 30, opacity: 0 }` → `{ y: 0, opacity: 1 }`
- `fade-left`: `{ x: -30, opacity: 0 }` → `{ x: 0, opacity: 1 }`
- `fade-right`: `{ x: 30, opacity: 0 }` → `{ x: 0, opacity: 1 }`
- `scale`: `{ scale: 0.95, opacity: 0 }` → `{ scale: 1, opacity: 1 }`

Stagger for lists: `staggerChildren: 0.08`

### Mobile Menu Animation
- `AnimatePresence` wrapper
- Container: height 0 → auto, opacity fade
- Items: stagger slide-in from left, 0.05s delay
- Exit: reverse animation

### Quiz Step Transitions
- `AnimatePresence mode="wait"`
- Current step exits left with fade-out
- New step enters from right with fade-in

### FAQ Accordion
- `motion.div` with `animate={{ height: "auto" }}`
- Replaces CSS max-height hack for smooth content reveal

### Testimonials Carousel
- Slide animation on switch: current slides out, new slides in from opposite direction

### Hover Effects
- Cards (services, values): `whileHover={{ y: -4 }}` with shadow increase
- Disabled on touch devices via `@media (hover: hover)`

### Header Scroll
- Keep existing CSS transition (sufficient for blur effect)

---

## Section 4: General Polish

### Smooth Scroll
- `scroll-behavior: smooth` in globals.css on `html`
- `scroll-margin-top: 80px` on all section anchors (header height offset)

### Text Overflow
- `break-words` on testimonial text, names, FAQ answers
- `break-all` on emails/phones in contact section

### Adaptive Spacing
- All grid gaps: `gap-4 md:gap-6 lg:gap-8` (currently many are fixed `gap-8`)

### Focus Styles
- Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to all interactive elements
- Remove default outline in favor of ring

### Loading States
- Submit buttons (contact form, quiz, testimonial form): spinner + disabled state during submission
- Prevent double-click submissions

### Prefers Reduced Motion
- Use Framer Motion `useReducedMotion()` hook
- When reduced motion preferred: show content immediately, no animations

### WhatsApp Pulse
- CSS keyframes pulse animation on the WhatsApp button
- Subtle scale + shadow pulse, 2s interval
- Slightly smaller on mobile: 48px vs 56px

### Consistent Border Radius
- All cards: `rounded-2xl`
- All buttons: `rounded-xl`
- Audit and unify across all components

---

## Files to Modify

1. `src/app/layout.tsx` — viewport meta, font loading
2. `src/app/globals.css` — smooth scroll, scroll-margin, pulse keyframes, focus styles
3. `src/components/AnimatedSection.tsx` — full rewrite to Framer Motion
4. `src/components/Header.tsx` — mobile menu animation, touch targets
5. `src/components/HeroSection.tsx` — responsive min-height, gaps
6. `src/components/ServicesSection.tsx` — hover effects, adaptive gaps
7. `src/components/ValuesCards.tsx` — responsive grid, remove min-h
8. `src/components/WhyUsSection.tsx` — minor gap adjustments
9. `src/components/QuizSection.tsx` — step transitions, touch targets
10. `src/components/FAQSection.tsx` — accordion animation, gaps, touch area
11. `src/components/ContactSection.tsx` — show email on mobile, responsive grid
12. `src/components/TestimonialsSection.tsx` — carousel slide animation
13. `src/components/FloatingWhatsApp.tsx` — safe area, pulse, z-index, size
14. `src/components/TestimonialForm.tsx` — loading state
15. `src/components/Footer.tsx` — adaptive gaps, touch targets
16. `package.json` — add framer-motion, remove unused deps

## New Dependency

- `framer-motion` (~30KB gzipped) — animation library

## Dependencies to Remove

- `react-hook-form`
- `@hookform/resolvers`
- `class-variance-authority`
