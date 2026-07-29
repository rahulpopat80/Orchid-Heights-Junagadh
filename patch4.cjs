const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { Camera, Check, AlertCircle, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

interface WebcamCaptureProps {
  onPhotoCaptured: (base64: string) => void;
  value?: string;
  guestType?: string;
}

const PRESETS: Record<string, { label: string; iconLetter: string }> = {
  delivery: { label: 'Delivery Driver', iconLetter: '📦' },
  guest: { label: 'Guest / Relative', iconLetter: '👋' },
  electrician: { label: 'Technician / Repair', iconLetter: '⚡' },
  milkman: { label: 'Milkman / Daily', iconLetter: '🥛' },
  maid: { label: 'Household Help', iconLetter: '🧹' },
  other: { label: 'General Visitor', iconLetter: '👤' }
};

export default function WebcamCapture({ onPhotoCaptured, value, guestType }: WebcamCaptureProps) {
  const [photo, setPhoto] = useState<string>(value || '');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
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

  const startCamera = async (newMode: 'user' | 'environment' = 'environment') => {
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
      setCameraError('કેમેરા ચાલુ થતો નથી');
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
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-bold text-slate-700">
          મુલાકાતી નો ફોટો
        </label>
        {cameraActive && (
          <button
            type="button"
            onClick={flipCamera}
            className="px-3 py-1.5 rounded-lg transition text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 text-xs font-bold"
          >
            <FlipHorizontal className="w-4 h-4" /> કેમેરો ફેરવો
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Photo Display / Camera View */}
        <div className="w-full md:w-56 h-40 bg-slate-200 rounded-lg overflow-hidden relative border-2 border-slate-300 flex items-center justify-center shrink-0">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          ) : photo ? (
            <img src={photo} alt="Visitor" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-400" />
          )}

          {!cameraActive && photo && (
            <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full flex flex-col gap-3">
          {cameraError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-bold">
              {cameraError}
            </div>
          )}

          {cameraActive ? (
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 w-full shadow-md"
            >
              <Camera className="w-6 h-6" />
              <span>ફોટો પાડો</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera()}
              className="bg-slate-700 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 w-full shadow-md"
            >
              <Camera className="w-6 h-6" />
              <span>{photo ? 'ફરીથી ફોટો પાડો' : 'કેમેરો ચાલુ કરો'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('src/components/WebcamCapture.tsx', code);
