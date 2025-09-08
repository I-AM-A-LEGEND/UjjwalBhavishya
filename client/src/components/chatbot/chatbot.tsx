import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "./language-selector";
import { MessageCircle, X, Send, Mic, MicOff, Volume2 } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSpeech } from "@/hooks/use-speech";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatConversation {
  id: string;
  sessionId: string;
  language: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isListening, startListening, stopListening, transcript } = useSpeech();
  const { isConnected } = useWebSocket();

  // Create conversation when chatbot opens
  const createConversationMutation = useMutation({
    mutationFn: async (data: { sessionId: string; language: string; userId?: string }) => {
      const response = await apiRequest("POST", "/api/chat/conversation", data);
      return response.json();
    },
    onSuccess: (data) => {
      setConversation(data);
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: language === "hi" 
          ? "नमस्ते! मैं सरकारबॉट हूं। मैं आपको सरकारी योजनाओं के बारे में जानकारी देने में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?"
          : "Hello! I'm SarkarBot. I can help you find government schemes in English, Hindi, or your regional language. How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; role: string; content: string }) => {
      const response = await apiRequest("POST", "/api/chat/message", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Add both user message and AI response
      const userMessage: ChatMessage = {
        id: data.userMessage.id,
        role: "user",
        content: data.userMessage.content,
        timestamp: new Date(data.userMessage.timestamp)
      };
      
      const aiMessage: ChatMessage = {
        id: data.aiMessage.id,
        role: "assistant",
        content: data.aiMessage.content,
        timestamp: new Date(data.aiMessage.timestamp)
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Speak AI response if speech is enabled
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.aiMessage.content);
        utterance.lang = language === "hi" ? "hi-IN" : "en-US";
        speechSynthesis.speak(utterance);
      }
    }
  });

  // Handle opening chatbot
  const handleOpen = () => {
    setIsOpen(true);
    if (!conversation) {
      const sessionId = `session-${Date.now()}`;
      createConversationMutation.mutate({
        sessionId,
        language,
        userId: undefined // TODO: Add actual user ID when authenticated
      });
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim() || !conversation) return;
    
    const messageContent = message.trim();
    setMessage("");
    
    sendMessageMutation.mutate({
      conversationId: conversation.id,
      role: "user",
      content: messageContent
    });
  };

  // Handle voice input
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Update message when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 max-h-96 mb-4 shadow-xl border border-border">
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">SarkarBot</span>
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-primary-foreground/20 text-primary-foreground"
                >
                  {isConnected ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector onSelect={setLanguage} currentLanguage={language} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-chatbot"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="p-4 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`chat-message-${msg.role}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex space-x-2">
              <Input
                placeholder={language === "hi" ? "अपना प्रश्न टाइप करें..." : "Type your question..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
                disabled={!conversation}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleVoiceToggle}
                className={isListening ? "bg-red-100 border-red-300" : ""}
                disabled={!conversation}
                data-testid="button-voice-input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim() || !conversation || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {isListening && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <Volume2 className="h-3 w-3 mr-1" />
                {language === "hi" ? "सुन रहा हूं..." : "Listening..."}
              </p>
            )}
          </div>
        </Card>
      )}
      
      {/* Toggle Button */}
      <Button
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        data-testid="button-toggle-chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
