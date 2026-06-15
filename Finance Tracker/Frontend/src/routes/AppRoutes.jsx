import {Routes, Route, Navigate, useLocation} from "react-router";
import {useAuth as useClerkAuth} from "@clerk/react";
import {BarLoader} from "react-spinners";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Pages
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import Account from "../pages/Account";
import AddTransaction from "../pages/AddTransaction";

const ProtectedRoute = ({children}) => {
  const {isSignedIn, isLoaded} = useClerkAuth();
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <BarLoader color="#9333ea" width={200} />
      </div>
    );
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
};

export default function AppRoutes() {
  const location = useLocation();
  const hideFooterPaths = ["/transaction/create"];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transaction/create"
            element={
              <ProtectedRoute>
                <AddTransaction />
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
