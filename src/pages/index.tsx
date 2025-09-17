// src/pages/index.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Importamos el componente dinámicamente para evitar problemas con SSR e IndexedDB
const SistemaFrecuenciasRadio = dynamic(
    () => import('../components/SistemaFrecuenciasRadio'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando sistema...</p>
                </div>
            </div>
        )
    }
);

export default function Home() {
    return (
        <>
            <Head>
                <title>Sistema de Gestión de Frecuencias de Radio</title>
                <meta name="description" content="Sistema para gestionar frecuencias de radio por departamento y localidad" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <SistemaFrecuenciasRadio />
        </>
    );
}