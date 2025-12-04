This frontend is a Vite + React + TypeScript + Tailwind client for the ONI library management system.

## Getting started

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

## Docker

To build and run the production build in Docker:

```bash
docker build -t oni-client .
docker run -p 8080:80 oni-client
```

Then open `http://localhost:8080` in your browser.
