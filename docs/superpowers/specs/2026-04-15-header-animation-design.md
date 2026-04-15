# Header Animation & Polish — Design

**Date:** 2026-04-15
**Component:** `src/components/Header.tsx`
**Scope:** Single component, no new dependencies.

## Goal

Превратить текущий хедер (мгновенный toggle мобильного меню, бинарное переключение прозрачный → белый) в «cool» плавный хедер: анимированное появление при загрузке, auto-hide при скролле, плавное мобильное меню с stagger-анимацией пунктов, полированные микро-интеракции. Без добавления зависимостей (только Tailwind + CSS + React state).

## Behaviour

### 1. Mount animation (on page load)

- Хедер появляется один раз при маунте: `-translate-y-full opacity-0` → `translate-y-0 opacity-100`.
- Длительность: 600ms.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out).
- Реализация: `useEffect` ставит `mounted=true` после первого кадра; класс применяется условно.

### 2. Scroll behaviour (Linear/Stripe-style)

Три состояния, вычисляемые из `scrollY` и направления скролла:

| Состояние | Условие | Стиль |
|---|---|---|
| **top** | `scrollY < 20` | прозрачный, без shadow, текст белый (поверх hero) |
| **visible-scrolled** | `scrollY >= 20` И (скролл вверх ИЛИ `scrollY < 120`) | белый `bg-white/90 backdrop-blur-xl`, текст тёмный, тонкий shadow |
| **hidden** | `scrollY >= 120` И скролл вниз | `translate-y-[-100%]` (прячется) |

- При скролле вверх после hidden → выезжает обратно (`translate-y-0`).
- Threshold hidden = 120px (чтобы не прятался слишком рано у hero).
- Переход между состояниями: `transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`.
- Blur-intensity меняется не мгновенно — через тот же 500ms transition на `backdrop-blur`.

### 3. Mobile menu (open/close)

- Меню раскрывается через **grid-rows trick**: обёртка с `grid grid-rows-[0fr]` → `grid-rows-[1fr]`, внутри `min-h-0 overflow-hidden`. Это даёт плавную анимацию высоты от 0 до авто без magic numbers.
- Длительность контейнера: 400ms, easing тот же expo-out.
- Пункты навигации (`NAV_LINKS` + divider + телефон + кнопка): stagger fade-in + slide-left.
  - Каждый пункт: `opacity-0 -translate-x-2` → `opacity-100 translate-x-0`.
  - Длительность пункта: 350ms.
  - Задержка `i * 50ms` через inline `style={{ transitionDelay }}`.
  - При закрытии пункты не staggered — исчезают синхронно вместе с контейнером.
- Иконка Menu/X: плавный crossfade+rotate вместо мгновенной замены (2 иконки в одном контейнере, одна видна в зависимости от состояния).

### 4. Micro-interactions

- **Nav links (desktop):** подчёркивание `::after` псевдоэлементом (через `relative` + абсолютный `span` под текстом). `scale-x-0` → `scale-x-100`, origin `center`, 300ms. Цвет подчёркивания: `currentColor`.
- **Кнопка "Консультация":**
  - Hover: `-translate-y-0.5` + `shadow-lg shadow-primary/25` (в scrolled) / `shadow-white/20` (в top).
  - Active: `translate-y-0 scale-[0.98]`.
- **Логотип:** на hover `tracking-tight` → немного плотнее (или масштаб `scale-[1.02]`), 300ms.

### 5. Accessibility

- `prefers-reduced-motion: reduce` → все transition-durations становятся `0ms`. Реализация: обёртка `motion-safe:` / `motion-reduce:` классов Tailwind, либо media query в globals.css для `*` в хедере.
- `aria-expanded={isMenuOpen}` на кнопке бургера.
- `aria-controls="mobile-menu"` + соответствующий `id`.
- `aria-hidden` на скрытом мобильном меню, когда закрыто.
- Focus-visible: `focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2` на всех интерактивных элементах.

## Implementation notes

- Новый стейт: `mounted`, `scrolled`, `hidden` (вместо одного `isScrolled`). `lastScrollY` в ref.
- Scroll handler: throttle через `requestAnimationFrame` (не `setTimeout`).
- Cleanup: `removeEventListener` в return из `useEffect`.
- Никаких новых зависимостей (framer-motion не ставим, всё на Tailwind).

## Out of scope

- Mega-menu / dropdowns — нет.
- Theme switcher — нет.
- Переработка navigation структуры — нет, используем существующий `NAV_LINKS`.
- Изменение Footer или других компонентов — нет.

## Files touched

- `src/components/Header.tsx` — основные изменения.
- `src/app/globals.css` — возможно, одно утилитарное правило для `prefers-reduced-motion` если Tailwind-вариантов не хватит (ожидается, что хватит).

## Success criteria

- Хедер плавно появляется при загрузке страницы.
- При скролле вниз прячется, при скролле вверх возвращается.
- Мобильное меню плавно раскрывается с stagger-анимацией пунктов.
- Нет новых зависимостей.
- `prefers-reduced-motion` respected.
- Визуально проверено в браузере на десктопе и мобильной ширине.
