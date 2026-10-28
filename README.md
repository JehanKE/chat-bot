# Modern AI Chat Application

A high-performance, full-stack AI chatbot application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Google Gemini**, **NextAuth v5**, and **Neon Serverless Postgres**.

---

## Features

- **Modern Chat Interface:**
  - Collapsible sidebar with mini-rail collapsed state.
  - Dark and Light theme toggle synchronized with system settings.
  - High-contrast markdown renderer supporting code blocks, inline code, quotes, and copy buttons.
  - Seamless auto-scrolling and responsive message streaming animation.

- **AI Engine (Google Gemini):**
  - Powered by Google Gemini API (`@google/genai`).
  - Utilizes `gemini-3.8-flash` with zero-latency response generation.
  - Multi-turn conversation memory preserves context across messages.

- **Authentication (NextAuth v5 / Auth.js):**
  - Google OAuth sign-in / sign-out.
  - Secure profile popover with avatar, email display, and quick actions.
  - Protected chat workflows: non-authenticated users are prompted to sign in before messaging.

- **Usage Quotas & Neon Postgres Database:**
  - Backed by serverless PostgreSQL on **Neon**.
  - Tracks user prompt usage by email.
  - Enforces a 5-prompt free tier per registered user.
  - Live in-app quota badges showing remaining queries (`X / 5 prompts left`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Frontend** | [React 19](https://react.dev/), Arrow Function Components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **AI SDK** | [`@google/genai`](https://github.com/google-gemini/deprecations) (Gemini 3.8 Flash) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (Google Provider) |
| **Database** | [Neon Serverless Postgres](https://neon.tech/) via `@neondatabase/serverless` |

---

## Database Schema

The application uses a PostgreSQL table on Neon to manage user prompt allocations:
- When a user signs in, their account is registered into the table.
- Each submitted prompt increments `queries`.
- Once `queries >= 5`, further prompts are blocked with a clear quota notice.

---

## Environment Variables

Create a `.env` file in the root directory and populate the following variables:

```env
# NextAuth / Auth.js Secret
AUTH_SECRET=your_nextauth_secret_key

# Google OAuth Credentials (Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key

# Neon Postgres Database URL (from Vercel or Neon Console)
DATABASE_URL=postgresql://<user>:<password>@<neon-endpoint-pooler>.neon.tech/<dbname>?sslmode=require
```

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd chat-bot
npm install
```

### 2. Configure Environment

Copy `.env.example` or create `.env` as shown above with your credentials.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
