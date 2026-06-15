import React from "react";
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/auth.context.jsx";
import {Toaster} from "sonner";

export default function App() {
  return (
    <div>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster richColors position="top-right" closeButton theme="light" />
    </div>
  );
}
