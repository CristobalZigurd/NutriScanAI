
// Add missing Leaf import from lucide-react and clean up unused imports.
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  History, 
  Home as HomeIcon, 
  Search, 
  Scan,
  Apple,
  ShieldCheck,
  Trash2,
  Leaf
} from 'lucide-react';
import { AppState, ProductInfo, ScanHistoryItem } from './types';
import Scanner from './components/Scanner';
import ResultsView from './components/ResultsView';
import { analyzeProductImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing product data...');

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('nutriscan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (productInfo: ProductInfo, imagePreview: string) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      product: productInfo,
      imagePreview
    };
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('nutriscan_history', JSON.stringify(updatedHistory));
  };

  const handleCapture = async (base64: string) => {
    setState(AppState.LOADING);
    setLoadingMessage('Scanning label and barcode...');
    try {
      const data = await analyzeProductImage(base64);
      setProduct(data);
      saveToHistory(data, `data:image/jpeg;base64,${base64}`);
      setState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze image. Please try again with a clearer photo.');
      setState(AppState.HOME);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('nutriscan_history', JSON.stringify(updated));
  };

  const renderHome = () => (
    <div className="flex flex-col min-h-screen px-6 py-8 pb-32">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            NutriScan <span className="text-green-500 italic">AI</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Know exactly what you're eating.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <Apple size={28} />
        </div>
      </header>

      {/* Quick Action */}
      <div 
        onClick={() => setState(AppState.SCANNING)}
        className="mb-10 bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group active:scale-95 transition-all cursor-pointer"
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Instant Scan</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-[200px]">Scan barcodes or nutrition labels to see ingredients analysis.</p>
          <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
            <Camera size={20} className="text-green-400" />
            <span className="font-semibold text-sm">Launch Camera</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-green-500/30 transition-colors"></div>
        <Scan size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
          <ShieldCheck size={24} className="text-blue-500 mb-2" />
          <span className="text-xs font-bold text-blue-900 uppercase">Ingredient Safety</span>
        </div>
        <div className="p-4 rounded-3xl bg-green-50 border border-green-100 flex flex-col items-center text-center">
          <Leaf size={24} className="text-green-500 mb-2" />
          <span className="text-xs font-bold text-green-900 uppercase">Organic Check</span>
        </div>
      </div>

      {/* Recent History Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Scans</h3>
          <button 
            onClick={() => setState(AppState.HISTORY)}
            className="text-xs font-bold text-green-600 uppercase tracking-widest"
          >
            See All
          </button>
        </div>
        {history.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
            <History size={32} className="mb-2 opacity-20" />
            <p className="text-sm">Your scan history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setProduct(item.product); setState(AppState.RESULTS); }}
                className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm active:bg-gray-50 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  <img src={item.imagePreview} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{item.product.brand}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  item.product.healthScore >= 80 ? 'bg-green-50 text-green-600 border-green-100' :
                  item.product.healthScore >= 50 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  <span className="text-sm font-bold">{item.product.healthScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-100"></div>
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-t-green-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={32} className="text-gray-300" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">Analyzing Product</h2>
      <p className="text-gray-500 max-w-[240px] leading-relaxed">{loadingMessage}</p>
      
      <div className="mt-12 space-y-4 w-full max-w-xs">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 border-b flex items-center gap-4">
        <button onClick={() => setState(AppState.HOME)} className="p-2 text-gray-500">
          <HomeIcon size={24} />
        </button>
        <h2 className="font-bold text-lg">Scan History</h2>
      </header>

      <div className="p-6">
        {history.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <p>No history found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setProduct(item.product); setState(AppState.RESULTS); }}
                className="group relative flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
                  <img src={item.imagePreview} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                  <h4 className="font-bold text-base text-gray-900 truncate mb-0.5">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{item.product.brand}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    item.product.healthScore >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
                    item.product.healthScore >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    <span className="text-sm font-bold">{item.product.healthScore}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-x-hidden">
      {state === AppState.HOME && renderHome()}
      {state === AppState.HISTORY && renderHistory()}
      {state === AppState.LOADING && renderLoading()}
      {state === AppState.SCANNING && (
        <Scanner 
          onCapture={handleCapture} 
          onCancel={() => setState(AppState.HOME)} 
        />
      )}
      {state === AppState.RESULTS && product && (
        <ResultsView 
          product={product} 
          onClose={() => setState(AppState.HOME)} 
        />
      )}

      {/* Navigation Bar */}
      {state !== AppState.SCANNING && state !== AppState.LOADING && state !== AppState.RESULTS && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t px-8 py-4 flex items-center justify-between z-40">
          <button 
            onClick={() => setState(AppState.HOME)}
            className={`flex flex-col items-center gap-1 ${state === AppState.HOME ? 'text-green-600' : 'text-gray-400'}`}
          >
            <HomeIcon size={24} strokeWidth={state === AppState.HOME ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          
          <button 
            onClick={() => setState(AppState.SCANNING)}
            className="flex flex-col items-center -mt-12 bg-black text-white p-5 rounded-full shadow-xl shadow-green-500/20 active:scale-90 transition-transform"
          >
            <Scan size={28} />
          </button>
          
          <button 
            onClick={() => setState(AppState.HISTORY)}
            className={`flex flex-col items-center gap-1 ${state === AppState.HISTORY ? 'text-green-600' : 'text-gray-400'}`}
          >
            <History size={24} strokeWidth={state === AppState.HISTORY ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase">History</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
