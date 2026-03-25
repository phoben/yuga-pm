# yg-app-prototyping Skill Design Specification

**Date:** 2026-03-25
**Author:** Claude + User
**Status:** Draft (Pending Review Fixes)
**Version:** 1.1

---

## SKILL.md Frontmatter (Reference)

The actual `SKILL.md` file should include this YAML frontmatter:

```yaml
---
name: yg-app-prototyping
description: |
  Generate functional application prototypes from requirements documents.
  Supports Next.js + shadcn/ui, React + Element UI, Vue + Element Plus, Taro.
  Uses Agent Team for parallel development with code review gates.
  Triggers: "应用原型", "代码原型", "功能原型", "可运行原型", "application prototype"
license: MIT
metadata:
  author: yuga-pm
  version: "1.0.0"
  supports_tech_stacks:
    - nextjs-shadcn
    - react-element
    - vue-element
    - taro-miniprogram
  relation_to_yg_prototyping: |
    yg-prototyping: Generates static HTML prototypes for quick validation
    yg-app-prototyping: Generates functional code projects for development
    Use yg-app-prototyping when you need runnable code with components, routing, and state.
---
```

---

## 1. Overview

### 1.1 Purpose

`yg-app-prototyping` is a skill for generating functional application prototypes from requirements documents. Unlike the existing `yg-prototyping` skill which produces static HTML prototypes, this skill generates complete, runnable code projects using modern frontend frameworks.

### 1.2 Key Features

- **Functional Code Output**: Generates React/Vue/Next.js/Taro projects with components, routing, and state management
- **Smart DRD Handling**: Uses existing DRD or auto-generates from PRD/requirements
- **Agent Team Architecture**: Master-slave coordination with specialized agents (Writer, Coder, Reviewer)
- **Page-Level Task Planning**: Each page becomes an independent development task
- **Multi-Branch PR Workflow**: Each page gets a branch and PR with review gates
- **Multi-Tech Stack Support**: Next.js + shadcn/ui, React + Element UI, Vue + Element Plus, Taro

### 1.3 Target Users

- Product managers needing quick prototypes for validation
- Development teams starting new projects
- Designers bridging requirements to implementation

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Main Agent (Orchestrator)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 0: Initialization                                         │
│  ├── 1. Environment check (Node.js, Git, GitHub CLI)            │
│  ├── 2. Read/validate input documents                           │
│  ├── 3. Detect or generate DRD                                  │
│  ├── 4. Select tech stack (AskUserQuestion)                     │
│  └── 5. Setup project foundation (scaffold, mock data, styles)  │
│       │                                                          │
│       ▼                                                          │
│  Phase 1: Task Planning & Development                           │
│  ├── 1. Analyze DRD pages                                       │
│  ├── 2. Generate page-level task documents                      │
│  ├── 3. Create task list (TaskCreate)                           │
│  └── 4. Dispatch Coder Agents (parallel, background)            │
│       │                                                          │
│       ▼                                                          │
│  Phase 2: Review & Merge                                         │
│  ├── 1. Collect PRs from completed Coder Agents                 │
│  ├── 2. Dispatch Reviewer Agents for each PR                    │
│  ├── 3. Review PR → Feedback → Fix or Approve                   │
│  └── 4. Merge approved PRs to main branch                       │
│       │                                                          │
│       ▼                                                          │
│  Phase 3: Integration Testing                                    │
│  ├── Run project (npm run dev)                                  │
│  ├── Smoke test key flows                                       │
│  └── Report results                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** Phase numbering corrected from original (was 5 phases 0-4, now 4 phases 0-3).

### 2.2 Directory Structure

```
skills/yg-app-prototyping/
├── SKILL.md                    # Main skill definition
├── AGENTS.md                   # Compiled rules for all agents
├── rules/
│   ├── tech-stack-selection.md # Tech stack decision matrix
│   ├── drd-handling.md         # DRD detection/generation
│   ├── project-setup.md        # Project scaffolding rules
│   ├── task-planning.md        # Page-level task planning
│   ├── code-generation.md      # Code generation standards
│   ├── review-workflow.md      # Review & merge workflow
│   └── mock-data.md            # Mock data guidelines
├── workflows/
│   ├── master-workflow.md      # Main agent workflow
│   ├── coder-workflow.md       # Coder agent workflow
│   └── reviewer-workflow.md    # Reviewer agent workflow
└── templates/
    ├── nextjs-shadcn/          # Next.js + shadcn/ui template
    ├── react-element/          # React + Element UI template
    ├── vue-element/            # Vue + Element Plus template
    └── taro-miniprogram/       # Taro miniprogram template
```

---

## 3. Agent Definitions

### 3.1 Agent Overview

| Agent | Type | Role | Tools |
|-------|------|------|-------|
| **Main Agent** | Orchestrator | Coordinates workflow, manages tasks, reviews results | TaskCreate, TaskList, TaskUpdate, TaskOutput, Agent, SendMessage, Bash, Read, Write, Edit, AskUserQuestion |
| **Writer Agent** | Sub-agent | Generates DRD from PRD/requirements | Read, Write, Edit, Glob, Grep |
| **Coder Agent** | Sub-agent | Generates page code, runs linting, pushes PR | Read, Write, Edit, Glob, Grep, Bash, Agent |
| **Reviewer Agent** | Sub-agent | Reviews PRs, provides feedback | Read, Bash, SendMessage, Glob, Grep |

### 3.2 Agent Coordination Mechanism

Agents communicate via the `SendMessage` tool for status updates, clarifications, and completion notifications.

**Communication Flow:**
```
Main Agent                    Coder Agent                  Reviewer Agent
    │                              │                              │
    │── Agent(dispatch task) ─────→│                              │
    │                              │                              │
    │                              │── Agent(self-lint) ────→     │
    │                              │                              │
    │                              │── Bash(git push PR) ────→    │
    │                              │                              │
    │                              │                              │
    │←── SendMessage(complete) ────│                              │
    │                              │                              │
    │── Agent(dispatch review) ───────────────────────────────────→│
    │                              │                              │
    │                              │←── SendMessage(feedback) ────│
    │                              │                              │
    │                              │── Bash(fix & push) ─────→    │
    │                              │                              │
    │                              │←── SendMessage(approve) ─────│
    │                              │                              │
    │←── SendMessage(review done) ─────────────────────────────────│
```

**Anti-Pattern:**
- ❌ Do NOT have Coder Agent perform "self-review" - this creates conflict of interest
- ✅ Coder Agent runs linting/formatting checks only
- ✅ Separate Reviewer Agent handles actual code review

### 3.2 Writer Agent

**File:** `agents/drd-writer.md`

**Capabilities:**
- Parse PRD/requirement documents
- Extract UI layouts, components, interactions
- Generate structured DRD following `drd-generator.md` template
- Output DRD to project directory

**Input:**
- PRD document path or content
- Project context

**Output:**
- DRD document saved to `.yg-pm/projects/{project-id}/documents/DRD.md`

### 3.4 Coder Agent

**File:** `agents/page-coder.md`

**Capabilities:**
- Parse page-level task document
- Generate page components, routes, styles
- Create mock data for the page
- Run linting/formatting checks (NOT code review)
- Push branch and create PR

**Important Distinction:**
- **Linting/Formatting**: Coder Agent runs `npm run lint` / `npm run format` to catch syntax and style issues
- **Code Review**: Separate Reviewer Agent reviews code quality, architecture, and DRD alignment
- Never combine these roles - it creates conflict of interest

**Input Format:**
```markdown
## Task: Generate Page [Page Name]

### Page Info
- Page ID: P001
- Page Type: List/Detail/Form/Dashboard
- Module: [Module Name]
- Route Path: /users/list

### Design Specs
[DRD fragment, component specs, style specs]

### Tech Stack
- Framework: Next.js 14
- UI Library: shadcn/ui
- Styling: Tailwind CSS

### Branch Info
- Target Branch: feature/page-users-list
- Base Branch: main

### Deliverables
1. Page component code
2. Unit tests (optional)
3. Mock data
```

**Output:**
- Page component code
- Mock data
- PR with linting results

### 3.5 Reviewer Agent

**File:** `agents/pr-reviewer.md`

**Capabilities:**
- Fetch PR changes
- Review against DRD and coding standards
- Check for security, performance, accessibility issues
- Provide structured feedback
- Approve or request changes

**Review Checklist:**
1. Plan Alignment - Does code match DRD requirements?
2. Code Quality - Naming, structure, error handling
3. Component Standards - Follows UI library patterns
4. Accessibility - ARIA labels, keyboard navigation
5. Performance - No obvious bottlenecks

---

## 4. Master Workflow

### 4.1 Phase 0: Initialization

#### Step 0.0: Environment Assessment

**Environment Check List:**

| Check | Command | Requirement | Handling if Failed |
|-------|---------|-------------|-------------------|
| Node.js | `node -v` | >= 18.0.0 | Prompt user to install Node.js 18+ |
| Git | `git --version` | Installed | Prompt user to install Git |
| GitHub CLI | `gh --version` | Installed | Prompt user to install gh CLI |
| Package Manager | `pnpm -v` or `npm -v` | pnpm preferred | Use npm as fallback |
| Remote Repository | `git remote -v` | Configured | Prompt user to configure remote |

**Environment Check Flow:**
```
┌─────────────────────────────────────┐
│       Check Node.js >= 18           │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    Pass           Fail
        │               │
        ▼               ▼
┌───────────────┐  Use AskUserQuestion:
│ Check Git     │  "Node.js 18+ required.
└───────┬───────┘   Install now?"
        │
   ... (continue checks)
```

**Handling Strategies:**

```json
{
  "questions": [{
    "question": "Environment check failed: Node.js version is too old. How would you like to proceed?",
    "header": "环境检查",
    "multiSelect": false,
    "options": [
      { "label": "Install Node.js 18+", "description": "Run nvm install 18 to install the latest LTS" },
      { "label": "Continue anyway", "description": "Proceed with current environment (may have issues)" },
      { "label": "Cancel", "description": "Abort and wait for environment setup" }
    ]
  }]
}
```

**Anti-Pattern:**
- ❌ Skipping environment checks leads to cryptic errors later
- ❌ Assuming GitHub CLI is always installed
- ✅ Check all dependencies upfront and provide clear guidance

#### Step 0.1: Document Input

**Input Sources (Priority):**
1. User-specified document path
2. DRD document in current context
3. PRD document in current context
4. User's direct requirement description

**Processing Logic:**
```
IF user specifies document path:
    Read document
ELSE IF DRD exists in context:
    Use DRD directly
ELSE IF PRD exists in context:
    Call Writer Agent to generate DRD
ELSE:
    Use AskUserQuestion to ask for requirement document location
```

#### Step 0.2: DRD Handling

**Smart Processing Flow:**

```
┌─────────────────────────────────────┐
│          Detect DRD Document        │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    DRD Exists      DRD Missing
        │               │
        ▼               ▼
  Validate DRD    Detect PRD/Requirements
        │               │
   ┌────┴────┐     ┌────┴────┐
   ▼         ▼     ▼         ▼
 Valid    Invalid  PRD      No PRD
   │         │     Exists
   │         │     │
   ▼         ▼     ▼         ▼
 Use DRD  Regenerate Generate DRD  Ask User
```

**DRD Validation Checklist:**
- [ ] Contains design specifications
- [ ] Contains page structure
- [ ] Contains interaction flows
- [ ] Contains component inventory

#### Step 0.3: Tech Stack Selection

**Selection Flow:**
1. Check if DRD specifies tech stack
2. If specified, confirm with AskUserQuestion
3. If not specified, let user choose with AskUserQuestion

**Selection Matrix:**

| Project Type | Recommended Tech Stack | Reason |
|--------------|------------------------|--------|
| Web Admin System | React + Element UI / Vue + Element Plus | Rich components, strong form handling |
| Marketing/Website | Next.js + shadcn/ui | SEO-friendly, modern experience |
| Mobile H5 | React + Ant Design Mobile | Mobile-optimized |
| Mini Program | Taro + Ant Design Mini | Cross-platform |
| Simple Prototype | Next.js + shadcn/ui | Quick setup |

**Relationship with yg-prototyping:**
- `yg-prototyping`: For static HTML prototypes, quick validation, no code needed
- `yg-app-prototyping`: For functional code projects, development-ready output
- Use `yg-app-prototyping` when you need runnable code with components, routing, and state management

**AskUserQuestion Example:**

```json
{
  "questions": [{
    "question": "请选择原型技术栈：",
    "header": "技术栈",
    "multiSelect": false,
    "options": [
      { "label": "Next.js + shadcn/ui (推荐)", "description": "现代全栈方案，SEO友好，适合官网/营销页" },
      { "label": "React + Element UI", "description": "后台管理系统首选，组件丰富" },
      { "label": "Vue + Element Plus", "description": "Vue生态后台方案，表单处理强" },
      { "label": "Taro (小程序)", "description": "跨端小程序方案，微信/支付宝/字节跳动" }
    ]
  }]
}
```

**Anti-Pattern:**
- ❌ Assuming tech stack without user confirmation
- ❌ Using static HTML tech for complex applications
- ✅ Always confirm tech stack with user before proceeding

#### Step 0.4: Project Setup

**Project Initialization Checklist:**

1. **Create Project Directory**
   ```
   {project-name}/
   ├── src/
   │   ├── app/              # Next.js routes
   │   ├── components/       # Components
   │   │   ├── ui/           # Base UI components
   │   │   └── business/     # Business components
   │   ├── lib/              # Utilities
   │   ├── hooks/            # Custom hooks
   │   ├── types/            # Type definitions
   │   └── mock/             # Mock data
   ├── public/
   ├── styles/
   ├── package.json
   ├── tailwind.config.js
   └── tsconfig.json
   ```

2. **Initialize Git Repository**
   - git init
   - Create .gitignore
   - Initial commit

3. **Generate Global Specs**
   - Design tokens (CSS variables/Tailwind config)
   - Mock data structure
   - Common component templates
   - API Mock configuration

4. **Install Dependencies**
   - Select dependencies based on tech stack
   - npm install / pnpm install

#### Step 0.5: Task Planning

**Task Planning Flow:**

1. **Extract Page List**
   - Read all pages from DRD
   - Mark page priorities
   - Identify page dependencies

2. **Generate Task Documents**
   - One task document per page
   - Save to `.yg-pm/projects/{project-id}/tasks/`

3. **Create Task List**
   - Use TaskCreate to create tasks
   - Set task dependencies

**Task Document Template:**
```markdown
# Task: [Page Name]

## Metadata
- Task ID: T001
- Page ID: P001
- Type: List/Detail/Form/Dashboard
- Priority: High/Medium/Low
- Dependencies: [Task ID list]

## Design Specs
[Relevant specs extracted from DRD]

## Component Inventory
| Component | Type | Description |
|-----------|------|-------------|

## Interaction Notes
[Interaction flows]

## Acceptance Criteria
- [ ] Page renders correctly
- [ ] Interactions work as expected
- [ ] Mock data displays properly
- [ ] Responsive adaptation
```

### 4.2 Phase 1: Task Planning & Development

**Task Planning Flow:**

1. **Extract Page List**
   - Read all pages from DRD
   - Mark page priorities
   - Identify page dependencies

2. **Generate Task Documents**
   - One task document per page
   - Save to `.yg-pm/projects/{project-id}/tasks/`

3. **Create Task List**
   - Use TaskCreate to create tasks
   - Set task dependencies

**Git Branch Strategy:**

| Scenario | Branch Name Pattern | Example |
|----------|---------------------|---------|
| Feature page | `feature/page-{page-name}` | `feature/page-user-list` |
| Shared component | `feature/component-{name}` | `feature/component-user-card` |
| Bug fix | `fix/{issue-desc}` | `fix/login-validation` |

**Branch Creation Timing:**
- Branches are created by Coder Agents (not Main Agent)
- This ensures clean branch history if Agent fails
- Main Agent only coordinates, Coder Agents handle git operations

**Parallel Development Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│                      Main Agent                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Create task list (TaskCreate)                            │
│     ├── Task #1: Home page                                   │
│     ├── Task #2: User list                                   │
│     └── Task #N: Settings page                               │
│                                                               │
│  2. Launch Coder Agents in parallel (background)             │
│     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│     │ Coder #1    │ │ Coder #2    │ │ Coder #N    │         │
│     │ Home        │ │ User List   │ │ Settings    │         │
│     │ (background)│ │ (background)│ │ (background)│         │
│     │             │ │             │ │             │         │
│     │ Steps:      │ │ Steps:      │ │ Steps:      │         │
│     │ 1. Checkout │ │ 1. Checkout │ │ 1. Checkout │         │
│     │ 2. Code     │ │ 2. Code     │ │ 2. Code     │         │
│     │ 3. Lint     │ │ 3. Lint     │ │ 3. Lint     │         │
│     │ 4. Commit   │ │ 4. Commit   │ │ 4. Commit   │         │
│     │ 5. Push PR  │ │ 5. Push PR  │ │ 5. Push PR  │         │
│     └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                               │
│  3. Monitor completion (TaskOutput / SendMessage)            │
│     - Receive completion notifications                        │
│     - Handle failures gracefully                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Parallel Launch Example:**

```javascript
// Launch multiple Agents in a single message (background mode)
Agent({
  subagent_type: "general-purpose",  // Uses agents/page-coder.md definition
  description: "Generate user list page",
  prompt: `
    ## Task: Generate Page [User List]
    ... task document content ...
  `,
  run_in_background: true
})

Agent({
  subagent_type: "general-purpose",
  description: "Generate settings page",
  prompt: `
    ## Task: Generate Page [Settings]
    ... task document content ...
  `,
  run_in_background: true
})
```

**Agent Allocation Strategy:**

| Pages | Strategy | Parallel Count |
|-------|----------|----------------|
| 1-3 pages | All parallel | All |
| 4-8 pages | Batch parallel | 4/batch |
| 9+ pages | Dependency-first | 5/batch |

**Anti-Pattern:**
- ❌ Creating branches before dispatching Agents (wastes if Agent fails)
- ❌ Running more than 5 Agents in parallel (context/memory limits)
- ❌ Ignoring page dependencies (leads to broken builds)

### 4.3 Phase 2: Review & Merge

**Review & Merge Flow:**

```
PR Ready
    │
    ▼
┌─────────────────────────────────────┐
│          Reviewer Agent             │
│                                     │
│  1. Fetch PR changes               │
│  2. Review checklist:              │
│     □ DRD alignment check          │
│     □ Code quality check           │
│     □ Component standards check    │
│     □ Accessibility check          │
│  3. Generate review report         │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    Approved        Changes Required
        │               │
        ▼               ▼
  Merge PR      SendMessage(feedback)
        │               │
        ▼               ▼
  Mark task done  Coder fixes & updates PR
                        │
                        └──→ Re-review
```

**Review Report Template:**

```markdown
# Code Review Report

## PR Info
- PR: #1 - Feature: User List Page
- Author: Coder Agent
- Reviewer: Reviewer Agent

## Result: ✅ Approved / ❌ Changes Required

## Checklist
| Item | Status | Notes |
|------|--------|-------|
| DRD Alignment | ✅ | Features match design requirements |
| Code Quality | ⚠️ | See suggestions below |
| Component Standards | ✅ | Follows shadcn/ui patterns |
| Accessibility | ❌ | Missing aria-label |

## Issues

### Critical (Must Fix)
- [ ] Button missing aria-label

### Important (Should Fix)
- [ ] Consider extracting fetchData to a hook

### Suggestions
- Consider using React Query for data management

## Detailed Feedback
[Specific code locations and fix recommendations]
```

### 4.4 Phase 3: Integration Testing

**Integration Testing Flow:**

1. **Start Project**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Smoke Test Checklist**
   - [ ] Project starts normally
   - [ ] Home page displays correctly
   - [ ] Navigation works properly
   - [ ] Forms submit correctly
   - [ ] Mock data displays correctly

3. **Generate Test Report**

```markdown
# Integration Test Report

## Project Info
- Project Name: [Name]
- Tech Stack: Next.js + shadcn/ui
- Test Time: [Time]

## Test Results

| Feature | Status | Notes |
|---------|--------|-------|
| Project Start | ✅ | Port 3000 |
| Home Page Render | ✅ | Displays correctly |
| User List | ✅ | Data shows correctly |
| User Detail | ⚠️ | Image not loading |
| Form Submit | ✅ | Validation works |

## Issues
1. User detail page image path error
   - Location: src/app/users/[id]/page.tsx:45
   - Suggestion: Check image path configuration

## Recommendations
1. Add error boundary handling
2. Configure image domain whitelist
```

4. **Update Task Status**
   - Mark all tasks completed
   - Generate project delivery document

---

## 5. Tech Stack Templates

### 5.1 Template Structure

Each tech stack template contains:

```
templates/{tech-stack}/
├── README.md              # Template usage guide
├── package.json.tmpl      # Package dependencies
├── tsconfig.json.tmpl     # TypeScript config
├── src/
│   ├── app/               # Pages/routes
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities
│   ├── hooks/             # Custom hooks
│   ├── types/             # Type definitions
│   └── mock/              # Mock data
├── styles/
│   ├── globals.css        # Global styles
│   └── tokens.css         # Design tokens
└── config/
    └── mock.config.ts     # Mock API config
```

### 5.2 Template: Next.js + shadcn/ui

**Config:**
```yaml
name: nextjs-shadcn
description: Next.js 14 + shadcn/ui + Tailwind CSS
features:
  - App Router
  - Server Components
  - shadcn/ui components
  - Tailwind CSS
  - TypeScript

dependencies:
  core:
    - next@14
    - react@18
    - react-dom@18
    - typescript@5
  ui:
    - "@radix-ui/react-*"
    - class-variance-authority
    - clsx
    - tailwind-merge
  styling:
    - tailwindcss
    - autoprefixer
    - postcss
  utils:
    - lucide-react
    - zustand
```

**Base Components:**
| Component | Source | Purpose |
|-----------|--------|---------|
| Button | shadcn/ui | Primary/secondary/ghost/danger buttons |
| Input | shadcn/ui | Text input, textarea |
| Card | shadcn/ui | Content containers |
| Table | shadcn/ui | Data tables |
| Dialog | shadcn/ui | Modals |
| Form | shadcn/ui | Form handling with react-hook-form |
| Select | shadcn/ui | Dropdowns |
| Toast | shadcn/ui | Notifications |

### 5.3 Template: React + Element UI

**Config:**
```yaml
name: react-element
description: React 18 + Element Plus + Vite
features:
  - Vite build
  - React Router
  - Element Plus components
  - SCSS modules
  - TypeScript

dependencies:
  core:
    - react@18
    - react-dom@18
    - react-router-dom@6
    - typescript@5
  ui:
    - element-plus
    - "@element-plus/icons-vue"
  styling:
    - sass
  build:
    - vite
    - "@vitejs/plugin-react"
  utils:
    - axios
    - zustand
```

### 5.4 Template: Vue + Element Plus

**Config:**
```yaml
name: vue-element
description: Vue 3 + Element Plus + Vite
features:
  - Vue 3 Composition API
  - Vue Router
  - Pinia state
  - Element Plus
  - TypeScript

dependencies:
  core:
    - vue@3
    - vue-router@4
    - pinia
    - typescript@5
  ui:
    - element-plus
    - "@element-plus/icons-vue"
  build:
    - vite
    - "@vitejs/plugin-vue"
  utils:
    - axios
    - vueuse
```

### 5.5 Template: Taro (Mini Program)

**Config:**
```yaml
name: taro-miniprogram
description: Taro 3 + Ant Design Mini
features:
  - Cross-platform
  - WeChat/Alipay/ByteDance mini programs
  - Ant Design Mini
  - TypeScript

dependencies:
  core:
    - "@tarojs/taro"
    - "@tarojs/components"
    - "@tarojs/runtime"
    - "@tarojs/plugin-framework-react"
  ui:
    - antd-mini
    - "@ant-design/icons"
  utils:
    - axios
    - zustand
```

### 5.6 Design Tokens (Shared)

```css
/* styles/tokens.css */
:root {
  /* Colors */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  --color-info: #1890ff;

  /* Text */
  --color-text-primary: #262626;
  --color-text-secondary: #8c8c8c;
  --color-text-disabled: #bfbfbf;

  /* Background */
  --color-bg-container: #ffffff;
  --color-bg-elevated: #ffffff;
  --color-bg-layout: #f5f5f5;

  /* Border */
  --color-border: #d9d9d9;
  --color-border-secondary: #f0f0f0;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

## 6. Implementation Details

### 6.1 Rules Files Summary

| Rule File | Purpose | Key Content |
|-----------|---------|-------------|
| `tech-stack-selection.md` | Guide tech stack choice | Decision matrix, environment checks |
| `drd-handling.md` | DRD detection/generation | Validation checklist, auto-generation flow |
| `project-setup.md` | Project scaffolding | Directory structure, dependency installation |
| `task-planning.md` | Page-level planning | Task document template, dependency handling |
| `code-generation.md` | Code standards | Component patterns, naming conventions |
| `review-workflow.md` | Review process | Checklist, feedback format, merge flow |
| `mock-data.md` | Mock data guidelines | Structure, realistic data generation |

### 6.2 Agent Dispatch Strategy

**Parallel vs Sequential Decision:**

| Scenario | Strategy | Reason |
|----------|----------|--------|
| Independent pages (no dependencies) | All parallel | Maximum efficiency |
| Pages with dependencies | Parallel after dependencies | Maintain order |
| Pages sharing components | Generate shared components first | Avoid duplication |

**Parallel Limits:**
- Maximum parallel agents: 5
- Exceed limit → batch by priority

### 6.3 Error Handling

**Error Classification & Handling:**

| Error Type | Handling | Retry Limit |
|------------|----------|-------------|
| Agent timeout | Reassign task with smaller scope | 2 |
| Code generation failure | Fallback to template filling | 1 |
| Linting failure | Auto-fix with `npm run lint -- --fix` | 1 |
| Git push failure | Check credentials, re-auth | 1 |
| PR creation failure | Check gh CLI, remote config | 1 |
| Review rejection | Feedback to Coder Agent for fixes | 3 |
| Merge conflict | Notify Main Agent for manual handling | 0 |
| Test failure | Generate issue report with fix suggestions | 0 |
| Dependency install failure | Try alternate package manager | 1 |

**Timeout Configuration:**

| Operation | Timeout | Reason |
|-----------|---------|--------|
| Single page code generation | 3 minutes | Complex pages |
| Linting | 1 minute | Fast check |
| Git operations | 30 seconds | Network dependent |
| PR creation | 1 minute | API dependent |
| Integration test | 5 minutes | Full project |

**Anti-Pattern:**
- ❌ Infinite retry loops without user notification
- ❌ Ignoring merge conflicts (data loss risk)
- ✅ Set clear timeout limits and escalation paths

### 6.4 Context Management

**Context Optimization Strategies:**

1. **Independent Task Documents**: Each page task contains complete design specs
2. **Template References**: Code templates referenced by path, not duplicated
3. **Incremental Output**: Agent releases context immediately after completion
4. **Result Summaries**: Main Agent receives key results only, not full code

### 6.5 Mock Data Strategy

**Mock Data Strategy:**

1. **Global Mock**: Generated during project initialization
   - User data
   - Organization structure
   - Basic configuration

2. **Page Mock**: Generated for each page task
   - Page-specific data
   - Related data references

3. **Mock Data Standards:**
   - Use faker.js or Chinese fake data generators
   - Follow business logic
   - Cover edge cases

---

## 7. Skill Invocation

### 7.1 Command Syntax

```bash
# Basic invocation
/yg-app-prototyping

# Specify document
/yg-app-prototyping --doc ./docs/DRD.md

# Specify tech stack
/yg-app-prototyping --tech nextjs-shadcn

# Specify output directory
/yg-app-prototyping --output ./prototypes/my-app

# Skip DRD generation
/yg-app-prototyping --skip-drd

# Specify parallel count
/yg-app-prototyping --parallel 3
```

### 7.2 Command Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--doc` | Requirements document path | Current context document |
| `--tech` | Tech stack | Interactive selection |
| `--output` | Output directory | `./prototypes/{project-name}` |
| `--skip-drd` | Skip DRD generation | false |
| `--parallel` | Max parallel agents | 5 |

---

## 8. Expected Outputs

### 8.1 Output Structure

```
prototypes/{project-name}/
├── src/                   # Source code
├── public/                # Static assets
├── mock/                  # Mock data
├── package.json           # Dependencies
├── README.md              # Project README
└── PROTOTYPE.md           # Prototype documentation

.yg-pm/projects/{project-id}/
├── project.json           # Project metadata
├── documents/
│   └── DRD.md            # Design requirements document
├── tasks/
│   ├── T001-home.md      # Task documents
│   ├── T002-users.md
│   └── ...
└── reports/
    └── review-report.md   # Review report
```

### 8.2 Delivery Artifacts

1. **Runnable Project**: Complete codebase ready to run
2. **Documentation**: README and prototype documentation
3. **Mock Data**: Realistic test data
4. **Task Records**: All task documents and review reports

---

## 9. Success Metrics

### 9.1 Quality Metrics

- **DRD Coverage**: All pages have corresponding components
- **Code Quality**: Passes linting and peer review
- **Test Coverage**: Key flows pass smoke tests
- **Documentation**: README covers setup and usage

### 9.2 Efficiency Metrics

- **Time to First Prototype**: < 30 minutes for 5-page app
- **Parallel Efficiency**: 3-5x speedup for 10+ pages
- **Review Pass Rate**: > 80% first-pass approval

---

## 10. Future Enhancements

### 10.1 Short-term (v1.1)

- [ ] Add unit test generation
- [ ] Support custom design systems
- [ ] Add deployment scripts

### 10.2 Medium-term (v1.5)

- [ ] AI-powered design suggestions
- [ ] Integration with Figma for design-to-code
- [ ] Multi-language support

### 10.3 Long-term (v2.0)

- [ ] Full-stack prototype with backend mock
- [ ] Database schema generation
- [ ] API documentation generation

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| DRD | Design Requirements Document |
| PRD | Product Requirements Document |
| Agent Team | Group of specialized AI agents working together |
| Master-Slave | Coordination pattern where one agent orchestrates others |
| Design Token | CSS variable representing a design decision |

## Appendix B: References

- [drd-generator.md](../skills/yg-document-writing/references/drd-generator.md)
- [yg-prototyping SKILL.md](../skills/yg-prototyping/SKILL.md)
- [superpowers code-reviewer agent](https://github.com/anthropics/claude-code)