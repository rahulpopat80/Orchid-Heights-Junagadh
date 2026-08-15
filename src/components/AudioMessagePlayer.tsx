import React, { useState, useRef, useEffect } from 'react';

// A more realistic WhatsApp waveform
const WAVEFORM_HEIGHTS = [
  15, 20, 25, 40, 50, 70, 90, 80, 60, 40, 30, 25, 45, 65, 80, 
  100, 85, 70, 50, 30, 20, 25, 40, 60, 75, 65, 45, 30, 20, 15
];

export default function AudioMessagePlayer({ src, isMe, type, fileName }: { src: string, isMe?: boolean, type?: string, fileName?: string }) {
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
    if (isNaN(time) || !isLoaded) return '0:02';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const playedColor = isMe ? '#53bdeb' : '#53bdeb'; 
  const unplayedColor = isMe ? '#aabeb4' : '#b0bec5';
  const buttonColor = '#54656f';

  const isVoiceNote = type === 'audio/webm' || type === 'audio/ogg' || !fileName || fileName.startsWith('Voice_Message');

  if (!isVoiceNote) {
    // Normal audio file (e.g. mp3) - WhatsApp style audio file attachment
    return (
      <div className="flex flex-col gap-2 pt-1 pb-1 px-1 min-w-[220px] max-w-[260px] select-none">
        <audio ref={audioRef} src={src} preload="metadata" />
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center shrink-0 active:opacity-70 transition-opacity text-white"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="ml-1">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{fileName || 'Audio File'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatTime(duration)}</p>
          </div>
        </div>
        
        {/* Progress bar for audio files */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 relative h-1 bg-slate-200 rounded-full cursor-pointer">
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
            <div className="absolute top-0 left-0 h-full bg-[#00a884] rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00a884] rounded-full shadow-sm z-0" style={{ left: `calc(${Math.min(progress, 100)}% - 6px)` }} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-slate-500 font-medium">{formatTime(currentTime)}</span>
          <button 
             onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = src;
                link.download = fileName || 'audio.mp3';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
             }}
             className="text-[10px] text-indigo-500 font-bold hover:underline"
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  // Voice Note Mode
  return (
    <div className="flex items-center gap-2 pt-1 pb-2 min-w-[220px] max-w-[260px] select-none" style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex flex-col items-center">
        <button 
          onClick={togglePlay} 
          className="w-8 h-8 flex items-center justify-center shrink-0 active:opacity-70 transition-opacity"
          style={{ color: buttonColor }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        <span className="text-[10px] font-medium mt-1 absolute bottom-1 left-2" style={{ color: buttonColor }}>
          {formatTime(currentTime || duration)}
        </span>
      </div>
      
      <div className="flex-1 flex flex-col relative justify-center h-10">
        <div className="flex items-center relative w-full h-8 group ml-1">
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
           <div className="w-full h-6 flex items-center justify-between gap-[2px] pointer-events-none">
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
           
           {/* Scrubber Dot - Like Whatsapp */}
           <div 
             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none shadow-sm z-0 transition-transform" 
             style={{ 
               left: `calc(${Math.min(progress, 100)}% - 6px)`,
               backgroundColor: progress > 0 ? playedColor : buttonColor,
               transform: progress > 0 ? 'scale(1.2)' : 'scale(1)'
             }} 
           />
        </div>
      </div>
    </div>
  );
}
