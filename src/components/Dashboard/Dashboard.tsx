// src/components/Dashboard/Dashboard.tsx
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Database,
    CheckCircle,
    AlertCircle,
    XCircle,
    Clock,
    Activity,
    TrendingUp,
    BarChart2
} from 'lucide-react';
import { Station, Review, Statistics } from '../../types';

interface DashboardProps {
    stations: Station[];
    reviews: Review[];
    selectedDate: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ stations, reviews, selectedDate }) => {
    // Calcular estadísticas
    const statistics = useMemo((): Statistics => {
        const todayReviews = reviews.filter(r => r.fecha === selectedDate);
        const reviewedStationIds = new Set(todayReviews.map(r => r.stationId));

        return {
            total: stations.length,
            activas: todayReviews.filter(r => r.estado === 'activo').length,
            conProblemas: todayReviews.filter(r => r.estado === 'problema').length,
            inactivas: todayReviews.filter(r => r.estado === 'inactivo').length,
            sinRevisar: stations.filter(s => !reviewedStationIds.has(s.id)).length,
            fecha: selectedDate,
        };
    }, [stations, reviews, selectedDate]);

    // Obtener departamentos únicos
    const departamentos = useMemo(() => {
        return Array.from(new Set(stations.map(s => s.departamento))).sort();
    }, [stations]);

    const progressPercentage = statistics.total > 0
        ? Math.round((statistics.total - statistics.sinRevisar) / statistics.total * 100)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header con fecha */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                <BarChart2 className="h-6 w-6 text-white" />
                            </div>
                            Panel de Control
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(selectedDate), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">
                            {progressPercentage}% Completado
                        </span>
                    </div>
                </div>
            </div>

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.total}</p>
                            <p className="text-xs text-gray-500 mt-1">Estaciones</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <Database className="h-6 w-6 text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activas</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{statistics.activas}</p>
                            <p className="text-xs text-gray-500 mt-1">Funcionando</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Problemas</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{statistics.conProblemas}</p>
                            <p className="text-xs text-gray-500 mt-1">Con fallos</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inactivas</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{statistics.inactivas}</p>
                            <p className="text-xs text-gray-500 mt-1">Sin señal</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-xl">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pendientes</p>
                            <p className="text-3xl font-bold text-gray-600 mt-1">{statistics.sinRevisar}</p>
                            <p className="text-xs text-gray-500 mt-1">Sin revisar</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <Clock className="h-6 w-6 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Progreso y Resumen */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Progreso de Revisión</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Progreso del día</span>
                                <span className="font-semibold text-gray-900">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-600">{statistics.activas}</p>
                                <p className="text-xs text-gray-500">Funcionando</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">{statistics.conProblemas}</p>
                                <p className="text-xs text-gray-500">Problemas</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <p className="text-2xl font-bold text-red-600">{statistics.inactivas}</p>
                                <p className="text-xs text-gray-500">Sin señal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen rápido por departamento */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Database className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Resumen por Departamento</h3>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {departamentos.slice(0, 5).map(dep => {
                            const depStations = stations.filter(s => s.departamento === dep);
                            const depReviews = reviews.filter(r =>
                                depStations.some(s => s.id === r.stationId) && r.fecha === selectedDate
                            );
                            const depProgress = depStations.length > 0
                                ? (depReviews.length / depStations.length * 100)
                                : 0;

                            return (
                                <div key={dep} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{dep}</p>
                                        <p className="text-xs text-gray-500">{depStations.length} estaciones</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                {depReviews.filter(r => r.estado === 'activo').length}
                                            </span>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                                {depReviews.filter(r => r.estado === 'problema').length}
                                            </span>
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                {depReviews.filter(r => r.estado === 'inactivo').length}
                                            </span>
                                        </div>
                                        <div className="w-16">
                                            <div className="text-right text-xs font-medium text-gray-600">
                                                {Math.round(depProgress)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {departamentos.length > 5 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                                +{departamentos.length - 5} departamentos más
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabla completa de departamentos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Detalle Completo por Departamento</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Departamento
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Problemas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Inactivas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sin Revisar
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progreso
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {departamentos.map(dep => {
                                const depStations = stations.filter(s => s.departamento === dep);
                                const depReviews = reviews.filter(r =>
                                    depStations.some(s => s.id === r.stationId) && r.fecha === selectedDate
                                );
                                const reviewedIds = new Set(depReviews.map(r => r.stationId));
                                const sinRevisar = depStations.filter(s => !reviewedIds.has(s.id)).length;
                                const progress = depStations.length > 0
                                    ? ((depStations.length - sinRevisar) / depStations.length * 100)
                                    : 0;

                                return (
                                    <tr key={dep} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{dep}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{depStations.length}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {depReviews.filter(r => r.estado === 'activo').length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {depReviews.filter(r => r.estado === 'problema').length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {depReviews.filter(r => r.estado === 'inactivo').length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {sinRevisar}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 w-10 text-right">
                                                    {Math.round(progress)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {departamentos.length === 0 && (
                        <div className="text-center py-12">
                            <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay datos disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};