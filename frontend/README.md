# AyuChain React frontend

```powershell
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` to use a different backend URL.

- `src/components/` contains separate UI components by feature.
- `src/services/` contains backend API, JWT session, and MetaMask code.
- `src/i18n/` contains English, Hindi, and French text.
- `src/styles/` contains the responsive CSS.

The React services implement every current API documented in `backend/README.md`. MetaMask connection is enabled; contract writes need the deployed AyuChain herb contract address and ABI.
