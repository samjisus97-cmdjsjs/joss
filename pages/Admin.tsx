
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Upload, FileText, Loader2, Database, ShieldAlert, AlertCircle, Info, CheckCircle2, Zap, Film, ListChecks, History, Download, Share2, RefreshCw, ClipboardList } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { dbService } from '../services/db';

const Admin: React.FC = () => {
  const { isAdmin, addMoviesToGlobal, refreshGlobalMovies } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, added: 0 });
  const [dbTotal, setDbTotal] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

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
      
      if (trimmed.toLowerCase().includes('embed:')) {
        const imdbMatch = trimmed.match(/tt\d+/);
        if (imdbMatch) {
          if (currentMovie) movies.push(currentMovie);
          currentMovie = { imdbId: imdbMatch[0], links: [] };
          currentLang = null;
        }
      } else if (trimmed.toLowerCase().includes('idioma:')) {
        const lang = trimmed.split(':')[1]?.trim() || 'Desconocido';
        currentLang = { language: lang, servers: [] };
        if (currentMovie) currentMovie.links.push(currentLang);
      } else if (trimmed.startsWith('-') && currentLang) {
        const parts = trimmed.substring(1).split(':');
        if (parts.length >= 2) {
          const serverName = parts[0].trim();
          const url = parts.slice(1).join(':').trim();
          if (!url.toLowerCase().includes('download')) {
            currentLang.servers.push({ name: serverName, url: url });
          }
        }
      }
    }
    if (currentMovie) movies.push(currentMovie);
    return movies;
  };

  const processContent = async (text: string) => {
    setIsProcessing(true);
    setUploadError(null);
    const parsedEntries = parseTxtContent(text);
    
    if (parsedEntries.length === 0) {
      setUploadError("No se encontraron bloques 'Embed:' válidos en el texto.");
      setIsProcessing(false);
      return;
    }

    const total = parsedEntries.length;
    setProgress({ current: 0, total, added: 0 });
    
    const BATCH_SIZE = 10;
    for (let i = 0; i < parsedEntries.length; i += BATCH_SIZE) {
      const batch = parsedEntries.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (entry) => {
          try {
            const metadata = await tmdbService.getMetadataByImdbId(entry.imdbId);
            if (metadata) return { ...metadata, links: entry.links };
          } catch (e) { return null; }
          return null;
        })
      );

      const validResults = batchResults.filter(m => m !== null);
      if (validResults.length > 0) {
        await addMoviesToGlobal(validResults as any);
        setProgress(prev => ({ ...prev, added: prev.added + validResults.length }));
      }
      setProgress(prev => ({ ...prev, current: Math.min(i + BATCH_SIZE, total) }));
      await updateDbTotal();
    }
    setIsProcessing(false);
    setPastedText('');
    setPasteMode(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await processContent(text);
    if (event.target) event.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black flex items-center gap-4 tracking-tighter text-white">
            <ShieldAlert className="w-12 h-12 text-indigo-500" />
            Control Maestro
          </h1>
          <p className="text-zinc-500 font-medium text-lg">Hola, administrador. Gestiona el catálogo global aquí.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest">
          <Zap className="w-4 h-4 fill-current animate-pulse" /> Servidor Activo
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
            <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
              <Database className="w-8 h-8 text-indigo-500" /> Cargar Películas
            </h3>
            
            {!isProcessing ? (
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setPasteMode(false)}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!pasteMode ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" /> Subir Archivo
                  </button>
                  <button 
                    onClick={() => setPasteMode(true)}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${pasteMode ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    <ClipboardList className="w-4 h-4 inline mr-2" /> Pegar Texto
                  </button>
                </div>

                {pasteMode ? (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-zinc-400 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Pega aquí el contenido de tu archivo .txt (Embed:, Idioma:, etc.)"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                    ></textarea>
                    <button 
                      onClick={() => processContent(pastedText)}
                      disabled={!pastedText.trim()}
                      className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-30"
                    >
                      PROCESAR CONTENIDO PEGADO
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-[2.5rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                      <FileText className="w-12 h-12 text-zinc-600 mb-4 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Subir .TXT</span>
                      <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                    </label>
                    <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group bg-indigo-500/5">
                      <Download className="w-12 h-12 text-indigo-400 mb-4 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:text-white">Importar .JSON</span>
                      <input type="file" className="hidden" accept=".json" onChange={handleImportJSON} />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10 py-12">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Loader2 className="w-24 h-24 text-indigo-500 animate-spin" />
                    <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-black text-white">Sincronizando Catálogo</h4>
                    <p className="text-zinc-500 text-sm font-medium">Buscando metadatos en TMDB...</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Progreso</span>
                    <span className="text-indigo-400">{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
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
              <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle className="w-6 h-6 shrink-0" /> {uploadError}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-zinc-950 border border-indigo-500/20 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="space-y-3">
              <h4 className="text-3xl font-black text-white flex items-center gap-3">
                <Share2 className="w-8 h-8 text-indigo-500" /> Compartir Base de Datos
              </h4>
              <p className="text-zinc-400 font-medium max-w-sm">Genera un archivo JSON para que otros usuarios carguen todo tu catálogo instantáneamente.</p>
            </div>
            <button 
              onClick={handleExportDB}
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 hover:scale-105 active:scale-95"
            >
              <Download className="w-6 h-6" /> EXPORTAR JSON
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black mb-8 text-zinc-500 uppercase tracking-widest">Estadísticas</h3>
            <div className="space-y-6">
              <div className="p-8 bg-zinc-950 rounded-[2.5rem] border border-zinc-800 flex items-center justify-between group-hover:border-indigo-500/30 transition-all">
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Total Películas</p>
                  <p className="text-6xl font-black text-white tracking-tighter">{dbTotal}</p>
                </div>
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500">
                  <Film className="w-10 h-10" />
                </div>
              </div>
              <div className="p-8 bg-green-500/5 rounded-[2.5rem] border border-green-500/10 flex items-center justify-between">
                <div>
                  <p className="text-green-500/60 text-[10px] font-black uppercase tracking-widest mb-1">Cargadas hoy</p>
                  <p className="text-3xl font-black text-green-400">+{progress.added}</p>
                </div>
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <ListChecks className="w-7 h-7" />
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
              <p className="text-xs text-zinc-500 leading-relaxed font-bold italic">
                Tip: Usa el "Modo Pegado" para copiar directamente desde tu bloc de notas sin tener que buscar el archivo.
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <ShieldAlert className="w-7 h-7" /> Modo Maestro
              </h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
                Solo tú (samjisus97@gmail.com) puedes ver este panel. Las películas que subas aquí se guardarán permanentemente en la base de datos de tu navegador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;