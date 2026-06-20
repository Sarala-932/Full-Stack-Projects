import {Show, UserButton} from "@clerk/react";
import {PenBox} from "lucide-react";
import {Link, useLocation} from "react-router";
import {Button} from "./ui/button";

export default function Header() {
    const {pathname} = useLocation();
    const isSignInPage = pathname.startsWith("/sign-in");

    const match = pathname.match(/^\/accounts\/([^/]+)/);
    const currentAccountId = match ? match[1] : null;
    const createTransactionLink = currentAccountId
        ? `/transaction/create?accountId=${currentAccountId}`
        : "/transaction/create";

    return (
        <div
            className={`fixed top-0 w-full backdrop-blur-md z-50 border-b ${pathname === "/" ? "bg-slate-900/80 border-slate-800" : "bg-background/95 border-border"}`}
        >
            <nav className="w-full px-6 lg:px-24 py-4 flex items-center justify-between">
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
                        <Link to={createTransactionLink}>
                            <Button className="flex items-center gap-2 cursor-pointer">
                                <PenBox size={18} />
                                <span className="hidden md:inline">Add Transaction</span>
                            </Button>
                        </Link>
                    </Show>

                    <Show when="signed-out">
                        {!isSignInPage && (
                            <Link to="/sign-in">
                                <Button variant="outline" className="cursor-pointer">
                                    Login
                                </Button>
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
