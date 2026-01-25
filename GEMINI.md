# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).
- Prioritize using the GitHub MCP server for accessing GitHub.
- When utilizing the GitHub MCP server to create Issues or Pull Requests, it is mandatory to follow the templates found in the .github/ directory (specifically .github/ISSUE_TEMPLATE/ or .github/PULL_REQUEST_TEMPLATE.md).

## Minimal Workflow

- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Issue Implementation Workflow

When implementing an Issue, proceed according to the following steps:

1. **Search**
   - Investigate the content of the Issue without making any changes to the files.
2. **Plan**
   - Create an implementation plan based on the results of `1. Search`.
   - The implementation plan MUST include tests for verification.
3. **Implementation**
   - Confirm with the developer before execution.
   - Once approved, proceed with implementation based on the plan created in `2. Plan`.
4. **Commit**
   - Do NOT `git commit` or `git push` the changes made in `3. Implementation`. This is to allow for verification of the changes in the working directory.

## Steering Configuration

- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)

## Session Logging

- Save the log of the most recent session in `.gemini/logs/`.
- When resuming a session, read the saved log to understand the history before continuing work.

## TIPS

- **IMPORTANT**: When adding new content to this file (`GEMINI.md`), always write in English.
- When a command fails and a successful resolution is found, record the working method here.
- If tools like GitHub MCP Server (Docker version) are not found: Check if the daemon is running with `docker info`. If not, start the Docker application.
