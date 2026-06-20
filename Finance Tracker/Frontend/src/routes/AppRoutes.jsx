import {Routes, Route, Navigate, useLocation} from "react-router";
import {useAuth as useClerkAuth} from "@clerk/react";
import {BarLoader} from "react-spinners";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppLayout from "../components/layout/AppLayout";

// Pages
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import Account from "../pages/Account";
import AccountsList from "../pages/AccountsList";
import TransactionsPage from "../pages/TransactionsPage";
import BudgetPage from "../pages/BudgetPage";
import ReportsPage from "../pages/ReportsPage";
import AddTransaction from "../pages/AddTransaction";
import InvestmentsPage from "../pages/InvestmentsPage";
import SettingsPage from "../pages/SettingsPage";

const ProtectedRoute = ({children}) => {
  const {isSignedIn, isLoaded} = useClerkAuth();
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <BarLoader color="#9333ea" width={200} />
      </div>
    );
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
};

export default function AppRoutes() {
  const location = useLocation();
  const shouldShowFooter = location.pathname === "/" || location.pathname.startsWith("/sign");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`grow ${location.pathname === '/' ? '' : 'pb-12'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AccountsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TransactionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BudgetPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InvestmentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Account />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transaction/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddTransaction />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}
