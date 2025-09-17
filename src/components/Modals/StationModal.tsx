// src/components/Modals/StationModal.tsx
import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    MapPin,
    Radio,
    Wifi,
    Phone,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';
import { Station } from '../../types';
import toast from 'react-hot-toast';

interface StationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (station: Partial<Station> | Station) => Promise<void>;
    station?: Station | null;
    title?: string;
}

export const StationModal: React.FC<StationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    station,
    title = 'Nueva Estación'
}) => {
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

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (station) {
            setFormData(station);
        }
    }, [station]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.departamento || !formData.localidad) {
            toast.error('Departamento y localidad son obligatorios');
            return;
        }

        setLoading(true);
        try {
            const stationData: Station = {
                id: station?.id || `station-${Date.now()}`,
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

            await onSave(stationData);
            toast.success(station ? 'Estación actualizada' : 'Estación agregada');
            onClose();
        } catch (error) {
            toast.error('Error al guardar la estación');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Radio className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold">Ubicación</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Departamento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.departamento || ''}
                                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Lima"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Localidad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.localidad || ''}
                                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Miraflores"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Frecuencias */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Radio className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold">Frecuencias de Radio</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Radio Karibeña</label>
                                <input
                                    type="text"
                                    value={formData.frecuencias?.karibena || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        frecuencias: { ...formData.frecuencias!, karibena: e.target.value }
                                    })}
                                    placeholder="94.5 FM"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Radio Exitosa</label>
                                <input
                                    type="text"
                                    value={formData.frecuencias?.exitosa || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        frecuencias: { ...formData.frecuencias!, exitosa: e.target.value }
                                    })}
                                    placeholder="95.5 FM"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Radio La Kalle</label>
                                <input
                                    type="text"
                                    value={formData.frecuencias?.laKalle || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        frecuencias: { ...formData.frecuencias!, laKalle: e.target.value }
                                    })}
                                    placeholder="96.1 FM (IPR)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Radio Sabor Mix</label>
                                <input
                                    type="text"
                                    value={formData.frecuencias?.saborMix || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        frecuencias: { ...formData.frecuencias!, saborMix: e.target.value }
                                    })}
                                    placeholder="90.9 FM (RK)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Acceso Remoto */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Wifi className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold">Acceso Remoto</h3>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.accesoRemoto?.disponible || false}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    accesoRemoto: { ...formData.accesoRemoto!, disponible: e.target.checked }
                                })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Acceso remoto disponible</span>
                        </label>

                        {formData.accesoRemoto?.disponible && (
                            <div className="grid md:grid-cols-2 gap-4 pl-8 animate-slide-up">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Software</label>
                                    <select
                                        value={formData.accesoRemoto?.tipoSoftware || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            accesoRemoto: { ...formData.accesoRemoto!, tipoSoftware: e.target.value as any }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        placeholder="123 456 789"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
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
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contacto y Estado */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold">Administración</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Contacto Administrador</label>
                                <input
                                    type="text"
                                    value={formData.contactoAdministrador || ''}
                                    onChange={(e) => setFormData({ ...formData, contactoAdministrador: e.target.value })}
                                    placeholder="Número de teléfono"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Estado</label>
                                <select
                                    value={formData.activo ? 'activo' : 'inactivo'}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'activo' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Info className="h-5 w-5 text-indigo-600" />
                            <label className="font-semibold">Observaciones</label>
                        </div>
                        <textarea
                            value={formData.observaciones || ''}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            rows={3}
                            placeholder="Notas adicionales sobre la estación..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};