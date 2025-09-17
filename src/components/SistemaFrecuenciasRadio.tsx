// src/components/SistemaFrecuenciasRadio.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import {
    Radio,
    Plus,
    Edit2,
    Trash2,
    Save,
    Download,
    Upload,
    Search,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Phone,
    Wifi,
    WifiOff,
    Monitor,
    MapPin,
    X,
    ChevronDown,
    Signal,
    Activity,
    Database,
    Clock,
    Filter,
    Eye,
    EyeOff,
    Users,
    BarChart2
} from 'lucide-react';
import { db } from '../lib/db';
import { Station, Review, Statistics, FilterOptions } from '../types';

const SistemaFrecuenciasRadio: React.FC = () => {
    // Estados principales
    const [stations, setStations] = useState<Station[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [activeTab, setActiveTab] = useState<'dashboard' | 'estaciones' | 'revisiones'>('dashboard');

    // Estados de filtro
    const [filters, setFilters] = useState<FilterOptions>({
        departamento: '',
        busqueda: '',
        soloActivas: false,
    });

    // Estados de modales
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    // Estados de formulario
    const [formData, setFormData] = useState<Partial<Station>>({
        departamento: '',
        localidad: '',
        frecuencias: {
            karibena: '',
            exitosa: '',
            laKalle: '',
            saborMix: '',
        },
        accesoRemoto: {
            disponible: false,
            tipoSoftware: '',
            idRemoto: '',
            password: '',
        },
        contactoAdministrador: '',
        activo: true,
        observaciones: '',
    });

    const [reviewForm, setReviewForm] = useState({
        estado: 'activo' as 'activo' | 'problema' | 'inactivo',
        notas: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    // Cargar datos al inicio
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadReviewsForDate(selectedDate);
    }, [selectedDate]);

    const loadData = async () => {
        try {
            const loadedStations = await db.getAllStations();
            setStations(loadedStations);

            const loadedReviews = await db.getReviewsByDate(selectedDate);
            setReviews(loadedReviews);
        } catch (error) {
            toast.error('Error al cargar los datos');
            console.error(error);
        }
    };

    const loadReviewsForDate = async (date: string) => {
        try {
            const loadedReviews = await db.getReviewsByDate(date);
            setReviews(loadedReviews);
        } catch (error) {
            toast.error('Error al cargar las revisiones');
            console.error(error);
        }
    };

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

    // Obtener departamentos únicos
    const departamentos = useMemo(() => {
        return Array.from(new Set(stations.map(s => s.departamento))).sort();
    }, [stations]);

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

    // Manejadores de estaciones
    const handleSaveStation = async () => {
        try {
            if (!formData.departamento || !formData.localidad) {
                toast.error('Departamento y localidad son obligatorios');
                return;
            }

            const station: Station = {
                id: selectedStation?.id || `station-${Date.now()}`,
                departamento: formData.departamento!,
                localidad: formData.localidad!,
                frecuencias: formData.frecuencias || {
                    karibena: '',
                    exitosa: '',
                    laKalle: '',
                    saborMix: '',
                },
                accesoRemoto: formData.accesoRemoto || {
                    disponible: false,
                    tipoSoftware: '',
                    idRemoto: '',
                    password: '',
                },
                contactoAdministrador: formData.contactoAdministrador || '',
                activo: formData.activo ?? true,
                observaciones: formData.observaciones || '',
                ultimaActualizacion: new Date().toISOString(),
            };

            if (selectedStation) {
                await db.updateStation(station);
                toast.success('Estación actualizada');
            } else {
                await db.addStation(station);
                toast.success('Estación agregada');
            }

            await loadData();
            handleCloseModals();
        } catch (error) {
            toast.error('Error al guardar la estación');
            console.error(error);
        }
    };

    const handleDeleteStation = async (id: string) => {
        if (!confirm('¿Eliminar esta estación y todas sus revisiones?')) return;

        try {
            await db.deleteStation(id);
            toast.success('Estación eliminada');
            await loadData();
        } catch (error) {
            toast.error('Error al eliminar la estación');
            console.error(error);
        }
    };

    const handleCloseModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowReviewModal(false);
        setSelectedStation(null);
        setFormData({
            departamento: '',
            localidad: '',
            frecuencias: {
                karibena: '',
                exitosa: '',
                laKalle: '',
                saborMix: '',
            },
            accesoRemoto: {
                disponible: false,
                tipoSoftware: '',
                idRemoto: '',
                password: '',
            },
            contactoAdministrador: '',
            activo: true,
            observaciones: '',
        });
        setReviewForm({
            estado: 'activo',
            notas: ''
        });
    };

    // Manejadores de revisiones
    const handleSaveReview = async () => {
        if (!selectedStation) return;

        try {
            const existingReview = await db.getReviewByStationAndDate(selectedStation.id, selectedDate);

            const review: Review = {
                id: existingReview?.id || `review-${Date.now()}`,
                stationId: selectedStation.id,
                fecha: selectedDate,
                revisado: true,
                estado: reviewForm.estado,
                notas: reviewForm.notas,
                horaRevision: format(new Date(), 'HH:mm:ss'),
            };

            if (existingReview) {
                await db.updateReview(review);
            } else {
                await db.addReview(review);
            }

            toast.success('Revisión guardada');
            await loadReviewsForDate(selectedDate);
            handleCloseModals();
        } catch (error) {
            toast.error('Error al guardar la revisión');
            console.error(error);
        }
    };

    const getReviewForStation = (stationId: string): Review | undefined => {
        return reviews.find(r => r.stationId === stationId && r.fecha === selectedDate);
    };

    // Exportar/Importar datos
    const handleExport = async () => {
        try {
            const jsonData = await db.exportData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `radio-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Datos exportados');
        } catch (error) {
            toast.error('Error al exportar');
            console.error(error);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            await db.importData(text);
            await loadData();
            toast.success('Datos importados');
        } catch (error) {
            toast.error('Error al importar');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Header Simplificado */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Radio className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Sistema de Gestión de Frecuencias
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span className="hidden sm:inline">Importar</span>
                                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                            </label>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Exportar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'dashboard'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('estaciones')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'estaciones'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Estaciones
                        </button>
                        <button
                            onClick={() => setActiveTab('revisiones')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'revisiones'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Revisiones
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-6">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Estadísticas Principales */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                                    </div>
                                    <Database className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Activas</p>
                                        <p className="text-2xl font-bold text-green-600">{statistics.activas}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Problemas</p>
                                        <p className="text-2xl font-bold text-yellow-600">{statistics.conProblemas}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Inactivas</p>
                                        <p className="text-2xl font-bold text-red-600">{statistics.inactivas}</p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Sin Revisar</p>
                                        <p className="text-2xl font-bold text-gray-600">{statistics.sinRevisar}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Progreso */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Progreso de Revisión Diaria</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Completado</span>
                                    <span className="font-semibold">
                                        {statistics.total > 0 ? Math.round((statistics.total - statistics.sinRevisar) / statistics.total * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${statistics.total > 0 ? ((statistics.total - statistics.sinRevisar) / statistics.total * 100) : 0}%`
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{statistics.activas}</p>
                                        <p className="text-xs text-gray-500">Funcionando</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-600">{statistics.conProblemas}</p>
                                        <p className="text-xs text-gray-500">Con problemas</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">{statistics.inactivas}</p>
                                        <p className="text-xs text-gray-500">Sin señal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Departamentos */}
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Estadísticas por Departamento</h3>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500">
                                            <th className="pb-3 font-medium">Departamento</th>
                                            <th className="pb-3 font-medium text-center">Total</th>
                                            <th className="pb-3 font-medium text-center">Activas</th>
                                            <th className="pb-3 font-medium text-center">Problemas</th>
                                            <th className="pb-3 font-medium text-center">Inactivas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {departamentos.map(dep => {
                                            const depStations = stations.filter(s => s.departamento === dep);
                                            const depReviews = reviews.filter(r =>
                                                depStations.some(s => s.id === r.stationId) && r.fecha === selectedDate
                                            );

                                            return (
                                                <tr key={dep} className="text-sm">
                                                    <td className="py-3 font-medium">{dep}</td>
                                                    <td className="py-3 text-center">{depStations.length}</td>
                                                    <td className="py-3 text-center">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            {depReviews.filter(r => r.estado === 'activo').length}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                            {depReviews.filter(r => r.estado === 'problema').length}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                            {depReviews.filter(r => r.estado === 'inactivo').length}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {departamentos.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No hay datos disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Estaciones Tab */}
                {activeTab === 'estaciones' && (
                    <div className="space-y-6">
                        {/* Barra de herramientas */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex-1 min-w-[240px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar estación..."
                                            value={filters.busqueda}
                                            onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <select
                                    value={filters.departamento}
                                    onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los departamentos</option>
                                    {departamentos.map(dep => (
                                        <option key={dep} value={dep}>{dep}</option>
                                    ))}
                                </select>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.soloActivas}
                                        onChange={(e) => setFilters({ ...filters, soloActivas: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm">Solo activas</span>
                                </label>

                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nueva Estación
                                </button>
                            </div>
                        </div>

                        {/* Lista de Estaciones - Tabla */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Departamento/Localidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Karibeña
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exitosa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acceso Remoto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStations.map((station) => {
                                        const review = getReviewForStation(station.id);
                                        return (
                                            <tr key={station.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{station.departamento}</div>
                                                        <div className="text-sm text-gray-500">{station.localidad}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {station.frecuencias.karibena || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {station.frecuencias.exitosa || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {station.accesoRemoto.disponible ? (
                                                        <div>
                                                            <div className="font-medium">{station.accesoRemoto.tipoSoftware}</div>
                                                            <div className="text-gray-500">{station.accesoRemoto.idRemoto}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No disponible</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {station.contactoAdministrador || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
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
                                                        <div className="mt-1">
                                                            {review.estado === 'activo' && (
                                                                <span className="text-xs text-green-600">✓ Revisado</span>
                                                            )}
                                                            {review.estado === 'problema' && (
                                                                <span className="text-xs text-yellow-600">⚠ Problema</span>
                                                            )}
                                                            {review.estado === 'inactivo' && (
                                                                <span className="text-xs text-red-600">✗ Sin señal</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStation(station);
                                                                setReviewForm({
                                                                    estado: review?.estado || 'activo',
                                                                    notas: review?.notas || ''
                                                                });
                                                                setShowReviewModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Revisar"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStation(station);
                                                                setFormData(station);
                                                                setShowEditModal(true);
                                                            }}
                                                            className="text-gray-600 hover:text-gray-800"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStation(station.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredStations.length === 0 && (
                                <div className="text-center py-12">
                                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No se encontraron estaciones</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Revisiones Tab */}
                {activeTab === 'revisiones' && (
                    <div className="space-y-6">
                        {/* Selector de fecha */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Fecha de revisión:</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                    >
                                        Hoy
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Activity className="h-4 w-4" />
                                    <span>
                                        {statistics.total - statistics.sinRevisar} de {statistics.total} revisadas
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lista de estaciones para revisar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStations.map((station) => {
                                const review = getReviewForStation(station.id);
                                return (
                                    <div key={station.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{station.localidad}</h4>
                                                <p className="text-sm text-gray-500">{station.departamento}</p>
                                            </div>
                                            {review && (
                                                <span className="text-xs text-gray-500">
                                                    {review.horaRevision}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="text-sm">
                                                <span className="text-gray-500">Karibeña:</span> {station.frecuencias.karibena || '-'}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-gray-500">Exitosa:</span> {station.frecuencias.exitosa || '-'}
                                            </div>
                                        </div>

                                        {review ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {review.estado === 'activo' && (
                                                        <>
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                            <span className="text-sm font-medium text-green-600">Activo</span>
                                                        </>
                                                    )}
                                                    {review.estado === 'problema' && (
                                                        <>
                                                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                                                            <span className="text-sm font-medium text-yellow-600">Con problema</span>
                                                        </>
                                                    )}
                                                    {review.estado === 'inactivo' && (
                                                        <>
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                            <span className="text-sm font-medium text-red-600">Inactivo</span>
                                                        </>
                                                    )}
                                                </div>
                                                {review.notas && (
                                                    <p className="text-sm text-gray-600 italic">"{review.notas}"</p>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedStation(station);
                                                        setReviewForm({
                                                            estado: review.estado,
                                                            notas: review.notas
                                                        });
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="w-full mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
                                                >
                                                    Actualizar revisión
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedStation(station);
                                                    setReviewForm({ estado: 'activo', notas: '' });
                                                    setShowReviewModal(true);
                                                }}
                                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                            >
                                                Revisar ahora
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para Agregar/Editar Estación */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    {showEditModal ? 'Editar Estación' : 'Añadir Nueva Estación'}
                                </h2>
                                <button
                                    onClick={handleCloseModals}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información Básica */}
                            <div>
                                <h3 className="font-medium mb-3">Información Básica</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Departamento *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.departamento || ''}
                                            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Localidad *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.localidad || ''}
                                            onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Frecuencias */}
                            <div>
                                <h3 className="font-medium mb-3">Frecuencias de Radio</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Karibeña</label>
                                        <input
                                            type="text"
                                            value={formData.frecuencias?.karibena || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                frecuencias: { ...formData.frecuencias!, karibena: e.target.value }
                                            })}
                                            placeholder="ej: 94.5 FM"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Exitosa</label>
                                        <input
                                            type="text"
                                            value={formData.frecuencias?.exitosa || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                frecuencias: { ...formData.frecuencias!, exitosa: e.target.value }
                                            })}
                                            placeholder="ej: 95.5 FM"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">La Kalle</label>
                                        <input
                                            type="text"
                                            value={formData.frecuencias?.laKalle || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                frecuencias: { ...formData.frecuencias!, laKalle: e.target.value }
                                            })}
                                            placeholder="ej: 96.1 FM (IPR)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Sabor Mix</label>
                                        <input
                                            type="text"
                                            value={formData.frecuencias?.saborMix || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                frecuencias: { ...formData.frecuencias!, saborMix: e.target.value }
                                            })}
                                            placeholder="ej: 90.9 FM (RK)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Acceso Remoto */}
                            <div>
                                <h3 className="font-medium mb-3">Acceso Remoto & Administración</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.accesoRemoto?.disponible || false}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                accesoRemoto: { ...formData.accesoRemoto!, disponible: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm font-medium">Acceso Remoto Disponible</span>
                                    </label>

                                    {formData.accesoRemoto?.disponible && (
                                        <div className="grid grid-cols-2 gap-4 ml-6">
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">Tipo de Software</label>
                                                <select
                                                    value={formData.accesoRemoto?.tipoSoftware || ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        accesoRemoto: { ...formData.accesoRemoto!, tipoSoftware: e.target.value as any }
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="TeamViewer">TeamViewer</option>
                                                    <option value="AnyDesk">AnyDesk</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">ID de Acceso</label>
                                                <input
                                                    type="text"
                                                    value={formData.accesoRemoto?.idRemoto || ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        accesoRemoto: { ...formData.accesoRemoto!, idRemoto: e.target.value }
                                                    })}
                                                    placeholder="ej: 123 456 789"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.accesoRemoto?.password || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            accesoRemoto: { ...formData.accesoRemoto!, password: e.target.value }
                                                        })}
                                                        placeholder="Contraseña segura"
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contacto y Estado */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contacto Administrador
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactoAdministrador || ''}
                                        onChange={(e) => setFormData({ ...formData, contactoAdministrador: e.target.value })}
                                        placeholder="Número de teléfono"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        value={formData.activo ? 'activo' : 'inactivo'}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'activo' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                <textarea
                                    value={formData.observaciones || ''}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    rows={3}
                                    placeholder="Notas adicionales..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModals}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveStation}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Revisión */}
            {showReviewModal && selectedStation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Revisión de {selectedStation.localidad}
                                </h2>
                                <button
                                    onClick={handleCloseModals}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(selectedDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Estado de la Estación
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="activo"
                                            checked={reviewForm.estado === 'activo'}
                                            onChange={(e) => setReviewForm({ ...reviewForm, estado: 'activo' })}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-medium">Activo</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="problema"
                                            checked={reviewForm.estado === 'problema'}
                                            onChange={(e) => setReviewForm({ ...reviewForm, estado: 'problema' })}
                                            className="w-4 h-4 text-yellow-600"
                                        />
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                        <span className="font-medium">Con Problema</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="estado"
                                            value="inactivo"
                                            checked={reviewForm.estado === 'inactivo'}
                                            onChange={(e) => setReviewForm({ ...reviewForm, estado: 'inactivo' })}
                                            className="w-4 h-4 text-red-600"
                                        />
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <span className="font-medium">Inactivo</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas de Revisión
                                </label>
                                <textarea
                                    value={reviewForm.notas}
                                    onChange={(e) => setReviewForm({ ...reviewForm, notas: e.target.value })}
                                    rows={4}
                                    placeholder="Observaciones sobre el estado de la estación..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Información de la estación */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="font-medium text-gray-700 mb-2">Detalles de la Estación</div>
                                <div className="grid grid-cols-2 gap-2 text-gray-600">
                                    <div>Departamento:</div>
                                    <div className="font-medium text-gray-900">{selectedStation.departamento}</div>
                                    <div>Localidad:</div>
                                    <div className="font-medium text-gray-900">{selectedStation.localidad}</div>
                                    <div>Karibeña:</div>
                                    <div className="font-medium text-gray-900">{selectedStation.frecuencias.karibena || '-'}</div>
                                    <div>Exitosa:</div>
                                    <div className="font-medium text-gray-900">{selectedStation.frecuencias.exitosa || '-'}</div>
                                    <div>Acceso Remoto:</div>
                                    <div className="font-medium text-gray-900">
                                        {selectedStation.accesoRemoto.disponible
                                            ? `${selectedStation.accesoRemoto.tipoSoftware}: ${selectedStation.accesoRemoto.idRemoto}`
                                            : 'No disponible'}
                                    </div>
                                    <div>Contacto:</div>
                                    <div className="font-medium text-gray-900">{selectedStation.contactoAdministrador || '-'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModals}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveReview}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Guardar Revisión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SistemaFrecuenciasRadio;