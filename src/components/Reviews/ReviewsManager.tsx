// src/components/Reviews/ReviewsManager.tsx
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    CheckCircle,
    AlertCircle,
    XCircle,
    Activity,
    Clock,
    MapPin,
    Radio,
    Filter,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Station, Review } from '../../types';
import { ReviewModal } from '../Modals/ReviewModal';
import { usePermissions } from '../../hooks/usePermissions';
import toast from 'react-hot-toast';

interface ReviewsManagerProps {
    stations: Station[];
    reviews: Review[];
    selectedDate: string;
    onDateChange: (date: string) => void;
    onSaveReview: (stationId: string, review: { estado: 'activo' | 'problema' | 'inactivo'; notas: string }) => Promise<void>;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({
    stations,
    reviews,
    selectedDate,
    onDateChange,
    onSaveReview
}) => {
    const { canReview } = usePermissions();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [filterDepartamento, setFilterDepartamento] = useState('');
    const [filterEstado, setFilterEstado] = useState<'todos' | 'pendientes' | 'revisados'>('todos');

    // Obtener departamentos únicos
    const departamentos = useMemo(() => {
        return Array.from(new Set(stations.map(s => s.departamento))).sort();
    }, [stations]);

    // Obtener revisión para una estación
    const getReviewForStation = (stationId: string): Review | undefined => {
        return reviews.find(r => r.stationId === stationId && r.fecha === selectedDate);
    };

    // Filtrar estaciones
    const filteredStations = useMemo(() => {
        return stations.filter(station => {
            // Filtro por departamento
            if (filterDepartamento && station.departamento !== filterDepartamento) return false;

            // Filtro por estado de revisión
            const review = getReviewForStation(station.id);
            if (filterEstado === 'pendientes' && review) return false;
            if (filterEstado === 'revisados' && !review) return false;

            return true;
        });
    }, [stations, reviews, selectedDate, filterDepartamento, filterEstado]);

    // Estadísticas del día
    const dayStats = useMemo(() => {
        const todayReviews = reviews.filter(r => r.fecha === selectedDate);
        const reviewedIds = new Set(todayReviews.map(r => r.stationId));

        return {
            total: stations.length,
            revisadas: todayReviews.length,
            pendientes: stations.length - todayReviews.length,
            activas: todayReviews.filter(r => r.estado === 'activo').length,
            conProblemas: todayReviews.filter(r => r.estado === 'problema').length,
            inactivas: todayReviews.filter(r => r.estado === 'inactivo').length,
            porcentaje: stations.length > 0 ? Math.round((todayReviews.length / stations.length) * 100) : 0
        };
    }, [stations, reviews, selectedDate]);

    const handleReview = (station: Station) => {
        if (!canReview) {
            toast.error('No tienes permisos para hacer revisiones');
            return;
        }
        setSelectedStation(station);
        setShowReviewModal(true);
    };

    const handleDateNavigation = (direction: 'prev' | 'next') => {
        const currentDate = new Date(selectedDate);
        if (direction === 'prev') {
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        onDateChange(format(currentDate, 'yyyy-MM-dd'));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            Revisiones Diarias
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitorea el estado de las estaciones de radio
                        </p>
                    </div>

                    {/* Selector de fecha con navegación */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        <button
                            onClick={() => handleDateNavigation('prev')}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-2 px-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                className="bg-white px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <button
                            onClick={() => handleDateNavigation('next')}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => onDateChange(format(new Date(), 'yyyy-MM-dd'))}
                            className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas del día */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dayStats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Estaciones</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-gray-500">Revisadas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{dayStats.revisadas}</p>
                    <p className="text-xs text-gray-500 mt-1">{dayStats.porcentaje}% completado</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="text-xs text-gray-500">Pendientes</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{dayStats.pendientes}</p>
                    <p className="text-xs text-gray-500 mt-1">Por revisar</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-gray-500">Activas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{dayStats.activas}</p>
                    <p className="text-xs text-gray-500 mt-1">Funcionando</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-xs text-gray-500">Problemas</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{dayStats.conProblemas}</p>
                    <p className="text-xs text-gray-500 mt-1">Con fallos</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-xs text-gray-500">Inactivas</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{dayStats.inactivas}</p>
                    <p className="text-xs text-gray-500 mt-1">Sin señal</p>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Progreso de Revisión
                    </h3>
                    <span className="text-2xl font-bold text-gray-900">{dayStats.porcentaje}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${dayStats.porcentaje}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{dayStats.revisadas} revisadas</span>
                    <span>{dayStats.pendientes} pendientes</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filtros:</span>
                    </div>

                    <select
                        value={filterDepartamento}
                        onChange={(e) => setFilterDepartamento(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        <option value="">Todos los departamentos</option>
                        {departamentos.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterEstado('todos')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterEstado === 'todos'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Todas ({stations.length})
                        </button>
                        <button
                            onClick={() => setFilterEstado('pendientes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterEstado === 'pendientes'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Pendientes ({dayStats.pendientes})
                        </button>
                        <button
                            onClick={() => setFilterEstado('revisados')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterEstado === 'revisados'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Revisadas ({dayStats.revisadas})
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de estaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => {
                    const review = getReviewForStation(station.id);
                    const isReviewed = !!review;

                    return (
                        <div
                            key={station.id}
                            className={`bg-white rounded-xl border ${isReviewed ? 'border-green-200' : 'border-gray-200'
                                } p-5 hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <h4 className="font-semibold text-gray-900">{station.localidad}</h4>
                                    </div>
                                    <p className="text-sm text-gray-500">{station.departamento}</p>
                                </div>
                                {isReviewed && (
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500">Revisado</span>
                                        <p className="text-xs font-medium text-gray-700">{review.horaRevision}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Radio className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">
                                        {station.frecuencias.karibena || station.frecuencias.exitosa || 'Sin frecuencias'}
                                    </span>
                                </div>
                                {station.contactoAdministrador && (
                                    <div className="text-sm text-gray-500">
                                        Contacto: {station.contactoAdministrador}
                                    </div>
                                )}
                            </div>

                            {isReviewed ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            {review.estado === 'activo' && (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-600">Funcionando</span>
                                                </>
                                            )}
                                            {review.estado === 'problema' && (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-sm font-medium text-yellow-600">Con problema</span>
                                                </>
                                            )}
                                            {review.estado === 'inactivo' && (
                                                <>
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    <span className="text-sm font-medium text-red-600">Sin señal</span>
                                                </>
                                            )}
                                        </div>
                                        {review.notas && (
                                            <p className="text-xs text-gray-600 mt-1 italic">"{review.notas}"</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleReview(station)}
                                        disabled={!canReview}
                                        className={`
                                            w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium
                                            ${canReview
                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        Actualizar revisión
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleReview(station)}
                                    disabled={!canReview}
                                    className={`
                                        w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium
                                        ${canReview
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {canReview ? 'Revisar ahora' : 'Sin permisos'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredStations.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                    <div className="text-center">
                        <Radio className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay estaciones para mostrar</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Ajusta los filtros para ver más resultados
                        </p>
                    </div>
                </div>
            )}

            {/* Modal de revisión */}
            {showReviewModal && selectedStation && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedStation(null);
                    }}
                    onSave={(review) => onSaveReview(selectedStation.id, review)}
                    station={selectedStation}
                    existingReview={getReviewForStation(selectedStation.id)}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
};