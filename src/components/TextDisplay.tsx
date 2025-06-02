
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2 } from 'lucide-react';

interface TextDisplayProps {
  text: string;
  isProcessing: boolean;
  onTextChange: (text: string) => void;
}

const TextDisplay: React.FC<TextDisplayProps> = ({
  text,
  isProcessing,
  onTextChange,
}) => {
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-lg font-medium text-blue-800 mb-1">Extraction du texte en cours...</p>
          <p className="text-sm text-blue-600">Analyse de l'image avec l'OCR</p>
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-600 mb-1">Aucun texte extrait</p>
          <p className="text-sm text-gray-500">Capturez une image pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {text.length} caractère{text.length > 1 ? 's' : ''} détecté{text.length > 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Texte extrait
        </div>
      </div>
      
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Le texte extrait apparaîtra ici..."
        className="min-h-[200px] resize-none border-2 focus:border-purple-300 focus:ring-purple-200"
      />
      
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>💡 Astuce :</strong> Vous pouvez éditer le texte directement dans cette zone si l'OCR a fait des erreurs.
      </div>
    </div>
  );
};

export default TextDisplay;
