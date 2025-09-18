// src/types/index.ts

// Tipos existentes
export interface Station {
    id: string;
    departamento: string;
    localidad: string;
    frecuencias: {
        karibena: string;
        exitosa: string;
        laKalle: string;
        saborMix: string;
    };
    accesoRemoto: {
        disponible: boolean;
        tipoSoftware: 'TeamViewer' | 'AnyDesk' | 'Otro' | '';
        idRemoto: string;
        password: string;
    };
    contactoAdministrador: string;
    activo: boolean;
    observaciones: string;
    ultimaActualizacion: string;
}

export interface Review {
    id: string;
    stationId: string;
    fecha: string;
    revisado: boolean;
    estado: 'activo' | 'inactivo' | 'problema';
    notas: string;
    horaRevision?: string;
}

export interface Statistics {
    total: number;
    activas: number;
    conProblemas: number;
    inactivas: number;
    sinRevisar: number;
    fecha: string;
}

export type FilterOptions = {
    departamento: string;
    busqueda: string;
    soloActivas: boolean;
};

// NUEVOS TIPOS PARA AUTENTICACIÓN Y PERMISOS
export type UserRole = 'admin' | 'operator' | 'viewer';

export interface UserPermissions {
    canAdd: boolean;      // Puede agregar estaciones
    canEdit: boolean;     // Puede editar estaciones
    canDelete: boolean;   // Puede eliminar estaciones
    canReview: boolean;   // Puede hacer revisiones
    canExport: boolean;   // Puede exportar datos
    canImport: boolean;   // Puede importar datos
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    permissions: UserPermissions;
    lastLogin?: string;
}