import { useState, useEffect, useCallback } from 'react';

interface UseVoiceSearchReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useVoiceSearch(): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Check for browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: any) => {
      const currentTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(currentTranscript);
    };

    recognitionInstance.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.abort();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    setError(null);
    setTranscript('');
    recognition.start();
    setIsListening(true);
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    recognition.stop();
    setIsListening(false);
  }, [recognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}
