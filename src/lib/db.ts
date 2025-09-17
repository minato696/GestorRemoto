// src/lib/db.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Station, Review } from '../types';

interface RadioDB extends DBSchema {
    stations: {
        key: string;
        value: Station;
        indexes: {
            'by-departamento': string;
            'by-activo': number;
        };
    };
    reviews: {
        key: string;
        value: Review;
        indexes: {
            'by-station': string;
            'by-fecha': string;
            'by-station-fecha': [string, string];
        };
    };
}

class Database {
    private db: IDBPDatabase<RadioDB> | null = null;

    async init() {
        if (this.db) return this.db;

        this.db = await openDB<RadioDB>('radio-frequencies-db', 1, {
            upgrade(db) {
                // Crear almacén de estaciones
                if (!db.objectStoreNames.contains('stations')) {
                    const stationStore = db.createObjectStore('stations', { keyPath: 'id' });
                    stationStore.createIndex('by-departamento', 'departamento');
                    stationStore.createIndex('by-activo', 'activo');
                }

                // Crear almacén de revisiones
                if (!db.objectStoreNames.contains('reviews')) {
                    const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' });
                    reviewStore.createIndex('by-station', 'stationId');
                    reviewStore.createIndex('by-fecha', 'fecha');
                    reviewStore.createIndex('by-station-fecha', ['stationId', 'fecha']);
                }
            },
        });

        return this.db;
    }

    // Métodos para Estaciones
    async addStation(station: Station): Promise<string> {
        const db = await this.init();
        await db.add('stations', station);
        return station.id;
    }

    async updateStation(station: Station): Promise<void> {
        const db = await this.init();
        await db.put('stations', station);
    }

    async deleteStation(id: string): Promise<void> {
        const db = await this.init();
        const tx = db.transaction(['stations', 'reviews'], 'readwrite');

        // Eliminar estación
        await tx.objectStore('stations').delete(id);

        // Eliminar todas las revisiones asociadas
        const reviewStore = tx.objectStore('reviews');
        const reviewIndex = reviewStore.index('by-station');
        const reviews = await reviewIndex.getAllKeys(id);

        for (const reviewId of reviews) {
            await reviewStore.delete(reviewId);
        }

        await tx.done;
    }

    async getStation(id: string): Promise<Station | undefined> {
        const db = await this.init();
        return db.get('stations', id);
    }

    async getAllStations(): Promise<Station[]> {
        const db = await this.init();
        return db.getAll('stations');
    }

    async getStationsByDepartamento(departamento: string): Promise<Station[]> {
        const db = await this.init();
        const index = db.transaction('stations').store.index('by-departamento');
        return index.getAll(departamento);
    }

    // Métodos para Revisiones
    async addReview(review: Review): Promise<string> {
        const db = await this.init();
        await db.add('reviews', review);
        return review.id;
    }

    async updateReview(review: Review): Promise<void> {
        const db = await this.init();
        await db.put('reviews', review);
    }

    async deleteReview(id: string): Promise<void> {
        const db = await this.init();
        await db.delete('reviews', id);
    }

    async getReview(id: string): Promise<Review | undefined> {
        const db = await this.init();
        return db.get('reviews', id);
    }

    async getReviewsByStation(stationId: string): Promise<Review[]> {
        const db = await this.init();
        const index = db.transaction('reviews').store.index('by-station');
        return index.getAll(stationId);
    }

    async getReviewsByDate(fecha: string): Promise<Review[]> {
        const db = await this.init();
        const index = db.transaction('reviews').store.index('by-fecha');
        return index.getAll(fecha);
    }

    async getReviewByStationAndDate(stationId: string, fecha: string): Promise<Review | undefined> {
        const db = await this.init();
        const index = db.transaction('reviews').store.index('by-station-fecha');
        const reviews = await index.getAll([stationId, fecha]);
        return reviews[0];
    }

    async getAllReviews(): Promise<Review[]> {
        const db = await this.init();
        return db.getAll('reviews');
    }

    // Métodos de utilidad
    async exportData(): Promise<string> {
        const stations = await this.getAllStations();
        const reviews = await this.getAllReviews();

        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            stations,
            reviews,
        };

        return JSON.stringify(data, null, 2);
    }

    async importData(jsonData: string): Promise<void> {
        try {
            const data = JSON.parse(jsonData);

            if (!data.stations || !data.reviews) {
                throw new Error('Formato de datos inválido');
            }

            const db = await this.init();
            const tx = db.transaction(['stations', 'reviews'], 'readwrite');

            // Limpiar datos existentes
            await tx.objectStore('stations').clear();
            await tx.objectStore('reviews').clear();

            // Importar estaciones
            for (const station of data.stations) {
                await tx.objectStore('stations').add(station);
            }

            // Importar revisiones
            for (const review of data.reviews) {
                await tx.objectStore('reviews').add(review);
            }

            await tx.done;
        } catch (error) {
            throw new Error('Error al importar datos: ' + (error as Error).message);
        }
    }

    async clearAllData(): Promise<void> {
        const db = await this.init();
        const tx = db.transaction(['stations', 'reviews'], 'readwrite');
        await tx.objectStore('stations').clear();
        await tx.objectStore('reviews').clear();
        await tx.done;
    }
}

export const db = new Database();