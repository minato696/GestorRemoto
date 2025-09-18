// src/components/Auth/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPermissions } from '../../types';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: keyof UserPermissions;
    fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermission,
    fallback,
}) => {
    const { hasPermission, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                        <Lock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
                    <p className="text-gray-600">Debes iniciar sesión para acceder a esta página</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Volver al Login
                    </button>
                </div>
            </div>
        );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return fallback || (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-yellow-900">Permisos Insuficientes</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            No tienes los permisos necesarios para realizar esta acción.
                            Contacta con el administrador si necesitas acceso.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};