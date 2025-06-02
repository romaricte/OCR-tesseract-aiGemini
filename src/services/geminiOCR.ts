
export interface GeminiOCRResult {
  text: string;
  confidence?: number;
}

export const processImageWithGemini = async (imageUrl: string, apiKey: string): Promise<GeminiOCRResult> => {
  try {
    // Validation de la clé API
    if (!apiKey || apiKey.trim().length < 20 || apiKey.includes('Sélectionner') || apiKey.includes('Google Cloud')) {
      throw new Error('Clé API Gemini invalide. Veuillez entrer une clé API valide.');
    }

    // Convertir l'image en base64 si nécessaire
    const base64Image = imageUrl.startsWith('data:') 
      ? imageUrl.split(',')[1] 
      : await convertImageToBase64(imageUrl);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Extrais tout le texte visible dans cette image. Retourne uniquement le texte sans commentaires ni explications."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Détails erreur Gemini:', errorData);
      
      if (response.status === 403) {
        throw new Error('Clé API invalide ou quota dépassé. Vérifiez votre clé API Gemini.');
      } else if (response.status === 400) {
        throw new Error('Requête invalide. Vérifiez votre clé API et réessayez.');
      } else {
        throw new Error(`Erreur API Gemini: ${response.status}`);
      }
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const extractedText = data.candidates[0].content.parts[0].text;
      return {
        text: extractedText.trim(),
        confidence: data.candidates[0].finishReason === 'STOP' ? 0.9 : 0.7
      };
    }

    throw new Error('Aucun texte extrait par Gemini');
  } catch (error) {
    console.error('Erreur Gemini OCR:', error);
    throw error;
  }
};

const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      resolve(base64);
    };
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    img.src = imageUrl;
  });
};
