import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, SwitchCamera } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    const startCamera = async () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Unable to access camera. Please ensure permissions are granted.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  }, [onCapture]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onCancel} className="text-slate-300 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 object-cover w-full h-full"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay Controls */}
      <div className="absolute top-0 left-0 right-0 safe-top p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onCancel}
          className="touch-target bg-black/20 backdrop-blur-md p-2.5 sm:p-3 rounded-full text-white hover:bg-black/40 transition active:scale-95"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={toggleCamera}
          className="touch-target bg-black/20 backdrop-blur-md p-2.5 sm:p-3 rounded-full text-white hover:bg-black/40 transition active:scale-95"
        >
          <SwitchCamera className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 safe-bottom p-6 sm:p-8 md:p-12 flex justify-center items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <button
          onClick={handleCapture}
          className="touch-target w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm active:bg-white/30 transition-all shadow-xl active:scale-95"
          aria-label="Take Picture"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white shadow-inner" />
        </button>
      </div>
    </div>
  );
};

export default CameraView;