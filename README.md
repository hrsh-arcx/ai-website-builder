# 🌐 WebForge AI

> Build complete websites using AI, refine them through conversation, edit them visually, track every version, and manage usage through a production-style SaaS billing system.

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6)
![Node.js](https://img.shields.io/badge/Backend-Node.js_22-339933)
![Express](https://img.shields.io/badge/Framework-Express_5-000000)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1)
![Prisma](https://img.shields.io/badge/ORM-Prisma_7-2D3748)
![Tailwind CSS](https://img.shields.io/badge/UI-TailwindCSS_v4-06B6D4)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF)

<br>

---

## 🚀 Live Demo : [Try WebForge AI](https://ai-website-builder-flame-rho.vercel.app)



## 📸 Application Preview

<table>
<tr>
<td align="center" width="33%">
<img src="screenshots/Screenshot 2026-06-16 172941.png">
<br><b>Landing Page</b>
</td>

<td align="center" width="33%">
<img src="screenshots/Screenshot 2026-06-16 173200.png">
<br><b>Website Generation</b>
</td>

<td align="center" width="33%">
<img src="screenshots/Screenshot 2026-06-16 173225.png">
<br><b>Editor Panel</b>
</td>
</tr>

<tr>
<td align="center">
<img src="screenshots/Screenshot 2026-06-16 173239.png">
<br><b>My Projects</b>
</td>

<td align="center">
<img src="screenshots/Screenshot 2026-06-16 173257.png">
<br><b>Community</b>
</td>

<td align="center">
<img src="screenshots/Screenshot 2026-06-16 173308.png">
<br><b>Pricing</b>
</td>
</tr>
</table>

<br>

---
## ✨ Highlights

- 🤖 Two-stage AI website generation pipeline
- 💬 Conversational website revisions
- 🎨 Visual click-to-edit editor
- 🕒 Version history with rollback support
- 💳 Stripe-powered SaaS billing
- 🔐 Secure session-based authentication
- 🌍 Public community gallery
- ⚡ End-to-end TypeScript architecture

---

## 🎯 What is WebForge AI?

WebForge AI is a full-stack SaaS platform that transforms plain-English descriptions into fully functional, responsive websites.

Unlike basic AI wrappers that send a prompt directly to a model, WebForge AI uses a **two-stage generation pipeline**:

1. Prompt Enhancement
2. Website Generation

This approach produces significantly more structured and complete websites while keeping the underlying AI provider fully swappable.

Users can then:

- Continue editing through natural language
- Modify elements visually
- Restore previous versions
- Publish websites publicly
- Purchase credits through Stripe

The project was built to demonstrate real-world SaaS architecture, AI integration patterns, version control systems, and payment workflows.

---

# 🏗️ System Architecture

```text
User Prompt
     │
     ▼
Credit Validation
     │
     ▼
Prompt Enhancer (LLM #1)
     │
     ▼
Code Generator (LLM #2)
     │
     ▼
HTML Sanitization
     │
     ▼
Version Storage
     │
     ▼
Live Preview
     │
     ▼
Chat Revisions / Visual Editing
```

---

## 🧠 Core Features

### 🤖 AI Website Generation

Generate complete responsive websites from plain-English prompts.

Example:

> Create a modern SaaS landing page for a fitness startup.

The backend automatically:

- Enhances vague prompts
- Plans page structure
- Generates complete HTML
- Applies responsive Tailwind styling
- Stores generated output as a versioned project

---

### 💬 Conversational Revisions

Continue improving websites through natural language.

Examples:

- Make the hero section larger
- Add testimonials
- Change color palette
- Improve CTA visibility

Instead of generating from scratch, edits are applied to the existing project context.

---

### 🎨 Visual Click-to-Edit Editor

Users can directly interact with generated websites.

Editable properties include:

- Text
- Colors
- Padding
- Margin
- Typography
- Tailwind classes

Changes are saved through the same backend system used by AI-generated updates.

---

### 🕒 Version History & Rollback

Every modification creates a new version.

Supports:

- AI-generated revisions
- Manual edits
- One-click rollback
- Complete project history

No project state is permanently lost.

---

### 💳 Credit-Based Billing

Stripe Checkout powers the SaaS billing workflow.

Features:

- Multiple pricing tiers
- Credit purchases
- Signature-verified webhooks
- Automatic credit refunds on generation failure

---

### 🌍 Community Gallery

Projects can be published publicly.

Published websites appear in the community showcase where visitors can browse generated projects without authentication.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI |
| Routing | React Router 7 |
| Backend | Node.js, Express 5 |
| Authentication | better-auth |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| AI Integration | OpenRouter + OpenAI SDK |
| Payments | Stripe Checkout |
| Notifications | Sonner |
| Deployment | Vercel + Render |

---

## 📁 Project Structure

```bash
ai-website-builder/
├── client/
│   ├── components/
│   ├── pages/
│   ├── config/
│   └── lib/
│
└── server/
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── prisma/
    ├── config/
    └── lib/
```

---

# 🔥 Engineering Decisions

## Two-Stage LLM Pipeline

Rather than sending the user's prompt directly to a model, WebForge AI first improves the prompt before generation begins.

Benefits:

- Better layouts
- Better section planning
- More detailed output
- Increased consistency

This approach consistently outperformed single-prompt generation during development.

---

## Append-Only Version System

Every project modification creates a new version record.

Benefits:

- Complete history tracking
- Safe rollbacks
- Auditability
- Simpler recovery logic

`current_code` simply points to the latest version.

---

## Credit Refund Protection

Credits are deducted before generation begins.

If generation fails:

- Credits are immediately restored

This prevents abuse while ensuring users never lose credits due to AI failures.

---

## Secure Authentication

Authentication is handled through better-auth with:

- Postgres-backed sessions
- httpOnly cookies
- Production-safe cookie settings
- Session revocation support

No custom authentication logic was required.

---

## Stripe Webhook Verification

Stripe events are verified using signature validation before credits are awarded.

This prevents forged webhook requests and unauthorized balance manipulation.

---

## 📡 Key API Endpoints

### Authentication

```http
/api/auth/*
```

Handles:

- Sign Up
- Sign In
- Sign Out
- Session Retrieval

---

### Website Generation

```http
POST /api/user/project
POST /api/project/revision/:id
PUT  /api/project/save/:id
```

---

### Version Management

```http
GET /api/project/rollback/:id/:versionId
```

---

### Billing

```http
POST /api/user/purchase-credits
POST /api/stripe
```

---

## 💳 Credit Plans

| Plan | Price | Credits |
|--------|---------|----------|
| Basic | $5 | 100 |
| Pro | $15 | 400 |
| Enterprise | $25 | 1000 |

Each generation or revision consumes 5 credits.

---

## ⚙️ Local Setup

### Clone Repository

```bash
git clone https://github.com/hrsh-arcx/ai-website-builder.git
cd ai-website-builder
```

---

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=4000

DATABASE_URL=

BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_SECRET=

TRUSTED_ORIGINS=http://localhost:5173

AI_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Run migrations:

```bash
npx prisma migrate deploy
```

Start backend:

```bash
npm run server
```

---

### Frontend Setup

```bash
cd client
npm install
```

Create:

```env
VITE_URL=http://localhost:4000
```

Start frontend:

```bash
npm run dev
```

---

### Stripe Webhook Testing

```bash
stripe listen --forward-to localhost:4000/api/stripe
```

---

## 🚧 Future Improvements

- Multi-page website generation
- Custom domain mapping
- GitHub repository export
- Team collaboration workspaces
- Automated testing
- CI/CD pipeline
- Rate limiting
- AI-generated component libraries

---

## 👨‍💻 Author

**Harsh Goel**

GitHub: https://github.com/hrsh-arcx

LinkedIn: https://linkedin.com/in/harsh-goel-090a00315

Email: harsh18goel@gmail.com


---

⭐ If you found this project interesting, consider giving the repository a star.
