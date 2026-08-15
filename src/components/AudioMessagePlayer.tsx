import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const WAVEFORM_HEIGHTS = [30, 50, 70, 90, 100, 80, 60, 50, 70, 80, 60, 40, 50, 70, 90, 80, 60, 50, 40, 60, 80, 70, 50, 40, 30, 20, 30, 40, 20, 30];

export default function AudioMessagePlayer({ src, isMe }: { src: string, isMe?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 min-w-[220px] max-w-[280px] pt-1 pb-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center shrink-0">
        {isPlaying ? (
          <Pause className="w-7 h-7 text-slate-500 fill-slate-500" />
        ) : (
          <Play className="w-7 h-7 text-slate-500 fill-slate-500" />
        )}
      </button>
      <div className="flex-1 flex flex-col relative">
        <div className="flex items-center h-8 relative w-full group">
           <input 
             type="range" 
             min="0" 
             max={duration || 100} 
             value={currentTime} 
             onClick={e => e.stopPropagation()}
             onChange={(e) => {
               if (audioRef.current) {
                 audioRef.current.currentTime = Number(e.target.value);
                 setCurrentTime(Number(e.target.value));
               }
             }}
             className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
           />
           <div className="w-full h-5 flex items-center gap-[2px]">
             {WAVEFORM_HEIGHTS.map((h, i) => {
                const isActive = i < (progress / 100) * WAVEFORM_HEIGHTS.length;
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-colors ${isActive ? (isMe ? 'bg-[#00a884]' : 'bg-indigo-500') : 'bg-slate-300'}`} 
                    style={{ height: `${h}%` }} 
                  />
                );
             })}
           </div>
           <div 
             className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full pointer-events-none transition-all shadow-sm ${isMe ? 'bg-[#00a884]' : 'bg-indigo-500'}`} 
             style={{ left: `max(0px, calc(${progress}% - 7px))` }} 
           />
        </div>
        <div className="text-[11px] text-slate-500 font-medium absolute -bottom-1 left-0">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}
