
import React from 'react';
import { ProductInfo } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Leaf, 
  Globe, 
  Info, 
  ExternalLink,
  ShieldCheck,
  Factory,
  ChevronLeft,
  CircleAlert,
  WheatOff
} from 'lucide-react';

interface ResultsViewProps {
  product: ProductInfo;
  onClose: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ product, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'text-green-700' };
    if (score >= 60) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', label: 'text-yellow-700' };
    return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'text-red-700' };
  };

  const colors = getScoreColor(product.healthScore);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-4 border-b flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
           <Info size={18} className="text-blue-500" />
           <span className="font-bold text-gray-900">Análisis de Ingredientes</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Product Section */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{product.name}</h1>
            <p className="text-gray-500 font-medium text-sm">
              {product.brand} • <span className="text-gray-400 font-normal">{product.manufacturer}</span>
            </p>
          </div>
          <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${colors.bg} ${colors.border}`}>
            <span className={`text-3xl font-bold leading-none ${colors.text}`}>{product.healthScore}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${colors.label}`}>{product.healthLabel || 'Moderado'}</span>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2">
          {product.isVegan && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
              <CheckCircle2 size={14} /> Vegano
            </div>
          )}
          {product.isGlutenFree && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-100">
              <WheatOff size={14} /> Sin Gluten
            </div>
          )}
          {product.barcode && (
            <div className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full text-xs font-semibold border border-gray-100">
              {product.barcode}
            </div>
          )}
        </div>

        {/* Origin Section */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-50 rounded-full text-gray-400">
               <Globe size={18} />
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Origen / Fabricante</p>
               <p className="text-sm font-medium text-gray-700">{product.countryOfOrigin || 'USA'} — {product.manufacturer || 'Nuun & Company, Inc.'}</p>
             </div>
          </div>
        </div>

        {/* Main Analysis Paragraph */}
        <section className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
             <Info size={18} className="text-blue-500" />
             <h3 className="font-bold text-gray-900">Análisis de Ingredientes</h3>
          </div>
          <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100/50">
            <p className="text-gray-700 leading-relaxed text-sm italic">
              "{product.summary}"
            </p>
          </div>
        </section>

        {/* Positivo List */}
        {product.positivePoints && product.positivePoints.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Positivo</h3>
            </div>
            <ul className="space-y-2">
              {product.positivePoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 leading-tight">
                  <span className="text-green-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Caution List */}
        {product.cautionPoints && product.cautionPoints.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <CircleAlert size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">A Considerar</h3>
            </div>
            <ul className="space-y-2">
              {product.cautionPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 leading-tight">
                  <span className="text-red-400 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sources Section */}
        {product.sources && product.sources.length > 0 && (
          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Fuentes Verificadas</h3>
            <div className="space-y-2">
              {product.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-xs font-medium text-gray-600 truncate mr-2">{source.title}</span>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t z-40">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-black text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
        >
          Nuevo Escaneo
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
