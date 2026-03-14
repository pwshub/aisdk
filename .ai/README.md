# AI Assistant Configuration

## Purpose
This directory contains configuration and guidelines for AI assistants working on this project.

## Structure

```
.ai/
├── README.md # This file
├── CODING_STANDARDS.md # Coding rules (JSDocs, style, etc.)
├── SECURITY_POLICY.md # Security guidelines
├── AGENT_SKILLS.md # External skills references
├── QWEN_PROMPT.md # Qwen Code system prompt
├── GEMINI_PROMPT.md # Gemini CLI system prompt
├── CONTEXT.md # Template for Session context
├── PROGRESS.md # Template for Progress tracking
└── sessions/ # [IGNORED] Session logs
```

## Files Committed to Repo
- All `.md` files except `CONTEXT.md`, `PROGRESS.md`
- Configuration files for AI tools

## Files Ignored by Git
- `sessions/` - Detailed session logs
- `skills/` - Cached third-party content

## Usage
1. Read `.rules` at project root for coding standards
2. Read `QWEN_PROMPT.md` or `GEMINI_PROMPT.md` before starting
3. Reference `AGENT_SKILLS.md` for best practices
4. At end of each session
  - Update `sessions/CONTEXT.md` (template: `CONTEXT.md`)
  - Update `sessions/PROGRESS.md` (template: `PROGRESS.md`)

## Security
- Never commit `.env` or secrets
- Never send sensitive files to external AI services
- Follow `.aiignore` for excluded files

## Tech stack
- Node.js (https://nodejs.org/docs/latest/api/)
- Bun (https://bun.com/docs)
- Deno (https://docs.deno.com/runtime/)
- Hono.js (https://hono.dev)
- PostgreSQL (https://github.com/porsager/postgres)
- Redis (https://github.com/redis/ioredis)
- Meilisearch (https://github.com/meilisearch/meilisearch-js)
- VentoJS (https://vento.js.org/)
- SvelteKit (https://svelte.dev/docs/kit/introduction)
- Astro (https://docs.astro.build/en/getting-started/)

## Testing
- Write tests for critical business logic
- Use simple test runners (node:test, bun:test, vitest)
- No complex mocking frameworks unless necessary
