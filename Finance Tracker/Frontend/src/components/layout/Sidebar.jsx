import { Link, useLocation } from "react-router";
import { LayoutDashboard, Wallet, Receipt, PieChart, BarChart3, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Accounts", url: "/accounts", icon: Wallet },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Investments", url: "/investments", icon: TrendingUp },
  { title: "Budget", url: "/budget", icon: PieChart },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      <div className="w-54 border-r h-[calc(100vh-80px)] fixed top-20 bg-card text-card-foreground p-4 pr-3 hidden md:block z-10">
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:text-white" : "text-slate-800 dark:text-slate-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      </div>
      <div className="w-60 hidden md:block shrink-0" />
    </>
  );
}
