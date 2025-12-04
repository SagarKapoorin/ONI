## ONI Frontend (Client)

This is the React frontend for the ONI library management system, built with **Vite + TypeScript + Tailwind** and talking to a **NestJS** backend.

For an overview of the whole project, see the main `README.md` in the repository root.

## Tech stack

- **React 18+** with **TypeScript**
- **Vite** for dev/build
- **Tailwind CSS**
- **React Router v6+** for routing
- **TanStack Query (React Query)** for server state
- **Context API** for auth state
- **Axios** with interceptors for API calls
- **React Hook Form + Zod** for forms and validation
- **React Toastify** for notifications

## Features

- **Authentication**
  - Login and signup pages with schema validation.
  - JWT-based session handled via Axios + auth context.
  - Protected routes and role-based navigation.

- **Books dashboard**
  - Paginated books list with:
    - Search by title.
    - Filter by author.
    - Filter by status (All / Available / Borrowed).
  - Borrow books (both `USER` and `ADMIN` roles).
  - Optimistic UI when borrowing.

- **Profile**
  - Shows current user details.
  - Shows current user’s borrowed books (for both `USER` and `ADMIN`).
  - Allows returning books from the profile page.
  - Shows human-readable date when a book was returned.

- **Admin panel**
  - Add authors.
  - Add books (assign authors).
  - Manage books (list and delete).
  - View all currently borrowed books and who borrowed them.

## Roles

- `USER`
  - Login / signup.
  - Borrow and return books.
  - View their own borrowed books on the Profile page.

- `ADMIN`
  - All `USER` capabilities (borrow/return, own borrowed list).
  - Access the Admin panel to manage authors and books.
  - View all currently borrowed books across all users.

## Getting started (local dev)

```bash
cd client
npm install
npm run dev
```

The app expects a running NestJS backend. Configure the API base URL via:

```bash
cp .env.example .env
```

Then edit `.env` and set `VITE_API_URL` to your backend URL (for example `http://localhost:3000`).

## Scripts

- `npm run dev` – start Vite dev server.
- `npm run build` – TypeScript project build + Vite production build.
- `npm run preview` – preview the production build.
- `npm run lint` – run ESLint on the project.
- `npm run format` – format code with Prettier.
- `npm run format:check` – check formatting with Prettier.

## Docker

To build and run the production build in Docker:

```bash
cd client
docker build -t oni-client .
docker run -p 8080:80 oni-client
```

Then open `http://localhost:8080` in your browser.

> Note: `VITE_API_URL` is baked into the image at build time, so set it in `.env` before running `docker build`.

---

Made by **Sagar Kapoor**  
Contact: `sagarbadal70@gmail.com`
