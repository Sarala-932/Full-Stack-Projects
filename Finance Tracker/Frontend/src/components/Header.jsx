import {Show, UserButton} from "@clerk/react";
import {LayoutDashboard, PenBox} from "lucide-react";
import {Link, useLocation} from "react-router";
import {Button} from "./ui/button";

export default function Header() {
  const {pathname} = useLocation();
  const isSignInPage = pathname.startsWith("/sign-in");

  const match = pathname.match(/^\/accounts\/([^/]+)/);
  const currentAccountId = match ? match[1] : null;
  const createTransactionLink = currentAccountId ? `/transaction/create?accountId=${currentAccountId}` : "/transaction/create";

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b pr-0! mr-0!">
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
            {/* The Dashboard and Add Transaction buttons have been moved to the sidebar and dashboard layout */}
          </Show>

          <Show when="signed-out">
            {!isSignInPage && (
              <Link to="/sign-in">
                <Button variant="outline">Login</Button>
              </Link>
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
