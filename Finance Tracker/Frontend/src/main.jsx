import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {ClerkProvider} from "@clerk/react";
import {BrowserRouter, useNavigate} from "react-router";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function ClerkWithRouter() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      routerPush={(to) => navigate(to)} //
      routerReplace={(to) => navigate(to, {replace: true})}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClerkWithRouter />
  </BrowserRouter>,
);
