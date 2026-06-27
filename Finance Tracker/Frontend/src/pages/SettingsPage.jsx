import React from "react";
import { useTheme } from "../context/theme.context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        {
            id: "light",
            name: "Light Mode",
            description: "Clean, classic white aesthetic.",
            icon: Sun,
            colorClass: "bg-white border-slate-200 text-slate-800"
        },
        {
            id: "theme-blue",
            name: "Blue Dark",
            description: "Soft bluish slate for a soothing glassmorphic feel.",
            icon: Moon,
            colorClass: "bg-slate-800 border-slate-700 text-slate-100"
        },
        {
            id: "theme-black",
            name: "Black Dark",
            description: "Ultra-premium deep space dark with vibrant accents.",
            icon: Sparkles,
            colorClass: "bg-black border-slate-100 text-slate-100"
        }
    ];

    return (
        <div className="space-y-6 px-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight gradient-title">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences and appearance.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of your Wealth Wise.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {themeOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => setTheme(option.id)}
                                    className={cn(
                                        "flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                        theme === option.id 
                                            ? "border-primary bg-primary/5 shadow-md" 
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-full border", option.colorClass)}>
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <div className="font-medium">{option.name}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
