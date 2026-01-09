
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Upload, FileText, Loader2, Database, ShieldAlert, AlertCircle, Info, CheckCircle2, Zap, Film, ListChecks, History, Download, Share2, RefreshCw } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { dbService } from '../services/db';

const Admin: React.FC = () => {
  const { isAdmin, addMoviesToGlobal, refreshGlobalMovies } = useAuth();
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

  // EXPORTAR BASE DE DATOS
  const handleExportDB = async () => {
    const allMovies = await dbService.getAllMovies();
    const dataStr = JSON.stringify(allMovies);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cineai_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // IMPORTAR BASE DE DATOS (JSON)
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const movies = JSON.parse(text);
      if (Array.isArray(movies)) {
        await dbService.addMovies(movies);
        await refreshGlobalMovies();
        await updateDbTotal();
        alert("¡Base de datos importada con éxito!");
      }
    } catch (e) {
      setUploadError("El archivo JSON no es válido.");
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = '';
    }
  };

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
        if (i % 50 === 0) updateDbTotal();
        await new Promise(r => setTimeout(r, 50));
      }
      await updateDbTotal();
    } catch (error) {
      setUploadError("Error en la sincronización masiva.");
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black flex items-center gap-4 tracking-tighter text-white">
            <Database className="w-12 h-12 text-indigo-500" />
            Panel de Control Maestro
          </h1>
          <p className="text-zinc-500 font-medium text-lg">Gestiona el catálogo global y sincroniza con otros dispositivos.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={updateDbTotal} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
             <RefreshCw className="w-5 h-5" />
           </button>
           <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-current animate-pulse" /> Sincronización Lista
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: IMPORTACION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Upload className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-8">Sincronización de Títulos</h3>
              
              {!isProcessing ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                    <FileText className="w-12 h-12 text-zinc-600 mb-4 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Subir .TXT (Nuevas)</span>
                    <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                  </label>

                  <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group bg-indigo-500/5">
                    <Download className="w-12 h-12 text-indigo-500/50 mb-4 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:text-white">Importar .JSON (Respaldo)</span>
                    <input type="file" className="hidden" accept=".json" onChange={handleImportJSON} />
                  </label>
                </div>
              ) : (
                <div className="space-y-10 py-6">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                        <Loader2 className="w-24 h-24 text-indigo-500 animate-spin" />
                        <Database className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-4">
                      <span>Procesando Colección</span>
                      <span className="text-indigo-400 font-black">{Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-6 rounded-full overflow-hidden p-1.5 shadow-2xl border border-zinc-800">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                      {progress.current} de {progress.total} películas analizadas
                    </p>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm font-bold">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" /> {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* COMPARTIR / EXPORTAR */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
             <div className="space-y-4 text-center md:text-left">
                <h4 className="text-3xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
                  <Share2 className="w-8 h-8 text-indigo-500" /> Exportar para otros
                </h4>
                <p className="text-zinc-500 font-medium max-w-sm">Descarga tu catálogo completo en un solo archivo para que otros usuarios puedan verlo al instante.</p>
             </div>
             <button 
                onClick={handleExportDB}
                className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 hover:scale-105 active:scale-95 shrink-0"
             >
                <Download className="w-6 h-6" /> DESCARGAR RESPALDO JSON
             </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: ESTADISTICAS */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black mb-8 text-zinc-400 uppercase tracking-widest">Estado Local</h3>
            
            <div className="space-y-8">
              <div className="p-8 bg-zinc-950 rounded-[2rem] border border-zinc-800 flex items-center justify-between hover:border-indigo-500/30 transition-all">
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2">Películas Activas</p>
                  <p className="text-6xl font-black text-white tracking-tighter">{dbTotal}</p>
                </div>
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <Film className="w-10 h-10" />
                </div>
              </div>

              <div className="p-8 bg-green-500/5 rounded-[2rem] border border-green-500/10 flex items-center justify-between">
                <div>
                  <p className="text-green-500/60 text-[10px] font-black uppercase tracking-widest mb-2">Sincronizadas hoy</p>
                  <p className="text-2xl font-black text-green-400">+{progress.added}</p>
                </div>
                <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500">
                  <ListChecks className="w-7 h-7" />
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info className="w-4 h-4" /> Cómo funciona el sistema
               </h4>
               <p className="text-xs text-zinc-600 leading-relaxed font-bold italic">
                 "Sube tus archivos .txt para poblar la base de datos con IA. Luego, usa el botón de exportar para crear un archivo que otros puedan cargar y ver tus mismas películas sin esperas."
               </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
             <div className="relative z-10 space-y-4">
               <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                 <ShieldAlert className="w-7 h-7" /> Modo Maestro
               </h3>
               <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
                 Como administrador, tienes la llave del catálogo. Los datos se almacenan en la memoria persistente del navegador de forma segura.
               </p>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
