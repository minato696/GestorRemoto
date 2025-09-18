// src/components/Modals/ReviewModal.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    X,
    CheckCircle,
    AlertCircle,
    XCircle,
    MapPin,
    Radio,
    Wifi,
    Phone,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { Station, Review } from '../../types';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (review: { estado: 'activo' | 'problema' | 'inactivo'; notas: string }) => Promise<void>;
    station: Station;
    existingReview?: Review;
    selectedDate: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSave,
    station,
    existingReview,
    selectedDate
}) => {
    const [reviewForm, setReviewForm] = useState({
        estado: existingReview?.estado || 'activo' as 'activo' | 'problema' | 'inactivo',
        notas: existingReview?.notas || ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setReviewForm({
                estado: existingReview.estado,
                notas: existingReview.notas
            });
        }
    }, [existingReview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(reviewForm);
            toast.success('Revisión guardada correctamente');
            onClose();
        } catch (error) {
            toast.error('Error al guardar la revisión');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const estadoOptions = [
        { value: 'activo', label: 'Funcionando', icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
        { value: 'problema', label: 'Con Problema', icon: AlertCircle, color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
        { value: 'inactivo', label: 'Sin Señal', icon: XCircle, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Revisión de Estación
                            </h2>
                            <p className="text-sm text-green-100 mt-1">
                                {format(new Date(selectedDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Station Info */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Ubicación</p>
                                <p className="font-semibold text-gray-900">{station.localidad}</p>
                                <p className="text-sm text-gray-600">{station.departamento}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Radio className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Frecuencias</p>
                                {station.frecuencias.karibena && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Karibeña:</span> {station.frecuencias.karibena}
                                    </p>
                                )}
                                {station.frecuencias.exitosa && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Exitosa:</span> {station.frecuencias.exitosa}
                                    </p>
                                )}
                                {!station.frecuencias.karibena && !station.frecuencias.exitosa && (
                                    <p className="text-sm text-gray-400">Sin frecuencias asignadas</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Wifi className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Acceso Remoto</p>
                                {station.accesoRemoto.disponible ? (
                                    <>
                                        <p className="text-sm font-medium text-gray-700">{station.accesoRemoto.tipoSoftware}</p>
                                        <p className="text-sm text-gray-600">{station.accesoRemoto.idRemoto}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400">No disponible</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Contacto</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {station.contactoAdministrador || 'No especificado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Estado de la estación */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Estado Actual de la Estación
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {estadoOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = reviewForm.estado === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className={`
                                            relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all
                                            ${isSelected
                                                ? `${option.bgColor} ${option.borderColor} shadow-md transform scale-105`
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="estado"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={(e) => setReviewForm({ ...reviewForm, estado: option.value as any })}
                                            className="sr-only"
                                        />
                                        <Icon className={`h-8 w-8 ${isSelected
                                            ? option.color === 'green' ? 'text-green-600'
                                                : option.color === 'yellow' ? 'text-yellow-600'
                                                    : 'text-red-600'
                                            : 'text-gray-400'
                                            }`} />
                                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'
                                            }`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <div className={`w-2 h-2 rounded-full ${option.color === 'green' ? 'bg-green-600'
                                                    : option.color === 'yellow' ? 'bg-yellow-600'
                                                        : 'bg-red-600'
                                                    }`} />
                                            </div>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notas de revisión */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            Observaciones de la Revisión
                        </label>
                        <textarea
                            value={reviewForm.notas}
                            onChange={(e) => setReviewForm({ ...reviewForm, notas: e.target.value })}
                            rows={4}
                            placeholder="Describe el estado actual de la estación, problemas encontrados o acciones tomadas..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {reviewForm.notas.length}/500 caracteres
                        </p>
                    </div>

                    {/* Sugerencias rápidas según el estado */}
                    {reviewForm.estado === 'problema' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800 mb-2">Sugerencias para reportar problemas:</p>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Describe el tipo de problema (audio, señal, conectividad)</li>
                                <li>• Indica si el problema es intermitente o constante</li>
                                <li>• Menciona si se intentó alguna solución</li>
                            </ul>
                        </div>
                    )}

                    {reviewForm.estado === 'inactivo' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800 mb-2">Información importante:</p>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Especifica desde cuándo está sin señal</li>
                                <li>• Indica si se contactó al administrador</li>
                                <li>• Menciona posibles causas conocidas</li>
                            </ul>
                        </div>
                    )}

                    {/* Información adicional */}
                    {existingReview && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                                <Calendar className="h-4 w-4" />
                                <p className="text-sm font-medium">Última revisión:</p>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                                {existingReview.horaRevision} - Estado: {
                                    existingReview.estado === 'activo' ? 'Funcionando' :
                                        existingReview.estado === 'problema' ? 'Con problema' : 'Sin señal'
                                }
                            </p>
                            {existingReview.notas && (
                                <p className="text-sm text-blue-600 mt-1 italic">"{existingReview.notas}"</p>
                            )}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        Los cambios se guardarán para la fecha: {format(new Date(selectedDate), 'dd/MM/yyyy')}
                    </p>
                    <div className="flex gap-3">
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
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle className="h-4 w-4" />
                            {loading ? 'Guardando...' : 'Guardar Revisión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};