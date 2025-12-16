## Run the app locally

1) Install Node 18+ and npm (npm comes with Node).
2) Clone the repo and install dependencies:
   npm install

3) Create your env file (adjust values as needed):
   copy .env.example .env   # PowerShell: cp .env.example .env

4) Start the frontend (Vite):
   npm run dev
   # Opens on http://localhost:5173

5) (Optional) Start the email server for PDF emails:
   npm run email-server
   # or run both together:
   npm run dev:full
   # Email API on http://localhost:4000 by default

## Useful scripts
- npm run build        # Production build
- npm run preview      # Preview production build locally
- npm run lint         # ESLint
- npm test             # Vitest unit/integration tests
- npm run test:watch   # Watch mode
- npm run test:coverage
