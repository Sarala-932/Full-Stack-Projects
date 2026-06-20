# Wealth Wise - Personal Finance Tracker 💰

Welcome to **Wealth Wise**, a comprehensive full-stack personal finance tracking application. Wealth Wise helps you effortlessly manage your finances by tracking multiple accounts, monitoring transactions, setting budgets, managing investments, and generating insightful reports.

## 🌟 Features

- **Multi-Account Management:** Create and manage various financial accounts (e.g., Bank, Credit Card, Cash) in one centralized dashboard.
- **Investment Portfolio:** Track your investments across Stocks, Mutual Funds, and Crypto with real-time API integrations.
- **Advanced Budgeting:** Set overall category budgets, or dive deep with per-account and per-category budgeting.
- **Transaction Tracking:** Easily log income and expenses. Supports recurring transactions (daily, weekly, monthly, yearly).
- **Interactive Dashboard & Reports:** Visualize your spending and income through beautiful, interactive charts and graphs using Recharts.
- **AI-Powered Receipt Scanning:** Upload receipts and automatically extract transaction details (using Gemini AI).
- **Secure & Fast:** Built with Clerk for secure authentication, and Arcjet for robust rate-limiting and security.
- **Background Processing:** Reliable background jobs powered by Inngest for recurring transactions and automated alerts.
- **Premium UI/UX:** A visually stunning, highly responsive dark/light mode interface built with Tailwind CSS and Shadcn UI.

## 🚀 Technology Stack

**Frontend:**
- **React.js (Vite)**
- **Tailwind CSS v4** & **Shadcn UI** for modern, responsive, and accessible components.
- **React Router v7** for seamless navigation.
- **Recharts** for data visualization.
- **React Hook Form** & **Zod** for form validation.

**Backend:**
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** for data storage.
- **Clerk** for User Authentication.
- **Arcjet** for Bot Protection & Rate Limiting.
- **Inngest** for Background Task Management.
- **Google Gemini API** for intelligent receipt parsing.
- **Yahoo Finance API** for investment data.
- **mfapi.in** for mutual fund data. 


## 📂 Project Structure

A detailed overview of the application's directory structure and architecture.

### Frontend Structure (`/Frontend`)
```text
Frontend/
├── public/                 # Static assets like favicon and logo
├── src/                    # Main application source code
│   ├── assets/             # Images, SVGs, and global styles
│   ├── components/         # Reusable React components
│   │   ├── account/        # Account details & transaction tables
│   │   ├── dashboard/      # Dashboard cards, charts, and overviews
│   │   ├── home/           # Landing page sections (Hero, Features, etc.)
│   │   ├── investments/    # Investment tracking & portfolio components
│   │   ├── layout/         # App Layout, Sidebar, Header, Footer
│   │   ├── transaction/    # Transaction forms & AI receipt scanner
│   │   └── ui/             # Shadcn UI reusable generic components
│   ├── context/            # React Context (Auth, Theme)
│   ├── data/               # Static data (landing page content, categories)
│   ├── hooks/              # Custom React hooks (e.g., useFetch)
│   ├── lib/                # Utility functions and API helpers
│   ├── pages/              # Main route pages (Dashboard, Settings, etc.)
│   ├── routes/             # App routing configuration (Protected routes)
│   ├── services/           # Axios API services for backend communication
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global Tailwind CSS and Theme variables
│   └── main.jsx            # React application entry point
├── .env                    # Frontend environment variables
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite bundler configuration
```

### Backend Structure (`/Backend`)
```text
Backend/
├── src/                    # Main server source code
│   ├── controllers/        # Business logic for API endpoints
│   ├── emails/             # Email templates and email sending logic
│   ├── inngest/            # Background jobs & scheduled tasks (cron)
│   ├── inngestroute/       # Inngest API route integration
│   ├── lib/                # Utility functions (e.g., Arcjet setup)
│   ├── middleware/         # Express middleware (Clerk Auth, Error handling)
│   ├── models/             # Mongoose schemas (User, Account, Transaction)
│   ├── seed/               # Database seeding scripts for initial data
│   ├── index.mjs           # Express server entry point & DB connection
│   └── route.mjs           # Express API route definitions
├── .env                    # Backend environment variables
└── package.json            # Backend dependencies and scripts
```
