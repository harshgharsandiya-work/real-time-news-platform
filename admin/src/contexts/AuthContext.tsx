import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../config/firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { api } from "../lib/api";

interface AuthContextType {
    user: User | null;
    jwtToken: string | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(
        localStorage.getItem("admin_jwt"),
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Just refresh token on start just in case
            } else {
                setJwtToken(null);
                localStorage.removeItem("admin_jwt");
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const login = async (email: string, pass: string) => {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const token = await cred.user.getIdToken();

        // Exchange with Backend
        const res = await api.post(
            "/auth/login",
            {
                platform: "web",
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );

        const customJwt = res.data.data.token;
        setJwtToken(customJwt);
        localStorage.setItem("admin_jwt", customJwt);
    };

    const logout = async () => {
        await signOut(auth);
        setJwtToken(null);
        localStorage.removeItem("admin_jwt");
    };

    return (
        <AuthContext.Provider
            value={{ user, jwtToken, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
