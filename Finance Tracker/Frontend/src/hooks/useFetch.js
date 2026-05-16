import {useState} from "react";
import {useAuth} from "@clerk/react";
import {toast} from "sonner";

// Simple global cache to prevent redundant loading screens
const cache = {};

const useFetch = (cb, cacheKey = null) => {
    const {getToken} = useAuth();

    const [data, setData] = useState(() => (cacheKey ? cache[cacheKey] : undefined));
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const fn = async (...args) => {
        // Only show loading state if we don't already have data from cache
        if (data === undefined) {
            setLoading(true);
        }
        setError(null);

        try {
            const token = await getToken();
            const response = await cb(token, ...args);
            setData(response);
            if (cacheKey) cache[cacheKey] = response;
            setError(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setError(error);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return {data, loading, error, fn, setData};
};

export default useFetch;
