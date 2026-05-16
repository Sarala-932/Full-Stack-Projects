import {Show, UserButton} from "@clerk/react";
import {LayoutDashboard, PenBox} from "lucide-react";
import {Link, useLocation} from "react-router";
import {Button} from "./ui/button";

export default function Header() {
  const {pathname} = useLocation();
  const isSignInPage = pathname.startsWith("/sign-in");

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="Wealth Wise Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <Show when="signed-in">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline cursor-pointer">Dashboard</span>
              </Button>
            </Link>

            <Link to="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline cursor-pointer">Add Transaction</span>
              </Button>
            </Link>
          </Show>

          <Show when="signed-out">
            {!isSignInPage && (
              <Button variant="outline">
                <Link to="/sign-in">Login</Link>
              </Button>
            )}
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </Show>
        </div>
      </nav>
    </div>
  );
}
