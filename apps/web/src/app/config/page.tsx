'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Save,
  Building2,
  Clock,
  Upload,
  MessageSquare,
  Mail,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Settings {
  companyName: string;
  logoUrl: string;
  timezone: string;
}

export default function ConfigPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>({
    companyName: '',
    logoUrl: '',
    timezone: 'America/Bogota',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/config/settings');
      setSettings(response.data);
      if (response.data.logoUrl) {
        setPreviewLogo(response.data.logoUrl);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewLogo(result);
      setSettings({ ...settings, logoUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setPreviewLogo(null);
    setSettings({ ...settings, logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config/settings', settings);
      toast.success('Configuración guardada exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Administra la configuración de tu empresa</p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Company Info Card */}
          <form onSubmit={handleSave}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Datos de la Empresa</h3>
              </div>

              <div className="space-y-5">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-3">
                    Logo de la Empresa
                  </label>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden ${
                        previewLogo ? 'border-transparent' : 'hover:border-primary/50 cursor-pointer'
                      } transition-colors`}
                      onClick={() => !previewLogo && fileInputRef.current?.click()}
                    >
                      {previewLogo ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={previewLogo}
                            alt="Logo"
                            className="w-full h-full object-contain p-2"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLogo();
                            }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Subir logo</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Seleccionar imagen
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG o SVG. Máx 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Mi Empresa S.A."
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Zona Horaria
                    </div>
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    <option value="America/Bogota">América/Bogotá (COT - UTC-5)</option>
                    <option value="America/Mexico_City">América/Ciudad de México (CST - UTC-6)</option>
                    <option value="America/Buenos_Aires">América/Buenos Aires (ART - UTC-3)</option>
                    <option value="America/Santiago">América/Santiago (CLT - UTC-4)</option>
                    <option value="America/Lima">América/Lima (PET - UTC-5)</option>
                    <option value="America/Caracas">América/Caracas (VET - UTC-4)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-royal transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>

          {/* Integrations Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Integraciones</h3>
            </div>

            <div className="space-y-4">
              {/* WhatsApp */}
              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">WhatsApp Business API</p>
                    <p className="text-sm text-muted-foreground">Envía y recibe mensajes de WhatsApp</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pendiente
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Email Transaccional</p>
                    <p className="text-sm text-muted-foreground">Resend / SendGrid / Amazon SES</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pendiente
                </span>
              </div>

              {/* OAuth */}
              <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Autenticación OAuth2</p>
                    <p className="text-sm text-muted-foreground">Google / Microsoft</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Disponible
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
