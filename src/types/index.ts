// src/types/index.ts

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