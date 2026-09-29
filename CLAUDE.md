# House rules for Claude Code: completerestoration

1. Read `BRIEF.md` in full before doing anything. It is the source of truth for this project.
2. Follow the order of work in section 11 of the brief.
3. Stop after step 1 (content extraction and URL inventory) and report back. Do not start building templates until Steve confirms the inventory.
4. This folder is not empty, so `create-next-app` will refuse to run in it. Scaffold the Next.js app into a temporary folder, then move the files in without overwriting `BRIEF.md`, `CLAUDE.md`, `PLACEHOLDERS.md`, `NOTES_FOR_STEVE.md`, `agent/` or `.claude/`.
5. Create and work on a branch named `rebuild`. Never commit to `main`. Never push.
6. Verification gate before every commit: `./node_modules/.bin/tsc --noEmit` clean, then `npm run build`.
7. The location of the LHM repo for the cookie consent port (step 5) will be given by Steve. Do not search for it or clone it.
8. No em dashes anywhere. UK English.
