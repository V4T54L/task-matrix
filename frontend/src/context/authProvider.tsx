import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { validate } from '../api/auth';

type AuthContextType = {
    user: User | null;
    setupLogin: (user: User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.user) {
                ;(
                    async () => {
                        try {
                            const currentUser = await validate()
                            setUser(currentUser)
                            navigate("/")
                        } catch (error) {
                            console.log("Error validating the user: ", error)
                        }
                    }
                )();
            };
        }
    }, []);

    const setupLogin = (user: User, token: string) => {
        setUser(user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));
        navigate("/")
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, setupLogin, logout }}>
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
