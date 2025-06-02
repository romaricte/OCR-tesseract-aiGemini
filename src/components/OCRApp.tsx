
import React, { useState } from 'react';
import { Camera, Copy, Trash2, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageCapture from './ImageCapture';
import OCRComparison from './OCRComparison';
import APIKeyInput from './APIKeyInput';

const OCRApp = () => {
  const [tesseractResult, setTesseractResult] = useState({
    text: '',
    isProcessing: false,
    processingTime: 0
  });
  
  const [geminiResult, setGeminiResult] = useState({
    text: '',
    isProcessing: false,
    processingTime: 0
  });
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const handleTesseractExtracted = (text: string, processingTime?: number) => {
    setTesseractResult({
      text,
      isProcessing: false,
      processingTime: processingTime || 0
    });
    toast.success('Texte extrait avec Tesseract!');
  };

  const handleGeminiExtracted = (text: string, processingTime?: number) => {
    setGeminiResult({
      text,
      isProcessing: false,
      processingTime: processingTime || 0
    });
    toast.success('Texte extrait avec Gemini!');
  };

  const handleTesseractProcessingStart = () => {
    setTesseractResult(prev => ({ ...prev, isProcessing: true }));
  };

  const handleGeminiProcessingStart = () => {
    setGeminiResult(prev => ({ ...prev, isProcessing: true }));
  };

  const handleImageCaptured = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setShowCamera(false);
  };

  const copyBothResults = () => {
    const combinedText = `=== TESSERACT ===\n${tesseractResult.text}\n\n=== GEMINI ===\n${geminiResult.text}`;
    navigator.clipboard.writeText(combinedText);
    toast.success('Résultats des deux OCR copiés!');
  };

  const clearAll = () => {
    setTesseractResult({ text: '', isProcessing: false, processingTime: 0 });
    setGeminiResult({ text: '', isProcessing: false, processingTime: 0 });
    setCapturedImage(null);
    setShowCamera(false);
    toast.info('Tout effacé');
  };

  const hasResults = tesseractResult.text || geminiResult.text;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            TextSnap OCR Pro
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comparez les résultats OCR de Tesseract.js et Gemini AI en temps réel
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Configuration API */}
          <APIKeyInput onApiKeyChange={setGeminiApiKey} />

          {/* Section Capture */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Capture d'Image
                </div>
                {hasResults && (
                  <div className="flex gap-2">
                    <Button
                      onClick={copyBothResults}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copier tout
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showCamera && !capturedImage && (
                <div className="grid gap-4">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Camera className="w-6 h-6 mr-2" />
                    Ouvrir la Caméra
                  </Button>
                </div>
              )}

              {showCamera && (
                <ImageCapture
                  onImageCaptured={handleImageCaptured}
                  onTesseractTextExtracted={handleTesseractExtracted}
                  onGeminiTextExtracted={handleGeminiExtracted}
                  onTesseractProcessingStart={handleTesseractProcessingStart}
                  onGeminiProcessingStart={handleGeminiProcessingStart}
                  onCancel={() => setShowCamera(false)}
                  geminiApiKey={geminiApiKey}
                />
              )}

              {capturedImage && !showCamera && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={capturedImage}
                      alt="Image capturée"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCamera(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Nouvelle Photo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Comparaison */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <GitCompare className="w-6 h-6 text-purple-600" />
                Comparaison OCR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OCRComparison
                tesseractResult={tesseractResult}
                geminiResult={geminiResult}
                onTesseractTextChange={(text) => setTesseractResult(prev => ({ ...prev, text }))}
                onGeminiTextChange={(text) => setGeminiResult(prev => ({ ...prev, text }))}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Comment utiliser TextSnap OCR Pro :</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">1</div>
                  <div>Ajoutez votre clé API Gemini pour activer l'IA</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs mt-0.5">2</div>
                  <div>Capturez une image pour traitement OCR</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-xs mt-0.5">3</div>
                  <div>Comparez les résultats des deux moteurs OCR</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-xs mt-0.5">4</div>
                  <div>Copiez le meilleur résultat ou les deux</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OCRApp;
