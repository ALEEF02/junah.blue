import React, { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface AudioPreviewPlayerProps {
  previewUrl: string;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({ previewUrl }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePlayback}
        disabled={!previewUrl}
        className="flex h-10 w-10 items-center justify-center border border-slate-500 text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Toggle beat preview"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
      <span className="text-sm uppercase tracking-[0.2em] text-slate-600">Preview</span>
      <audio ref={audioRef} src={previewUrl} onEnded={() => setIsPlaying(false)} preload="none" />
    </div>
  );
};
