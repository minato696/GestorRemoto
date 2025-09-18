// src/components/Auth/AuthWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from './Login';
import dynamic from 'next/dynamic';

// Cargamos MainLayout dinámicamente
const MainLayout = dynamic(
    () => import('../Layout/MainLayout').then(mod => mod.MainLayout),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando sistema...</p>
                    <p className="text-sm text-gray-500 mt-1">RadioControl v2.0</p>
                </div>
            </div>
        )
    }
);

export const AuthWrapper: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        if (user) {
            setShowLogin(false);
        } else {
            setShowLogin(true);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return showLogin ? (
        <Login onSuccess={() => setShowLogin(false)} />
    ) : (
        <MainLayout />
    );
};