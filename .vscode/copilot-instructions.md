# 🤖 Copilot Instructions - Resort Website Transplant Project

## 📌 Project Context

**CRITICAL: This is a website TRANSPLANT project, NOT a new build or simple migration.**

### The Mission
You are helping transplant the **resort website functionality** from `resort-old` into the **modern architecture** of `resort-new` (currently a dental clinic). Think of it as organ transplant surgery - we keep the healthy body (resort-new architecture) and replace the organs (dental content/features) with resort organs (resort-old content/features).

### Project Folders
- **`resort-old/`** - The DONOR (Island Resort website, older architecture, source of content/features)
- **`resort-new/`** - The HOST BODY (Dental clinic, modern architecture, target for transplant)
- **Goal**: Resort website with `resort-new`'s quality and `resort-old`'s business logic

---

## 🎯 Core Principles - READ FIRST!

### ✅ DO:
1. **Preserve `resort-new` architecture** - Keep the modern structure, component patterns, and tech stack
2. **Adapt, don't copy** - Transform `resort-old` code to fit `resort-new` patterns
3. **Use Shadcn/ui components** - Leverage the better UI library in `resort-new`
4. **Follow existing patterns** - Match the code style and structure of `resort-new`
5. **Keep it modular** - Maintain clean, reusable component structure
6. **Implement progressively** - Work phase by phase as outlined in `todo.md`
7. **Reference both projects** - Look at `resort-old` for features, `resort-new` for implementation patterns
8. **Update `todo.md`** - Check off tasks as completed and update progress
9. **Maintain TypeScript types** - Keep strong typing throughout
10. **Think about UX** - Make it better than both original projects

### ❌ DON'T:
1. **Don't blindly copy from `resort-old`** - The code needs adaptation to new architecture
2. **Don't break `resort-new` patterns** - Don't introduce inconsistent code styles
3. **Don't remove reusable components** - Keep good UI components from `resort-new`
4. **Don't skip phases** - Follow the logical order in `todo.md`
5. **Don't mix architectures** - Don't create hybrid messes
6. **Don't leave dental references** - Clean up ALL clinic/dental terminology
7. **Don't ignore existing utilities** - Use `resort-new`'s helper functions
8. **Don't create duplicate components** - Reuse what exists when possible
9. **Don't break responsive design** - Maintain mobile-first approach
10. **Don't forget accessibility** - Keep ARIA labels and semantic HTML

---

## 🏗️ Architecture Guidelines

### Tech Stack to Use (from `resort-new`)
```
✅ Next.js 15.3 (App Router)
✅ React 18
✅ TypeScript
✅ Shadcn/ui + Radix UI components
✅ TanStack Query (React Query)
✅ React Hook Form + Zod validation
✅ Tailwind CSS + tailwindcss-animate
✅ Framer Motion (for animations)
✅ Next-themes (dark mode support)
✅ FastAPI backend (Python)
```

### Features to Port (from `resort-old`)
```
🏖️ Resort booking system
🏨 Accommodations management
🎢 Activities/theme park features
👤 User authentication
💳 Payment processing
📊 Admin dashboard
📅 Booking calendar
🗺️ Maps/location features (react-leaflet)
```

---

## 📂 Project Structure Reference

### Page Mapping
```
resort-old → resort-new transformation:

OLD                          NEW (Target)
├── app/page.tsx            → app/page.tsx (resort home)
├── app/about/              → app/about/
├── app/accommodations/     → app/accommodations/
├── app/activities/         → app/activities/
├── app/booking/            → app/booking/
├── app/contact/            → app/contact/
├── app/my-bookings/        → app/my-bookings/
├── app/admin/              → app/admin/ (adapt existing)
├── app/login/              → app/login/ (adapt existing)
└── app/api/                → app/api/ (new resort endpoints)

REMOVE from resort-new:
├── app/appointments/       ❌ Delete
├── app/book-appointment/   ❌ Delete
├── app/clinics/            ❌ Delete
└── app/services/           ❌ Delete
```

### Component Patterns
```
Use resort-new patterns:
✅ Shadcn/ui components (Button, Card, Dialog, Form, etc.)
✅ React Hook Form for forms
✅ Zod schemas for validation
✅ TanStack Query for data fetching
✅ Proper TypeScript interfaces

Adapt from resort-old:
🔄 Business logic (booking flow, payment logic)
🔄 Data models (transform to new backend)
🔄 Feature requirements
🔄 Content and copy
```

---

## 🔄 Data Model Transformation

### Backend Strategy
```
OLD: Prisma ORM + SQLite
    ↓ TRANSFORM TO ↓
NEW: FastAPI + SQLite/SQLAlchemy (or Firebase)

Key Models to Transform:
- User (CUSTOMER, ADMIN roles)
- Accommodation (rooms, suites, villas)
- Activity (theme park, water sports, tours)
- Booking (reservations, dates, guests)
- Payment (transactions, pricing)
```

### API Pattern
```typescript
// Use TanStack Query pattern from resort-new
import { useQuery, useMutation } from '@tanstack/react-query';

// Example:
const { data: accommodations } = useQuery({
  queryKey: ['accommodations'],
  queryFn: () => fetch('/api/accommodations').then(r => r.json())
});
```

---

## 🎨 UI/UX Guidelines

### Component Usage Priority
1. **First**: Check if Shadcn/ui has the component
2. **Second**: Check if `resort-new` has a custom component
3. **Third**: Adapt component from `resort-old`
4. **Last**: Create new component following `resort-new` patterns

### Styling Approach
```tsx
// Use Tailwind + CVA pattern from resort-new
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        highlighted: "border-primary bg-primary/5"
      }
    }
  }
);
```

### Animation Guidelines
```tsx
// Use Framer Motion from resort-new style
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {content}
</motion.div>
```

---

## 📋 Task Execution Workflow

### When Given a Task:

1. **Read `todo.md`** - Understand current phase and context
2. **Check both projects** - Look at `resort-old` for requirements, `resort-new` for patterns
3. **Plan adaptation** - How to transform old code to new architecture
4. **Implement** - Write code following `resort-new` patterns
5. **Test mentally** - Does it fit the architecture? Is it consistent?
6. **Update `todo.md`** - Mark completed tasks with [x]

### Code Review Checklist (Before Suggesting Code):
```
□ Does it follow resort-new's TypeScript patterns?
□ Does it use Shadcn/ui components when available?
□ Is it properly typed with interfaces/types?
□ Does it use TanStack Query for data fetching?
□ Does it use React Hook Form + Zod for forms?
□ Is it responsive and accessible?
□ Are there no dental/clinic references?
□ Does it match the existing code style?
□ Is it properly documented if complex?
□ Would it integrate smoothly with existing code?
```

---

## 🗣️ Communication Guidelines

### When Responding:
1. **Be specific** - Reference exact files and line numbers
2. **Explain transformations** - Why you're adapting code a certain way
3. **Show both** - What it was (resort-old) vs what it should be (resort-new pattern)
4. **Flag issues** - Point out potential problems early
5. **Suggest improvements** - Don't just port, make it better
6. **Track progress** - Mention which phase/task you're working on

### Example Good Response:
```
"I'll adapt the AccommodationCard from resort-old to use Shadcn/ui 
components. Instead of custom CSS, we'll use Card, CardHeader, 
CardContent from Shadcn/ui, matching the pattern in resort-new's 
ServiceCard component. This also adds dark mode support automatically."
```

### Example Bad Response:
```
"I'll copy the component from resort-old."
❌ No adaptation plan, doesn't consider architecture
```

---

## 🚨 Warning Signs to Avoid

### Red Flags in Code:
```tsx
// ❌ BAD - Copying old patterns
import styles from './old-component.module.css';
import { PrismaClient } from '@prisma/client';

// ✅ GOOD - Using new patterns
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
```

### Content Red Flags:
```
❌ "dental", "dentist", "clinic", "appointment", "teeth", "patient"
✅ "resort", "hotel", "accommodation", "booking", "guest", "vacation"
```

---

## 📊 Progress Tracking

### Before Starting Each Session:
1. Read current status in `todo.md`
2. Identify which phase we're in
3. Understand dependencies

### After Completing Tasks:
1. Update `todo.md` with checked boxes
2. Update phase progress percentages
3. Note any blockers or issues
4. Suggest next logical steps

---

## 🎓 Learning from Both Projects

### What `resort-old` Teaches Us:
- Resort business logic and workflows
- Required features and functionality
- Content structure and copy
- User journeys and flows
- Domain-specific requirements

### What `resort-new` Teaches Us:
- Modern React/Next.js patterns
- Component composition strategies
- State management approaches
- Form handling best practices
- UI/UX patterns that work
- Code organization principles

---

## 🔍 File Reference Quick Guide

### Always Check These First:
```
📄 goal.md - Project vision and objectives
📋 todo.md - Current tasks and progress
🏗️ resort-new/src/components/ - Component patterns to follow
🎨 resort-new/src/app/layout.tsx - Layout structure
🔧 resort-new/src/lib/ - Utility functions
📦 resort-new/package.json - Available dependencies
🗄️ resort-new/backend/ - Backend API structure
🏖️ resort-old/src/ - Features to port
💾 resort-old/prisma/schema.prisma - Data models to transform
```

---

## 💡 Best Practices Reminder

### Code Quality:
- Write self-documenting code
- Add comments only when logic is complex
- Keep components small and focused
- Use meaningful variable names
- Follow DRY principle

### Performance:
- Lazy load images and components
- Use proper React keys in lists
- Implement loading states
- Cache API responses with TanStack Query
- Optimize bundle size

### User Experience:
- Always show loading states
- Provide clear error messages
- Add success feedback
- Make interactive elements obvious
- Ensure keyboard navigation works

---

## 🎯 Success Metrics

### You're Doing Great If:
✅ Code looks like it belongs in `resort-new`
✅ No one can tell it wasn't originally written for resort
✅ All dental references are gone
✅ Tests pass and features work
✅ User experience is smooth and polished
✅ Code is maintainable and well-structured
✅ Progress in `todo.md` is being made

### Warning Signs:
⚠️ Code looks copy-pasted
⚠️ Mixing different architectural patterns
⚠️ Breaking existing functionality
⚠️ Dental terminology still present
⚠️ Inconsistent TypeScript usage
⚠️ Skipping proper validation

---

## 🆘 When Stuck

### Troubleshooting Steps:
1. **Re-read this file** - Ensure you're following guidelines
2. **Check both codebases** - Look for similar examples
3. **Review phase objectives** - Are you working on the right thing?
4. **Ask for clarification** - Better to ask than assume
5. **Suggest alternatives** - Present options with pros/cons

### Questions to Ask:
- "Should I use pattern X from resort-new or pattern Y from resort-old?"
- "I see resort-new uses Firebase, but resort-old uses Prisma. Which should we use?"
- "This component is complex - should I break it into smaller parts?"
- "Is there an existing utility function for this in resort-new?"

---

## 🎬 Final Reminders

**Remember**: 
- This is a TRANSPLANT, not a copy-paste job
- Quality over speed - do it right
- When in doubt, follow `resort-new` patterns
- Keep the end user experience in mind
- Make it better than both original projects

**Project Mantra**: 
> "Resort content, Dental quality architecture, Better together" 🏖️✨

---

*Last Updated: 2026-02-08*
*Version: 1.0*
*Keep this file updated as patterns emerge or change!*
