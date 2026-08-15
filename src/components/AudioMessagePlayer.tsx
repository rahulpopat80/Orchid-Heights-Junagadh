import React, { useState, useRef, useEffect } from 'react';

// WhatsApp-like waveform pattern
const WAVEFORM_HEIGHTS = [
  30, 45, 60, 80, 100, 75, 50, 40, 60, 85, 95, 70, 45, 35, 
  50, 70, 90, 80, 55, 40, 60, 75, 90, 65, 45, 30, 40, 60, 45, 35
];

export default function AudioMessagePlayer({ src, isMe }: { src: string, isMe?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const onEnded = () => { 
      setIsPlaying(false); 
      setCurrentTime(0); 
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
      setIsLoaded(true);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
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
    if (isNaN(time) || !isLoaded) return '0:02'; // Default placeholder matching screenshot
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Colors precisely matched to WhatsApp
  const playedColor = isMe ? '#4fb996' : '#53bdeb'; 
  const unplayedColor = isMe ? '#a0b9b0' : '#b0bec5';
  const buttonColor = '#54656f';

  return (
    <div className="flex items-center gap-3 pt-2 pb-1 px-1 w-[240px] select-none" style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 flex items-center justify-center shrink-0 active:opacity-70 transition-opacity"
        style={{ color: buttonColor }}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      
      <div className="flex-1 flex flex-col relative justify-center h-10">
        <div className="flex items-center relative w-full h-8 group">
           {/* Invisible range input for seeking */}
           <input 
             type="range" 
             min="0" 
             max={duration || 100} 
             value={currentTime} 
             onClick={e => e.stopPropagation()}
             onPointerDown={e => e.stopPropagation()}
             onChange={(e) => {
               if (audioRef.current) {
                 audioRef.current.currentTime = Number(e.target.value);
                 setCurrentTime(Number(e.target.value));
               }
             }}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
           />
           
           {/* Waveform Bars */}
           <div className="w-full h-5 flex items-center justify-between gap-[2px] px-1 pointer-events-none">
             {WAVEFORM_HEIGHTS.map((h, i) => {
                const isActive = i < (progress / 100) * WAVEFORM_HEIGHTS.length;
                return (
                  <div 
                    key={i} 
                    className="rounded-full" 
                    style={{ 
                      height: `${h}%`, 
                      width: '3px',
                      backgroundColor: isActive ? playedColor : unplayedColor,
                      transition: 'background-color 0.1s ease'
                    }} 
                  />
                );
             })}
           </div>
           
           {/* Scrubber Dot */}
           <div 
             className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full pointer-events-none shadow-sm z-0" 
             style={{ 
               left: `calc(${Math.min(progress, 100)}% - 7px)`,
               backgroundColor: buttonColor
             }} 
           />
        </div>
        
        <div className="text-[11px] font-medium absolute -bottom-3 left-1" style={{ color: buttonColor }}>
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}
