import React, { useContext, useEffect, useState, createContext, ReactNode } from "react";
import axiosInstance from "../utils/axiosConfig"; // Import axios instance

interface AuthContextType {
    currentUser: User | null;
    userLoggedIn: boolean;
    loading: boolean;
    logout: () => void;
}

interface User {
    googleId: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: {
        name: string;
        permissions: string[];
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get("/api/users/user"); 
                setCurrentUser(response.data.data.user);
                setUserLoggedIn(true);
            } catch (error) {
                setCurrentUser(null);
                setUserLoggedIn(false);
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout"); 
            setCurrentUser(null);
            setUserLoggedIn(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const value = React.useMemo(() => ({ currentUser, userLoggedIn, loading, logout }), [currentUser, userLoggedIn, loading, logout]);

    return <AuthContext.Provider value={value}>{
                !loading && children}
            </AuthContext.Provider>;
};
