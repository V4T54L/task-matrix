import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

type AuthContextType = {
    user: User | null;
    login: (user: User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.user) setUser(parsed.user);
        }
    }, []);

    const login = (user: User, token: string) => {
        setUser(user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
