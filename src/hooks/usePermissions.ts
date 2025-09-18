// src/hooks/usePermissions.ts
import { useAuth } from '../context/AuthContext';  // CAMBIAR: contexts → context
import { UserPermissions } from '../types';

export const usePermissions = () => {
    const { user, hasPermission } = useAuth();

    const checkPermission = (permission: keyof UserPermissions): boolean => {
        return hasPermission(permission);
    };

    const checkMultiplePermissions = (permissions: (keyof UserPermissions)[]): boolean => {
        return permissions.every(permission => hasPermission(permission));
    };

    const checkAnyPermission = (permissions: (keyof UserPermissions)[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    return {
        user,
        canAdd: hasPermission('canAdd'),
        canEdit: hasPermission('canEdit'),
        canDelete: hasPermission('canDelete'),
        canReview: hasPermission('canReview'),
        canExport: hasPermission('canExport'),
        canImport: hasPermission('canImport'),
        checkPermission,
        checkMultiplePermissions,
        checkAnyPermission,
    };
};