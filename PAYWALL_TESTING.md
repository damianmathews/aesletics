# Paywall Testing Toggle

Quick and easy way to disable the paywall for testing without breaking anything.

## How to Use

### 1. Enable Bypass (Disable Paywall)

Edit `.env.local` and change:
```bash
VITE_BYPASS_PAYWALL=true
```

Then restart your dev server:
```bash
npm run dev
```

### 2. Disable Bypass (Re-enable Paywall)

Edit `.env.local` and change back to:
```bash
VITE_BYPASS_PAYWALL=false
```

Then restart your dev server.

## Important Notes

- **`.env.local` is already in `.gitignore`** - it won't be committed accidentally
- You'll see `🚧 Paywall bypassed for testing` in the console when active
- This ONLY works in development - production always requires real subscriptions
- Safe to use - doesn't modify any subscription logic, just bypasses the check

## Quick Reference

**Disable paywall:** `VITE_BYPASS_PAYWALL=true` in `.env.local`
**Enable paywall:** `VITE_BYPASS_PAYWALL=false` in `.env.local`
**After changing:** Restart dev server

That's it! Super simple.
