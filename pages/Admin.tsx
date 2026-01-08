
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Upload, FileText, Loader2, Database, ShieldAlert, AlertCircle, Info, CheckCircle2, Zap, Film, ListChecks, History } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { dbService } from '../services/db';

const Admin: React.FC = () => {
  const { isAdmin, addMoviesToGlobal } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, added: 0 });
  const [dbTotal, setDbTotal] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    updateDbTotal();
  }, []);

  const updateDbTotal = async () => {
    const count = await dbService.getTotalCount();
    setDbTotal(count);
  };

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const parseTxtContent = (text: string) => {
    const movies: any[] = [];
    const lines = text.split('\n');
    let currentMovie: any = null;
    let currentLang: any = null;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('Embed:')) {
        const imdbMatch = trimmed.match(/tt\d+/);
        if (imdbMatch) {
          if (currentMovie) movies.push(currentMovie);
          currentMovie = { imdbId: imdbMatch[0], links: [] };
          currentLang = null;
        }
      } else if (trimmed.startsWith('Idioma:')) {
        const lang = trimmed.replace('Idioma:', '').trim();
        currentLang = { language: lang, servers: [] };
        if (currentMovie) currentMovie.links.push(currentLang);
      } else if (trimmed.startsWith('-') && currentLang) {
        const parts = trimmed.substring(1).split(':');
        if (parts.length >= 2) {
          const serverName = parts[0].trim();
          const url = parts.slice(1).join(':').trim();
          if (!url.includes('download')) {
            currentLang.servers.push({ name: serverName, url: url });
          }
        }
      }
    }

    if (currentMovie) movies.push(currentMovie);
    return movies;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError(null);
    setProgress({ current: 0, total: 0, added: 0 });

    try {
      const text = await file.text();
      const parsedEntries = parseTxtContent(text);
      
      if (parsedEntries.length === 0) {
        setUploadError("No se encontraron bloques 'Embed:' válidos.");
        setIsProcessing(false);
        return;
      }

      const total = parsedEntries.length;
      setProgress(p => ({ ...p, total }));
      
      const BATCH_SIZE = 15;
      
      for (let i = 0; i < parsedEntries.length; i += BATCH_SIZE) {
        const batch = parsedEntries.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(async (entry) => {
            const metadata = await tmdbService.getMetadataByImdbId(entry.imdbId);
            if (metadata) {
              return { ...metadata, links: entry.links };
            }
            return null;
          })
        );

        const validResults = batchResults.filter(m => m !== null);
        
        if (validResults.length > 0) {
          await addMoviesToGlobal(validResults as any);
          setProgress(prev => ({ ...prev, added: prev.added + validResults.length }));
        }

        setProgress(prev => ({ ...prev, current: Math.min(i + BATCH_SIZE, total) }));
        
        // Actualizamos el total de la DB cada 50 pelis para feedback visual
        if (i % 50 === 0) {
          updateDbTotal();
        }

        // Breve pausa para liberar el hilo principal
        await new Promise(r => setTimeout(r, 50));
      }

      await updateDbTotal();

    } catch (error) {
      setUploadError("Error en la sincronización masiva.");
      console.error(error);
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
            <Database className="w-10 h-10 text-indigo-500" />
            Control Maestro 11k
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Motor de alto rendimiento sin previsualización de lag.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-3 text-indigo-400 text-sm font-black">
          <Zap className="w-4 h-4 fill-current" /> MODO FLUJO ACTIVO
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Card de Importación */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Upload className="w-32 h-32" />
          </div>
          
          <h3 className="text-2xl font-black mb-6">Importar Catálogo</h3>
          
          {!isProcessing ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-800 rounded-[2rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
              <Upload className="w-12 h-12 text-zinc-600 mb-4 group-hover:text-indigo-500 transition-colors" />
              <div className="text-center px-6">
                <span className="block text-sm text-zinc-400 font-black uppercase tracking-widest mb-2">Seleccionar Archivo .txt</span>
                <span className="text-xs text-zinc-600 font-medium">Soporta más de 11,000 películas sin lag</span>
              </div>
              <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex items-center justify-center">
                 <div className="relative">
                    <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                    <Database className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400 px-2">
                  <span>Sincronizando Archivo</span>
                  <span className="text-indigo-400">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-5 rounded-full overflow-hidden p-1.5 shadow-inner">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">En el archivo</p>
                  <p className="text-xl font-black text-white">{progress.total}</p>
                </div>
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Procesadas</p>
                  <p className="text-xl font-black text-indigo-400">{progress.current}</p>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {uploadError}
            </div>
          )}
        </div>

        {/* Card de Estadísticas */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <History className="w-32 h-32" />
            </div>
            <h3 className="text-2xl font-black mb-8">Estado de la Base de Datos</h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Películas Únicas</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{dbTotal}</p>
                </div>
                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Film className="w-8 h-8" />
                </div>
              </div>

              <div className="p-6 bg-green-500/5 rounded-3xl border border-green-500/10 flex items-center justify-between">
                <div>
                  <p className="text-green-500/60 text-[10px] font-black uppercase tracking-widest mb-1">Última Adición</p>
                  <p className="text-xl font-black text-green-400">+{progress.added} Nuevas</p>
                </div>
                <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center text-green-500">
                  <ListChecks className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
               <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Info className="w-3 h-3" /> Optimización de Memoria
               </h4>
               <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                 El sistema utiliza <b>IndexedDB</b> para el almacenamiento persistente. Al procesar archivos masivos, los duplicados se omiten automáticamente basándose en el ID de TMDB. No hay límite de almacenamiento.
               </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-default">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5" /> Zona de Seguridad
               </h3>
               <p className="text-indigo-100 text-sm font-medium opacity-80">
                 Has iniciado sesión como <b>{isAdmin ? 'Administrador Maestro' : 'Usuario'}</b>. Tienes control total sobre los datos locales de esta instancia.
               </p>
             </div>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
