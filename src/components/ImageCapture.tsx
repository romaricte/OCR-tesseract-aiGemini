import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import { processImageWithGemini } from '../services/geminiOCR';

interface ImageCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
  onTesseractTextExtracted: (text: string, processingTime?: number) => void;
  onGeminiTextExtracted: (text: string, processingTime?: number) => void;
  onTesseractProcessingStart: () => void;
  onGeminiProcessingStart: () => void;
  onCancel: () => void;
  geminiApiKey: string;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({
  onImageCaptured,
  onTesseractTextExtracted,
  onGeminiTextExtracted,
  onTesseractProcessingStart,
  onGeminiProcessingStart,
  onCancel,
  geminiApiKey,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Erreur caméra:', error);
      setHasCamera(false);
      toast.error('Impossible d\'accéder à la caméra');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    onImageCaptured(imageUrl);
    processWithBothOCR(imageUrl);
  }, [onImageCaptured]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageCaptured(imageUrl);
      processWithBothOCR(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const processWithBothOCR = async (imageUrl: string) => {
    // Lancer Tesseract en parallèle
    processTesseractOCR(imageUrl);
    
    // Lancer Gemini seulement si la clé API est disponible
    if (geminiApiKey.trim()) {
      processGeminiOCR(imageUrl);
    } else {
      toast.warning('Clé API Gemini manquante - seul Tesseract sera utilisé');
    }
  };

  const processTesseractOCR = async (imageUrl: string) => {
    onTesseractProcessingStart();
    const startTime = Date.now();
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'fra+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progress = Math.round(m.progress * 100);
              console.log(`Tesseract: ${progress}%`);
            }
          }
        }
      );
      
      const processingTime = Date.now() - startTime;
      onTesseractTextExtracted(text.trim(), processingTime);
    } catch (error) {
      console.error('Erreur Tesseract:', error);
      toast.error('Erreur Tesseract OCR');
      onTesseractTextExtracted('');
    }
  };

  const processGeminiOCR = async (imageUrl: string) => {
    onGeminiProcessingStart();
    const startTime = Date.now();
    
    try {
      const result = await processImageWithGemini(imageUrl, geminiApiKey);
      const processingTime = Date.now() - startTime;
      onGeminiTextExtracted(result.text, processingTime);
    } catch (error) {
      console.error('Erreur Gemini:', error);
      toast.error('Erreur Gemini OCR - Vérifiez votre clé API');
      onGeminiTextExtracted('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initialisation de la caméra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasCamera ? (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-100"
            >
              <Camera className="w-8 h-8" />
            </Button>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Caméra non disponible</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Sélectionner une image
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choisir un fichier
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCapture;
