
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Zap, Brain } from 'lucide-react';

interface OCRResult {
  text: string;
  isProcessing: boolean;
  confidence?: number;
  processingTime?: number;
}

interface OCRComparisonProps {
  tesseractResult: OCRResult;
  geminiResult: OCRResult;
  onTesseractTextChange: (text: string) => void;
  onGeminiTextChange: (text: string) => void;
}

const OCRComparison: React.FC<OCRComparisonProps> = ({
  tesseractResult,
  geminiResult,
  onTesseractTextChange,
  onGeminiTextChange,
}) => {
  const renderOCRSection = (
    title: string,
    icon: React.ReactNode,
    result: OCRResult,
    onTextChange: (text: string) => void,
    color: string
  ) => {
    if (result.isProcessing) {
      return (
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <Loader2 className={`w-8 h-8 animate-spin ${color} mx-auto mb-3`} />
            <p className={`text-lg font-medium ${color.replace('text-', 'text-').replace('-500', '-800')} mb-1`}>
              Traitement {title}...
            </p>
          </div>
        </div>
      );
    }

    if (!result.text) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-600 mb-1">En attente</p>
            <p className="text-sm text-gray-500">Capturez une image pour commencer</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {result.text.length} caractère{result.text.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {result.confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(result.confidence * 100)}% confiance
              </Badge>
            )}
            {result.processingTime && (
              <Badge variant="outline" className="text-xs">
                {result.processingTime}ms
              </Badge>
            )}
          </div>
        </div>
        
        <Textarea
          value={result.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Texte extrait par ${title}...`}
          className="min-h-[180px] resize-none border-2 focus:border-purple-300 focus:ring-purple-200"
        />
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-blue-600" />
            Tesseract.js
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderOCRSection(
            'Tesseract',
            <Zap className="w-5 h-5" />,
            tesseractResult,
            onTesseractTextChange,
            'text-blue-600'
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-600" />
            Gemini AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderOCRSection(
            'Gemini',
            <Brain className="w-5 h-5" />,
            geminiResult,
            onGeminiTextChange,
            'text-purple-600'
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRComparison;
