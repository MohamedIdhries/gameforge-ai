# Frontend Design System & Taste Guide — GameForge AI

Use this skill when designing, building, or refining user interfaces to deliver $10K agency-level web design.

---

## 🎨 1. Design System Tokens & Philosophy

### Core Aesthetic
- **Cyber-SaaS Premium:** Dark, sleek, futuristic aesthetic tailored for indie game developers.
- **Glassmorphism & Glow:** Subtle backdrop blurs (`backdrop-blur-xl`), semi-transparent surfaces (`bg-slate-900/90`), and glowing neon accent borders (`border-cyan-500/30`).
- **No Generic AI Slop:** Avoid repetitive generic white text on gray boxes. Every section must have hierarchy, intentional contrast, and micro-interactions.

---

## 📐 2. Spacing & Grid System (8px Base Grid)

- **Base Unit:** 8px (`0.5rem` / `2` in Tailwind)
- **Container Margins & Padding:**
  - Section Padding: `py-16` (64px) to `py-24` (96px)
  - Card Internal Padding: `p-6` (24px) to `p-8` (32px)
  - Grid Gaps: `gap-6` (24px) to `gap-8` (32px)
- **Border Radius:**
  - Cards: `rounded-2xl` (16px) or `rounded-3xl` (24px)
  - Buttons & Inputs: `rounded-xl` (12px)
  - Badges & Chips: `rounded-full` or `rounded-lg` (8px)

---

## 🔤 3. Typography & Hierarchy Scale

- **Display Headline (Hero):** `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]`
- **Section Heading (H2):** `text-3xl sm:text-4xl font-extrabold text-white tracking-tight`
- **Sub-heading (H3):** `text-xl sm:text-2xl font-bold text-white`
- **Body Text:** `text-sm sm:text-base text-slate-300 leading-relaxed`
- **Micro Labels / Badges:** `text-xs uppercase tracking-widest font-bold`

---

## 🎨 4. Color Palette Tokens

- **Background:** `#080c14` (Deep Space Dark)
- **Surface Elevation 1:** `#0f172a` (Slate 900)
- **Surface Elevation 2:** `#090d16` (Slate 950)
- **Accent Cyan:** `#06b6d4` (Primary Glow & Highlights)
- **Accent Purple:** `#8b5cf6` (Secondary AI Power)
- **Accent Pink:** `#ec4899` (BG Removal & Variations)
- **Accent Emerald:** `#10b981` (Pipeline Success & Optimization)
- **Borders:** `border-slate-800/80` with hover `hover:border-cyan-500/60`

---

## ⚡ 5. Framer Motion Rules & Patterns

Always use Framer Motion for interactive components and page reveals.

### Standard Fade & Slide Up Reveal:
```tsx
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};
```

### Staggered Grid Container:
```tsx
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
```

### Interactive Hover Spring:
```tsx
const hoverScale = {
  whileHover: { scale: 1.03, y: -4 },
  whileTap: { scale: 0.98 }
};
```

---

## 🧱 6. 21st.dev Component Standards

- **Hero Sections:** High contrast title, glowing ambient backdrop blur, dual call-to-action buttons, live interactive pipeline demo.
- **Card UI:** Inner ambient shadow, subtle border highlight on hover, status indicator pills.
- **Interactive Tabs:** Smooth layout transitions, high visibility active state, code block copy triggers.
- **Floating Controls:** Sticky header with project context switcher, status indicators, quick action buttons.
