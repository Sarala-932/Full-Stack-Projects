import React from "react";
import { useLocation } from "react-router";

export default function Footer() {
    const { pathname } = useLocation();
    
    return (
        <footer className={`py-9 border-t ${pathname === '/' ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-background/50 mt-12 border-border text-gray-700'}`}>
            <div className="container mx-auto px-4 text-center">
                <p>Made with ❤️ by Sarala</p>
            </div>
        </footer>
    );
}
