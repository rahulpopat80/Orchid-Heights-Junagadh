import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

interface WebcamCaptureProps {
  onPhotoCaptured: (base64: string) => void;
  value?: string;
  guestType?: string; // used to pre-select preset
}

const PRESETS: Record<string, { label: string; svgColor: string; iconLetter: string }> = {
  delivery: { label: 'Delivery Driver', svgColor: 'from-amber-400 to-orange-500', iconLetter: '📦' },
  guest: { label: 'Guest / Relative', svgColor: 'from-indigo-400 to-indigo-600', iconLetter: '👋' },
  electrician: { label: 'Technician / Repair', svgColor: 'from-blue-400 to-blue-600', iconLetter: '⚡' },
  milkman: { label: 'Milkman / Daily', svgColor: 'from-sky-400 to-sky-600', iconLetter: '🥛' },
  maid: { label: 'Household Help', svgColor: 'from-emerald-400 to-emerald-600', iconLetter: '🧹' },
  other: { label: 'General Visitor', svgColor: 'from-slate-400 to-slate-600', iconLetter: '👤' }
};

export default function WebcamCapture({ onPhotoCaptured, value, guestType }: WebcamCaptureProps) {
  const [photo, setPhoto] = useState<string>(value || '');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const generatePresetDataUri = (key: string) => {
    const preset = PRESETS[key] || PRESETS.other;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 300, 300);
      gradient.addColorStop(0, '#f1f5f9');
      gradient.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);

      ctx.font = '96px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(preset.iconLetter, 150, 150);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(preset.label.toUpperCase(), 150, 260);

      return canvas.toDataURL('image/jpeg');
    }
    return '';
  };

  useEffect(() => {
    // Only auto-generate preset if the camera isn't actively being used or a photo isn't manually taken
    if (!cameraActive) {
      let key = 'other';
      if (guestType) {
        const typeLower = guestType.toLowerCase();
        if (typeLower.includes('milk')) key = 'milkman';
        else if (typeLower.includes('guest') || typeLower.includes('relative')) key = 'guest';
        else if (typeLower.includes('tech') || typeLower.includes('electr')) key = 'electrician';
        else if (typeLower.includes('maid') || typeLower.includes('help')) key = 'maid';
        else if (typeLower.includes('deliv')) key = 'delivery';
      }
      const base64 = generatePresetDataUri(key);
      setPhoto(base64);
      onPhotoCaptured(base64);
    }
  }, [guestType]);

  useEffect(() => {
    if (value !== undefined) {
      setPhoto(value);
    }
  }, [value]);

  const startCamera = async (newMode: 'user' | 'environment' = 'user') => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
      setFacingMode(newMode);
    } catch (err: any) {
      setCameraError('કેમેરાની પરવાનગી નથી (Camera error)');
      setCameraActive(false);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        onPhotoCaptured(dataUrl);
        stopCamera();
      }
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          મુલાકાતી નો ફોટો <span className="text-red-500">*</span>
        </label>
        {cameraActive && (
          <button
            type="button"
            onClick={flipCamera}
            className="px-2.5 py-1 rounded-md transition text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 text-[10px] font-bold"
          >
            <FlipHorizontal className="w-3 h-3" /> ફેરવો (Flip)
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Photo Display / Camera View */}
        <div className="w-32 h-32 mx-auto bg-slate-900 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center shrink-0 border-2 border-slate-300">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain transform"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          ) : photo ? (
            <img src={photo} alt="Visitor" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-500" />
          )}

          {!cameraActive && photo && (
            <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full text-center md:text-left space-y-2">
          {cameraError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg text-xs flex items-center gap-1.5 justify-center md:justify-start">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {cameraActive ? (
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow cursor-pointer transition w-full md:w-auto"
              >
                <Camera className="w-4 h-4" />
                <span>ફોટો પાડો (Snap)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startCamera()}
                className="bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow cursor-pointer transition w-full md:w-auto"
              >
                <Camera className="w-4 h-4" />
                <span>{photo ? 'ફરીથી ફોટો પાડો (Retake)' : 'કેમેરા ચાલુ કરો (Start Camera)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
