// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserPermissions } from '../types';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: keyof UserPermissions) => boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración de usuarios (en producción, esto vendría de una API)
const USERS_CONFIG = {
    admin: {
        password: 'admin123', // En producción usar hash
        role: 'admin' as UserRole,
        permissions: {
            canAdd: true,
            canEdit: true,
            canDelete: true,
            canReview: true,
            canExport: true,
            canImport: true,
        }
    },
    cusac: {
        password: 'cusac123', // En producción usar hash
        role: 'operator' as UserRole,
        permissions: {
            canAdd: true,
            canEdit: false,
            canDelete: false,
            canReview: true,
            canExport: true,
            canImport: false,
        }
    },
    viewer: {
        password: 'viewer123', // En producción usar hash
        role: 'viewer' as UserRole,
        permissions: {
            canAdd: false,
            canEdit: false,
            canDelete: false,
            canReview: false,
            canExport: true,
            canImport: false,
        }
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Verificar si hay una sesión guardada
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const userConfig = USERS_CONFIG[username as keyof typeof USERS_CONFIG];

        if (userConfig && userConfig.password === password) {
            const newUser: User = {
                id: `user-${username}`,
                username,
                email: `${username}@radiocontrol.com`,
                role: userConfig.role,
                permissions: userConfig.permissions,
                lastLogin: new Date().toISOString(),
            };

            setUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    const hasPermission = (permission: keyof UserPermissions): boolean => {
        if (!user) return false;
        return user.permissions[permission] || false;
    };

    const value = {
        user,
        login,
        logout,
        hasPermission,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};