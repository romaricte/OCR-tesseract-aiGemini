
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';

interface APIKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Charger la clé depuis localStorage au démarrage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
      validateKey(savedKey);
    }
  }, [onApiKeyChange]);

  const validateKey = (key: string) => {
    const valid = key.trim().length >= 20 && 
                  !key.includes('Sélectionner') && 
                  !key.includes('Google Cloud') &&
                  key.startsWith('AIza');
    setIsValid(valid);
    return valid;
  };

  const handleSaveKey = () => {
    if (validateKey(apiKey)) {
      localStorage.setItem('gemini_api_key', apiKey);
      onApiKeyChange(apiKey);
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    onApiKeyChange('');
    setIsValid(true);
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    validateKey(value);
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="w-5 h-5 text-purple-600" />
          Configuration Gemini AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="AIzaSy... (votre clé API Gemini)"
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className={`pr-10 ${!isValid && apiKey ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <Button 
            onClick={handleSaveKey} 
            disabled={!apiKey.trim() || !isValid}
            className={isValid ? '' : 'opacity-50'}
          >
            Sauvegarder
          </Button>
          {apiKey && (
            <Button variant="outline" onClick={handleClearKey}>
              Effacer
            </Button>
          )}
        </div>

        {!isValid && apiKey && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>Clé API invalide. Elle doit commencer par "AIza" et contenir au moins 20 caractères.</span>
          </div>
        )}
        
        <div className="text-xs text-gray-600 bg-white/50 p-3 rounded-lg">
          <p className="mb-2">
            <strong>🔑 Comment obtenir votre clé API :</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 mb-2">
            <li>Rendez-vous sur Google AI Studio</li>
            <li>Connectez-vous avec votre compte Google</li>
            <li>Cliquez sur "Get API Key" puis "Create API Key"</li>
            <li>Sélectionnez un projet ou créez-en un nouveau</li>
            <li>Copiez la clé qui commence par "AIza..."</li>
          </ol>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 underline"
          >
            Obtenir une clé API <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyInput;
