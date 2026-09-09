'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportJob {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  createdAt: string;
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/import/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map((row) => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index]?.trim() || '';
        });
        return obj;
      });

      const response = await api.post('/import/csv', {
        fileName: file.name,
        data,
        columnMapping,
      });

      toast.success(`Importación completada: ${response.data.successRows} éxitos, ${response.data.errorRows} errores`);
      loadJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const fieldLabels: Record<string, string> = {
    fullName: 'Nombre completo',
    company: 'Empresa',
    email: 'Email',
    phone: 'Teléfono',
    address: 'Dirección',
    notes: 'Notas',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Importar CSV</h1>
          <p className="text-muted-foreground mt-1">Carga masiva de clientes desde un archivo CSV</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Mapeo de Columnas</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Define qué columna de tu CSV corresponde a cada campo del cliente
            </p>

            <div className="space-y-3">
              {Object.keys(columnMapping).map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <label className="w-32 text-sm font-medium text-card-foreground">
                    {fieldLabels[field]}
                  </label>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={columnMapping[field as keyof typeof columnMapping]}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [field]: e.target.value })
                    }
                    placeholder={`Columna en CSV`}
                    className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 gradient-primary text-white rounded-xl font-medium hover:shadow-royal transition-all duration-300 disabled:opacity-50"
              >
                {importing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {importing ? 'Importando clientes...' : 'Seleccionar Archivo CSV'}
              </button>

              <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Asegúrate de que tu CSV tenga encabezados en la primera fila y esté codificado en UTF-8.
                </p>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Historial</h3>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="py-12 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">Sin importaciones</p>
                  <p className="text-sm text-muted-foreground mt-1">Sube tu primer archivo CSV para comenzar</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground text-sm">{job.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {job.successRows} OK
                        </p>
                        {job.errorRows > 0 && (
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {job.errorRows} error
                          </p>
                        )}
                      </div>
                      {job.status === 'completado' ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
