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
            <Toaster
                richColors
                position="top-right"
                closeButton
                theme="light"
                toastOptions={{
                    classNames: {
                        toast: "z-[99999]",
                        closeButton: "cursor-pointer z-[99999] bg-background hover:bg-muted",
                    },
                }}
            />
        </div>
    );
}
