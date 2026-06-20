import {createContext, useState, useEffect, useRef} from "react";
import {useAuth as useClerkAuth, useUser} from "@clerk/react";
import {syncUserWithBackend} from "../services/auth.api.js";

const AuthContext = createContext();

function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSyncing = useRef(false);

  const {isSignedIn, getToken, isLoaded: isAuthLoaded} = useClerkAuth();
  const {user: clerkUser, isLoaded: isUserLoaded} = useUser();

  const handleSync = async () => {
    if (isSyncing.current) return;

    if (isAuthLoaded && isUserLoaded && isSignedIn && clerkUser) {
      isSyncing.current = true;
      setLoading(true);
      try {
        const token = await getToken();
        const userData = {
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "",
          email: clerkUser.emailAddresses[0].emailAddress,
          imageUrl: clerkUser.imageUrl || "",
        };
        const response = await syncUserWithBackend(userData, token);
        setUser(response.data.user);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        isSyncing.current = false;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;
    const sync = async () => {
      if (!ignore && isAuthLoaded && isUserLoaded) {
        if (isSignedIn) {
          await handleSync();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    };

    sync();

    return () => {
      ignore = true;
    };
  }, [isSignedIn, isAuthLoaded, isUserLoaded]);

  return <AuthContext.Provider value={{user, setUser, loading, setLoading, error, setError, handleSync}}>{children}</AuthContext.Provider>;
}

export {AuthContext};
export default AuthProvider;
