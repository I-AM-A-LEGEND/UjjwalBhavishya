import { useState, useEffect, useRef } from "react";
import { speechService } from "@/lib/speech";

interface UseSpeechOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const supported = speechService.isSupported();
    setIsSupported(supported);

    if (supported) {
      recognitionRef.current = speechService.createRecognition({
        continuous: options.continuous,
        interimResults: options.interimResults,
        language: options.language,
        onResult: (result) => {
          setTranscript(result);
          options.onResult?.(result);
        },
        onError: (error) => {
          setIsListening(false);
          options.onError?.(error);
          console.error("Speech recognition error:", error);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options.continuous, options.interimResults, options.language]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      options.onError?.("Speech recognition not supported");
      return;
    }

    try {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      setIsListening(false);
      options.onError?.("Failed to start speech recognition");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speak = (text: string, language?: string) => {
    speechService.speak(text, language || options.language);
  };

  const stopSpeaking = () => {
    speechService.stopSpeaking();
  };

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript: () => setTranscript("")
  };
}
