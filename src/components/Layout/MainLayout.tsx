// src/components/Layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import {
    Radio,
    BarChart2,
    CheckSquare,
    Settings,
    Download,
    Upload,
    Menu,
    X,
    Home,
    Database,
    Activity,
    HelpCircle,
    LogOut,
    User,
    Sun,
    Moon,
    Bell
} from 'lucide-react';
import { db } from '../../lib/db';
import { Station, Review } from '../../types';
import { Dashboard } from '../Dashboard/Dashboard';
import { StationsManager } from '../Stations/StationsManager';
import { ReviewsManager } from '../Reviews/ReviewsManager';

type TabType = 'dashboard' | 'stations' | 'reviews' | 'settings';

export const MainLayout: React.FC = () => {
    // Estados principales
    const [stations, setStations] = useState<Station[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(0);

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

            // Calcular notificaciones (estaciones sin revisar)
            const reviewedIds = new Set(loadedReviews.map(r => r.stationId));
            const pendingCount = loadedStations.filter(s => !reviewedIds.has(s.id)).length;
            setNotifications(pendingCount);
        } catch (error) {
            toast.error('Error al cargar los datos');
            console.error(error);
        }
    };

    const loadReviewsForDate = async (date: string) => {
        try {
            const loadedReviews = await db.getReviewsByDate(date);
            setReviews(loadedReviews);

            // Actualizar notificaciones
            const reviewedIds = new Set(loadedReviews.map(r => r.stationId));
            const pendingCount = stations.filter(s => !reviewedIds.has(s.id)).length;
            setNotifications(pendingCount);
        } catch (error) {
            toast.error('Error al cargar las revisiones');
            console.error(error);
        }
    };

    // Manejadores para estaciones
    const handleAddStation = async (stationData: Partial<Station>) => {
        const station: Station = {
            id: `station-${Date.now()}`,
            departamento: stationData.departamento!,
            localidad: stationData.localidad!,
            frecuencias: stationData.frecuencias || {
                karibena: '',
                exitosa: '',
                laKalle: '',
                saborMix: '',
            },
            accesoRemoto: stationData.accesoRemoto || {
                disponible: false,
                tipoSoftware: '',
                idRemoto: '',
                password: '',
            },
            contactoAdministrador: stationData.contactoAdministrador || '',
            activo: stationData.activo ?? true,
            observaciones: stationData.observaciones || '',
            ultimaActualizacion: new Date().toISOString(),
        };

        await db.addStation(station);
        await loadData();
    };

    const handleUpdateStation = async (station: Station) => {
        await db.updateStation(station);
        await loadData();
    };

    const handleDeleteStation = async (id: string) => {
        await db.deleteStation(id);
        await loadData();
    };

    // Manejadores para revisiones
    const handleSaveReview = async (stationId: string, reviewData: { estado: 'activo' | 'problema' | 'inactivo'; notas: string }) => {
        const existingReview = await db.getReviewByStationAndDate(stationId, selectedDate);

        const review: Review = {
            id: existingReview?.id || `review-${Date.now()}`,
            stationId: stationId,
            fecha: selectedDate,
            revisado: true,
            estado: reviewData.estado,
            notas: reviewData.notas,
            horaRevision: format(new Date(), 'HH:mm:ss'),
        };

        if (existingReview) {
            await db.updateReview(review);
        } else {
            await db.addReview(review);
        }

        await loadReviewsForDate(selectedDate);
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
            toast.success('Datos exportados correctamente');
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
            toast.success('Datos importados correctamente');
        } catch (error) {
            toast.error('Error al importar');
            console.error(error);
        }
    };

    const menuItems = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart2, badge: null },
        { id: 'stations' as TabType, label: 'Estaciones', icon: Radio, badge: stations.length },
        { id: 'reviews' as TabType, label: 'Revisiones', icon: CheckSquare, badge: notifications },
        { id: 'settings' as TabType, label: 'Configuración', icon: Settings, badge: null },
    ];

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-30 transition-all duration-300
                ${sidebarOpen ? 'w-64' : 'w-20'}
            `}>
                {/* Logo y Toggle */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                                <Radio className="h-6 w-6 text-white" />
                            </div>
                            {sidebarOpen && (
                                <div className="animate-fade-in">
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">RadioControl</h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition lg:hidden"
                        >
                            {sidebarOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                    ${!sidebarOpen && 'justify-center'}
                                `}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <>
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge !== null && item.badge > 0 && (
                                            <span className={`
                                                ml-auto px-2 py-0.5 text-xs font-medium rounded-full
                                                ${isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                                                }
                                            `}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions */}
                {sidebarOpen && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Acciones Rápidas
                        </p>
                        <label className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition">
                            <Upload className="h-4 w-4" />
                            <span className="text-sm font-medium">Importar</span>
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            <Download className="h-4 w-4" />
                            <span className="text-sm font-medium">Exportar</span>
                        </button>
                    </div>
                )}

                {/* User Section */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Administrador</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">admin@radiocontrol.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Top Bar */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {activeTab === 'dashboard' && 'Panel de Control'}
                                        {activeTab === 'stations' && 'Gestión de Estaciones'}
                                        {activeTab === 'reviews' && 'Revisiones Diarias'}
                                        {activeTab === 'settings' && 'Configuración'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    {notifications > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    {darkMode ? (
                                        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    )}
                                </button>

                                {/* Help */}
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                    <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            stations={stations}
                            reviews={reviews}
                            selectedDate={selectedDate}
                        />
                    )}

                    {activeTab === 'stations' && (
                        <StationsManager
                            stations={stations}
                            reviews={reviews}
                            selectedDate={selectedDate}
                            onAddStation={handleAddStation}
                            onUpdateStation={handleUpdateStation}
                            onDeleteStation={handleDeleteStation}
                            onSaveReview={handleSaveReview}
                        />
                    )}

                    {activeTab === 'reviews' && (
                        <ReviewsManager
                            stations={stations}
                            reviews={reviews}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            onSaveReview={handleSaveReview}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Configuración en desarrollo</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        Esta sección estará disponible próximamente
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};