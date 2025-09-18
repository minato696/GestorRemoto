// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserPermissions } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: keyof UserPermissions) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración de usuarios
const USERS_CONFIG = {
    administrador: {
        password: '147ABC55',
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
        password: '147ABC55',
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
    ver: {
        password: '147ABC55',
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

// Importamos addToHistory de forma condicional para evitar errores de dependencia circular
let addToHistory: any = null;
if (typeof window !== 'undefined') {
    import('../components/History/ChangeHistory').then(module => {
        addToHistory = module.addToHistory;
    });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay una sesión guardada
        const checkAuth = () => {
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
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const userConfig = USERS_CONFIG[username as keyof typeof USERS_CONFIG];

        if (userConfig && userConfig.password === password) {
            const newUser: User = {
                id: `user-${username}`,
                username,
                email: `${username}`,
                role: userConfig.role,
                permissions: userConfig.permissions,
                lastLogin: new Date().toISOString(),
            };

            setUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            // Agregar al historial si está disponible
            if (addToHistory) {
                addToHistory(
                    'login',
                    'system',
                    `Inicio de sesión: ${username}`,
                    { role: userConfig.role, timestamp: new Date().toISOString() }
                );
            }

            const roleNames = {
                admin: 'Administrador',
                operator: 'Operador',
                viewer: 'Visualizador'
            };
            toast.success(`Bienvenido ${username} (${roleNames[userConfig.role]})`);

            return true;
        }

        toast.error('Usuario o contraseña incorrectos');
        return false;
    };

    const logout = () => {
        const currentUser = user;

        if (currentUser && addToHistory) {
            addToHistory(
                'logout',
                'system',
                `Cierre de sesión: ${currentUser.username}`,
                { timestamp: new Date().toISOString() }
            );
        }

        setUser(null);
        localStorage.removeItem('currentUser');
        toast.success('Sesión cerrada correctamente');
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
        isLoading,
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