// src/components/Stations/StationsManager.tsx
import React, { useState, useMemo } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    MapPin,
    Radio,
    Wifi,
    WifiOff,
    Phone,
    CheckCircle,
    Signal,
    MoreVertical,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Station, Review, FilterOptions } from '../../types';
import { StationModal } from '../Modals/StationModal';
import { ReviewModal } from '../Modals/ReviewModal';
import toast from 'react-hot-toast';

interface StationsManagerProps {
    stations: Station[];
    reviews: Review[];
    selectedDate: string;
    onAddStation: (station: Partial<Station>) => Promise<void>;
    onUpdateStation: (station: Station) => Promise<void>;
    onDeleteStation: (id: string) => Promise<void>;
    onSaveReview: (stationId: string, review: { estado: 'activo' | 'problema' | 'inactivo'; notas: string }) => Promise<void>;
}

export const StationsManager: React.FC<StationsManagerProps> = ({
    stations,
    reviews,
    selectedDate,
    onAddStation,
    onUpdateStation,
    onDeleteStation,
    onSaveReview
}) => {
    const [filters, setFilters] = useState<FilterOptions>({
        departamento: '',
        busqueda: '',
        soloActivas: false,
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    // Obtener departamentos únicos
    const departamentos = useMemo(() => {
        return Array.from(new Set(stations.map(s => s.departamento))).sort();
    }, [stations]);

    // Filtrar estaciones
    const filteredStations = useMemo(() => {
        return stations.filter(station => {
            if (filters.departamento && station.departamento !== filters.departamento) return false;
            if (filters.soloActivas && !station.activo) return false;
            if (filters.busqueda) {
                const searchLower = filters.busqueda.toLowerCase();
                return (
                    station.departamento.toLowerCase().includes(searchLower) ||
                    station.localidad.toLowerCase().includes(searchLower) ||
                    station.contactoAdministrador.includes(searchLower) ||
                    station.observaciones.toLowerCase().includes(searchLower)
                );
            }
            return true;
        });
    }, [stations, filters]);

    const getReviewForStation = (stationId: string): Review | undefined => {
        return reviews.find(r => r.stationId === stationId && r.fecha === selectedDate);
    };

    const handleEdit = (station: Station) => {
        setSelectedStation(station);
        setShowEditModal(true);
    };

    const handleReview = (station: Station) => {
        setSelectedStation(station);
        setShowReviewModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta estación y todas sus revisiones?')) return;
        await onDeleteStation(id);
        toast.success('Estación eliminada correctamente');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                <Radio className="h-6 w-6 text-white" />
                            </div>
                            Gestión de Estaciones
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Administra las estaciones de radio y sus frecuencias
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Estación
                    </button>
                </div>
            </div>

            {/* Barra de filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar estación..."
                                value={filters.busqueda}
                                onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={filters.departamento}
                            onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
                            className="appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        >
                            <option value="">Todos los departamentos</option>
                            {departamentos.map(dep => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.soloActivas}
                            onChange={(e) => setFilters({ ...filters, soloActivas: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Solo activas</span>
                    </label>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Mostrando {filteredStations.length} de {stations.length} estaciones
                    </span>
                    {filters.busqueda || filters.departamento || filters.soloActivas ? (
                        <button
                            onClick={() => setFilters({ departamento: '', busqueda: '', soloActivas: false })}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Limpiar filtros
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Vista de tabla o grid */}
            {viewMode === 'table' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Frecuencias
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acceso Remoto
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStations.map((station) => {
                                    const review = getReviewForStation(station.id);
                                    const isExpanded = expandedRow === station.id;

                                    return (
                                        <React.Fragment key={station.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{station.localidad}</p>
                                                            <p className="text-sm text-gray-500">{station.departamento}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {station.frecuencias.karibena && (
                                                            <div className="flex items-center gap-2">
                                                                <Signal className="h-3 w-3 text-gray-400" />
                                                                <span className="text-sm text-gray-700">
                                                                    <span className="font-medium">Karibeña:</span> {station.frecuencias.karibena}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {station.frecuencias.exitosa && (
                                                            <div className="flex items-center gap-2">
                                                                <Signal className="h-3 w-3 text-gray-400" />
                                                                <span className="text-sm text-gray-700">
                                                                    <span className="font-medium">Exitosa:</span> {station.frecuencias.exitosa}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!station.frecuencias.karibena && !station.frecuencias.exitosa && (
                                                            <span className="text-sm text-gray-400">Sin frecuencias</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {station.accesoRemoto.disponible ? (
                                                        <div className="flex items-center gap-2">
                                                            <Wifi className="h-4 w-4 text-green-600" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {station.accesoRemoto.tipoSoftware}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {station.accesoRemoto.idRemoto}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <WifiOff className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm text-gray-400">No disponible</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {station.activo ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                        {review && (
                                                            <div className="flex items-center gap-1">
                                                                {review.estado === 'activo' && (
                                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Revisado
                                                                    </span>
                                                                )}
                                                                {review.estado === 'problema' && (
                                                                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                                                                        <Signal className="h-3 w-3" />
                                                                        Problema
                                                                    </span>
                                                                )}
                                                                {review.estado === 'inactivo' && (
                                                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                                                        <WifiOff className="h-3 w-3" />
                                                                        Sin señal
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleReview(station)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Revisar"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(station)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(station.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : station.id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Más detalles"
                                                        >
                                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <h4 className="text-sm font-semibold text-gray-700">Información adicional</h4>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm">
                                                                        <span className="text-gray-500">Contacto:</span>{' '}
                                                                        <span className="font-medium">{station.contactoAdministrador || 'No especificado'}</span>
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        <span className="text-gray-500">La Kalle:</span>{' '}
                                                                        <span className="font-medium">{station.frecuencias.laKalle || 'No especificado'}</span>
                                                                    </p>
                                                                    <p className="text-sm">
                                                                        <span className="text-gray-500">Sabor Mix:</span>{' '}
                                                                        <span className="font-medium">{station.frecuencias.saborMix || 'No especificado'}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="text-sm font-semibold text-gray-700">Observaciones</h4>
                                                                <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                                                    {station.observaciones || 'Sin observaciones'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredStations.length === 0 && (
                        <div className="text-center py-12">
                            <Radio className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No se encontraron estaciones</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Intenta ajustar los filtros o agregar una nueva estación
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                // Vista Grid
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStations.map((station) => {
                        const review = getReviewForStation(station.id);
                        return (
                            <div key={station.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{station.localidad}</h3>
                                        <p className="text-sm text-gray-500">{station.departamento}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {station.activo ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Karibeña:</span>
                                            <p className="font-medium">{station.frecuencias.karibena || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Exitosa:</span>
                                            <p className="font-medium">{station.frecuencias.exitosa || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        {station.accesoRemoto.disponible ? (
                                            <>
                                                <Wifi className="h-4 w-4 text-green-600" />
                                                <span className="text-gray-600">
                                                    {station.accesoRemoto.tipoSoftware}: {station.accesoRemoto.idRemoto}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-400">Sin acceso remoto</span>
                                            </>
                                        )}
                                    </div>

                                    {station.contactoAdministrador && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">{station.contactoAdministrador}</span>
                                        </div>
                                    )}
                                </div>

                                {review && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {review.estado === 'activo' && (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-600">Funcionando</span>
                                                </>
                                            )}
                                            {review.estado === 'problema' && (
                                                <>
                                                    <Signal className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-sm font-medium text-yellow-600">Con problema</span>
                                                </>
                                            )}
                                            {review.estado === 'inactivo' && (
                                                <>
                                                    <WifiOff className="h-4 w-4 text-red-600" />
                                                    <span className="text-sm font-medium text-red-600">Sin señal</span>
                                                </>
                                            )}
                                        </div>
                                        {review.notas && (
                                            <p className="text-xs text-gray-600 mt-1">"{review.notas}"</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleReview(station)}
                                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Revisar
                                    </button>
                                    <button
                                        onClick={() => handleEdit(station)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(station.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modales */}
            {showAddModal && (
                <StationModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={onAddStation}
                    title="Agregar Nueva Estación"
                />
            )}

            {showEditModal && selectedStation && (
                <StationModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedStation(null);
                    }}
                    onSave={onUpdateStation}
                    station={selectedStation}
                    title="Editar Estación"
                />
            )}

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