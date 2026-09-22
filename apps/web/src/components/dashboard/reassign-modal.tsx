'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Vendor {
  id: string;
  fullName: string;
  email: string;
}

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromVendor: { id: string; name: string; count: number };
  onReassigned: () => void;
}

export default function ReassignModal({ isOpen, onClose, fromVendor, onReassigned }: ReassignModalProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVendors();
    }
  }, [isOpen]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/active');
      setVendors(res.data.filter((v: Vendor) => v.id !== fromVendor.id));
    } catch (err) {
      toast.error('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedVendorId) return;
    setSubmitting(true);
    try {
      const res = await api.put('/customers/bulk-assign', {
        fromOwnerId: fromVendor.id,
        toOwnerId: selectedVendorId,
      });
      const affected = res.data?.affected ?? 0;
      if (affected > 0) {
        toast.success(`${affected} cliente(s) reasignado(s)`);
      } else {
        toast('No había clientes para reasignar', { icon: 'ℹ️' });
      }
      onReassigned();
      onClose();
      setSelectedVendorId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reasignar clientes');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Reasignar Clientes</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">Vendedor actual</p>
            <p className="font-medium text-card-foreground">{fromVendor.name}</p>
            <p className="text-xs text-muted-foreground">{fromVendor.count} clientes asignados</p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div>
            <label className="text-sm font-medium text-card-foreground block mb-2">Reasignar a</label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Seleccionar vendedor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl border border-border text-card-foreground hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleReassign}
            disabled={!selectedVendorId || submitting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Reasignar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
