// src/pages/index.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from '../components/Auth/LoginPage';

// Importamos el componente principal con carga dinámica para evitar problemas con SSR e IndexedDB
const MainLayout = dynamic(
    () => import('../components/Layout/MainLayout').then(mod => mod.MainLayout),
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

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Verificar si hay una sesión guardada
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setIsAuthenticated(true);
        }
        setIsCheckingAuth(false);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    // Mostrar loader mientras verifica autenticación
    if (isCheckingAuth) {
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

    return (
        <>
            <Head>
                <title>RadioControl - Sistema de Gestión de Frecuencias</title>
                <meta name="description" content="Sistema profesional para gestionar frecuencias de radio por departamento y localidad con monitoreo en tiempo real" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#3b82f6" />
                <link rel="icon" href="/favicon.ico" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://radiocontrol.app/" />
                <meta property="og:title" content="RadioControl - Sistema de Gestión de Frecuencias" />
                <meta property="og:description" content="Sistema profesional para gestionar frecuencias de radio con monitoreo en tiempo real" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://radiocontrol.app/" />
                <meta property="twitter:title" content="RadioControl - Sistema de Gestión de Frecuencias" />
                <meta property="twitter:description" content="Sistema profesional para gestionar frecuencias de radio con monitoreo en tiempo real" />
            </Head>

            <AuthProvider>
                {!isAuthenticated ? (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <MainLayout onLogout={handleLogout} />
                )}
            </AuthProvider>
        </>
    );
}