# Aesletics - Gamified XP Tracker for Total Well-Being

A clean, premium, non-nerdy gamified XP tracker for total well-being. Built with React, TypeScript, Tailwind CSS, and deployed as a static site to Netlify.

## Features

- **150+ Curated Quests** across 12 categories:
  - Fitness & Strength
  - Conditioning
  - Mobility & Recovery
  - Athletics & Skill
  - Body & Aesthetics
  - Intelligence
  - Discipline
  - Mental
  - Social & Leadership
  - Adventure & Outdoors
  - Finance & Career
  - Creativity

- **XP & Leveling System** with dynamic multipliers based on proof rigor and streaks
- **Streak Tracking** with grace periods
- **Quest Proof System** supporting timers, counters, text logs, and photos
- **Local-First** - All data stored in localStorage/IndexedDB
- **Beautiful UI** inspired by modern dashboards like Framer
- **Dark/Light Themes**
- **Data Export/Import** for backups
- **Quest Packs** for structured programs

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Routing**: react-router-dom
- **Styling**: Tailwind CSS with CSS variables
- **State**: Zustand with persistence
- **Storage**: localStorage + IndexedDB (for photos)
- **Animation**: Framer Motion
- **Deployment**: Netlify (static site)

## Project Structure

```
aesletics-rebuild/
├── src/
│   ├── data/
│   │   └── seed.ts              # 150+ quest templates, packs, badges
│   ├── lib/
│   │   ├── storage.ts           # localStorage & IndexedDB utilities
│   │   └── xp.ts                # XP, level, streak calculations
│   ├── pages/
│   │   ├── Landing.tsx          # Marketing landing page
│   │   ├── Dashboard.tsx        # Main app dashboard
│   │   ├── QuestLibrary.tsx    # Browse all quests
│   │   ├── QuestDetail.tsx     # Complete quest with proof
│   │   └── Settings.tsx         # User settings & data export
│   ├── store/
│   │   └── useStore.ts          # Zustand store with persistence
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── App.tsx                  # Router setup
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── public/
│   └── _redirects               # SPA routing for Netlify
├── netlify.toml                 # Netlify configuration
└── package.json
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment to Netlify

### Option 1: Deploy to Existing Site (aesletics.netlify.app)

The existing site at https://aesletics.netlify.app has the Next.js plugin enabled. You need to disable it first:

1. Go to https://app.netlify.com/sites/aesletics/configuration/deploys
2. Scroll to "Build plugins"
3. Remove/disable the "@netlify/plugin-nextjs" plugin
4. Save changes

Then deploy:
```bash
netlify link --name=aesletics
netlify deploy --prod --dir=dist
```

### Option 2: Deploy to New Site

Create a brand new Netlify site:

```bash
# Via Netlify UI (recommended)
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `dist/` folder

# Or via CLI
netlify deploy --prod --dir=dist
# Follow prompts to create new site
```

### Option 3: Continuous Deployment via Git

1. Push this code to a GitHub repository
2. Connect the repository to Netlify
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Netlify will auto-deploy on every push

## Deployment Configuration

The project includes:
- `public/_redirects` - SPA routing (redirects all routes to index.html)
- `netlify.toml` - Build configuration and cache headers

## No External Dependencies

This app is completely self-contained:
- ✅ No API calls
- ✅ No authentication services
- ✅ No analytics
- ✅ No external fonts (uses system font fallbacks)
- ✅ All data stored locally
- ✅ Works 100% offline (after initial load)

## Key Design Decisions

1. **Local-First**: All user data stays on their device
2. **No Backend**: Completely static, no servers required
3. **Progressive Enhancement**: Core functionality works without JS, enhanced with animations
4. **Accessible**: Semantic HTML, keyboard navigation, screen reader support
5. **Mobile-First**: Responsive design works on all screen sizes

## Future Enhancements

- [ ] Add photo proof upload functionality (currently placeholder)
- [ ] More quest packs (currently has 8)
- [ ] Expand to 200+ quests (currently 150+)
- [ ] Badge unlock animations
- [ ] Social features (local leaderboards only)
- [ ] PWA with offline support
- [ ] Calendar heatmap visualization

## Performance

- Lighthouse scores target: 95+ across all metrics
- Bundle size: ~415KB (gzipped: ~126KB)
- No runtime dependencies except React ecosystem

## License

Proprietary - All rights reserved

---

Built with ⚡ by Claude Code
