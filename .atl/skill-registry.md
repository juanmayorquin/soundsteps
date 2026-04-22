# Skill Registry — soundsteps

Generated: 2026-04-19

## Stack Context
- React Native + Expo 54 (managed workflow)
- TypeScript + expo-router (file-based routing)
- expo-av (audio), AsyncStorage (local storage)
- No test runner detected

## User Skills

| Skill | Trigger |
|-------|---------|
| branch-pr | When creating a pull request or preparing changes for review |
| issue-creation | When creating a GitHub issue, reporting a bug, or requesting a feature |
| sdd-explore | When the orchestrator launches you to think through a feature or investigate the codebase |
| sdd-propose | When the orchestrator launches you to create or update a proposal for a change |
| sdd-spec | When the orchestrator launches you to write or update specs for a change |
| sdd-design | When the orchestrator launches you to write or update the technical design |
| sdd-tasks | When the orchestrator launches you to create or update the task breakdown |
| sdd-apply | When the orchestrator launches you to implement tasks from a change |
| sdd-verify | When the orchestrator launches you to verify a completed change |
| sdd-archive | When the orchestrator launches you to archive a completed change |
| sdd-onboard | When the orchestrator launches you to onboard a user through the full SDD cycle |
| skill-creator | When user asks to create a new skill or document patterns for AI |
| judgment-day | When user says "judgment day", adversarial review, or dual review |

## Project Conventions

- **CLAUDE.md** (project): `CLAUDE.md`
  - No backend, no auth — all data local via AsyncStorage
  - Audio via ElevenLabs MCP → static files in `/assets/audio/`
  - Follow UI mockups (soft blue/teal + orange/yellow accents)
  - Large buttons, rounded corners, minimalist, calm tone

## Compact Rules

### React Native / Expo
- Use expo-router file-based routing; screens live in `app/`
- Audio is consumed from static local files in `/assets/audio/` via expo-av — no runtime API calls
- Store progress locally with AsyncStorage
- Use Lexend font via `@expo-google-fonts/lexend`

### UI
- Color palette: soft blue/teal primary, orange/yellow accents
- Large buttons, rounded corners, minimalist, calm emotional tone
- Follow design mockups exactly

### General
- No backend, no auth
- Keep it simple — working features over perfect structure
