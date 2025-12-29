
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCcw, Info, Scan, CircleAlert } from 'lucide-react';

interface ScannerProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanningMessage, setScanningMessage] = useState('Centra el código de barras');
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Try to enable continuous focus if supported
          const track = mediaStream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as any;
          if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
            await track.applyConstraints({
              advanced: [{ focusMode: 'continuous' }] as any
            });
          }

          // Initialize Auto-detection if supported by browser
          if ('BarcodeDetector' in window) {
            startBarcodeDetection();
          }
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios.');
        console.error(err);
      }
    };

    const startBarcodeDetection = async () => {
      // @ts-ignore - BarcodeDetector is a modern experimental API
      const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'];
      // @ts-ignore
      const barcodeDetector = new window.BarcodeDetector({ formats });
      
      setIsAutoDetecting(true);
      
      const detect = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              setScanningMessage('¡Código Detectado!');
              // Brief delay to show "Detected" message before capturing
              setTimeout(() => {
                captureFrame();
              }, 300);
              return; // Stop detection loop
            }
          } catch (e) {
            console.error('Barcode detection error:', e);
          }
        }
        detectionIntervalRef.current = window.requestAnimationFrame(detect);
      };

      detectionIntervalRef.current = window.requestAnimationFrame(detect);
    };

    startCamera();

    return () => {
      if (detectionIntervalRef.current) {
        window.cancelAnimationFrame(detectionIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onCancel}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <Scan size={16} className={isAutoDetecting ? "text-green-400 animate-pulse" : "text-white/60"} />
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            {isAutoDetecting ? 'Auto-detección Activa' : 'Modo Manual'}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-8 max-w-xs">
            <div className="bg-red-500/20 p-4 rounded-3xl border border-red-500/30 mb-6 inline-block">
              <CircleAlert size={48} className="text-red-400" />
            </div>
            <p className="mb-6 font-medium text-red-200">{error}</p>
            <button 
              onClick={onCancel}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
            >
              Regresar
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Darkened Overlays */}
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-black/40"></div>
              <div className="flex flex-row">
                <div className="flex-1 bg-black/40"></div>
                <div className="w-72 h-72 relative">
                   <div className="absolute inset-0 pointer-events-none">
                      {/* Corners */}
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-3xl"></div>
                      
                      {/* Scanning Line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan"></div>
                   </div>
                </div>
                <div className="flex-1 bg-black/40"></div>
              </div>
              <div className="flex-1 bg-black/40 flex flex-col items-center pt-8">
                <div className={`px-6 py-3 rounded-2xl border transition-all duration-300 ${
                  scanningMessage === '¡Código Detectado!' 
                  ? 'bg-green-500 border-green-400 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.5)]' 
                  : 'bg-white/10 backdrop-blur-md border-white/20'
                } max-w-[80%]`}>
                   <p className="text-white text-center text-sm font-bold">
                     {scanningMessage}
                   </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-44 bg-black flex items-center justify-around px-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="flex flex-col items-center gap-2">
           <button className="p-4 rounded-full bg-zinc-900 text-white/60 hover:text-white transition-colors border border-white/5">
            <Info size={24} />
           </button>
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ayuda</span>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-2xl group-active:bg-green-500/40 transition-colors"></div>
          <button 
            onClick={captureFrame}
            disabled={!stream}
            className="relative w-24 h-24 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform flex items-center justify-center disabled:opacity-50"
          >
            <div className="w-20 h-20 rounded-full border-4 border-black/5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/5 border border-black/10"></div>
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
           <button className="p-4 rounded-full bg-zinc-900 text-white/60 hover:text-white transition-colors border border-white/5">
            <RefreshCcw size={24} />
           </button>
           <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Girar</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0.1; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0.1; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
          position: absolute;
        }
      `}</style>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
