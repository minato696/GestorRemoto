// src/components/History/ChangeHistory.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    History,
    Clock,
    User,
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    Filter,
    Download,
    Search,
    Radio,
    MapPin
} from 'lucide-react';

export interface HistoryEntry {
    id: string;
    timestamp: string;
    user: string;
    userName: string;
    action: 'create' | 'update' | 'delete' | 'review' | 'login' | 'logout';
    entity: 'station' | 'review' | 'system';
    details: string;
    metadata?: any;
}

interface ChangeHistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangeHistory: React.FC<ChangeHistoryProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('all');
    const [filterEntity, setFilterEntity] = useState<string>('all');

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        filterHistory();
    }, [history, searchTerm, filterAction, filterEntity]);

    const loadHistory = () => {
        const savedHistory = localStorage.getItem('change_history');
        if (savedHistory) {
            const entries = JSON.parse(savedHistory);
            setHistory(entries.sort((a: HistoryEntry, b: HistoryEntry) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ));
        }
    };

    const filterHistory = () => {
        let filtered = [...history];

        if (searchTerm) {
            filtered = filtered.filter(entry =>
                entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.user.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterAction !== 'all') {
            filtered = filtered.filter(entry => entry.action === filterAction);
        }

        if (filterEntity !== 'all') {
            filtered = filtered.filter(entry => entry.entity === filterEntity);
        }

        setFilteredHistory(filtered);
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Plus className="h-4 w-4" />;
            case 'update': return <Edit2 className="h-4 w-4" />;
            case 'delete': return <Trash2 className="h-4 w-4" />;
            case 'review': return <CheckCircle className="h-4 w-4" />;
            case 'login': return <User className="h-4 w-4" />;
            case 'logout': return <User className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-700';
            case 'update': return 'bg-blue-100 text-blue-700';
            case 'delete': return 'bg-red-100 text-red-700';
            case 'review': return 'bg-purple-100 text-purple-700';
            case 'login': return 'bg-gray-100 text-gray-700';
            case 'logout': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'create': return 'Creación';
            case 'update': return 'Actualización';
            case 'delete': return 'Eliminación';
            case 'review': return 'Revisión';
            case 'login': return 'Inicio sesión';
            case 'logout': return 'Cierre sesión';
            default: return action;
        }
    };

    const exportHistory = () => {
        const dataStr = JSON.stringify(filteredHistory, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `historial_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Historial de Cambios</h2>
                                <p className="text-sm text-indigo-100">
                                    {history.length} eventos registrados
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en el historial..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Todas las acciones</option>
                            <option value="create">Creaciones</option>
                            <option value="update">Actualizaciones</option>
                            <option value="delete">Eliminaciones</option>
                            <option value="review">Revisiones</option>
                            <option value="login">Inicios de sesión</option>
                        </select>

                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Todas las entidades</option>
                            <option value="station">Estaciones</option>
                            <option value="review">Revisiones</option>
                            <option value="system">Sistema</option>
                        </select>

                        <button
                            onClick={exportHistory}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {filteredHistory.length === 0 ? (
                        <div className="p-12 text-center">
                            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No hay eventos en el historial</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Los eventos se mostrarán aquí cuando se realicen acciones en el sistema
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredHistory.map((entry) => (
                                <div key={entry.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
                                            {getActionIcon(entry.action)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {entry.details}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {entry.userName}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(entry.timestamp), "dd/MM/yyyy HH:mm:ss")}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                                            {getActionLabel(entry.action)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {entry.metadata && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                                    <pre className="whitespace-pre-wrap">
                                                        {JSON.stringify(entry.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Función helper para agregar eventos al historial
export const addToHistory = (
    action: HistoryEntry['action'],
    entity: HistoryEntry['entity'],
    details: string,
    metadata?: any
) => {
    const session = localStorage.getItem('radiocontrol_session');
    const user = session ? JSON.parse(session) : { username: 'sistema', name: 'Sistema' };

    const newEntry: HistoryEntry = {
        id: `history-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: user.username,
        userName: user.name,
        action,
        entity,
        details,
        metadata
    };

    const history = JSON.parse(localStorage.getItem('change_history') || '[]');
    history.unshift(newEntry);

    // Mantener solo los últimos 1000 eventos
    if (history.length > 1000) {
        history.pop();
    }

    localStorage.setItem('change_history', JSON.stringify(history));
};