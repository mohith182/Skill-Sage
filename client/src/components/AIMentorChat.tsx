
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Expand, 
  Settings, 
  Paperclip, 
  Mic, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Palette,
  Upload,
  FileText,
  MicOff
} from "lucide-react";
import { ChatMessage } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIMentorChatProps {
  userId: string;
}

interface ChatSession {
  id: string;
  name: string;
  createdAt: string;
  messageCount: number;
}

export function AIMentorChat({ userId }: AIMentorChatProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>("default");
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatTheme, setChatTheme] = useState<"light" | "dark" | "gradient">("gradient");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId, currentSession],
  });

  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions", userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        content,
        sessionId: currentSession,
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
      if (soundEnabled) {
        // Play send sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBDeDzPTOgTkKJ2u87Nqc');
        audio.play().catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId, currentSession] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", userId] });
      setMessage("");
      setIsTyping(false);
      if (soundEnabled) {
        // Play receive sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBDeDzPTOgTkKJ2u87Nqc');
        audio.play().catch(() => {});
      }
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const createNewChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/sessions", {
        userId,
        name: `Chat ${chatSessions.length + 1}`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSession(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", userId] });
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/chat/sessions/${sessionId}`, {});
    },
    onSuccess: () => {
      if (currentSession === arguments[0]) {
        setCurrentSession("default");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', userId);
      
      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId, currentSession] });
      setIsUploading(false);
      if (soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBDeDzPTOgTkKJ2u87Nqc');
        audio.play().catch(() => {});
      }
    },
    onError: () => {
      setIsUploading(false);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ content: message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate(file);
    }
  };

  const toggleSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "Just now";
    const messageDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getThemeClasses = () => {
    switch (chatTheme) {
      case "dark":
        return "bg-gray-900 text-white border-gray-700";
      case "light":
        return "bg-white text-gray-900 border-neutral-100";
      case "gradient":
        return "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 border-neutral-100";
      default:
        return "bg-white text-gray-900 border-neutral-100";
    }
  };

  const currentSessionName = chatSessions.find(s => s.id === currentSession)?.name || "Default Chat";

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-500 ${
      isExpanded ? "fixed inset-4 z-50" : "relative"
    } ${getThemeClasses()}`}>
      {/* Header */}
      <div className={`border-b p-6 ${chatTheme === "dark" ? "border-gray-700" : "border-neutral-100"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r from-secondary to-purple-600 rounded-xl flex items-center justify-center ${
              animationsEnabled ? "hover:scale-110" : ""
            } transition-all duration-300`}>
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Career Mentor</h3>
              <p className={`text-sm ${chatTheme === "dark" ? "text-gray-400" : "text-neutral-500"}`}>
                {currentSessionName} • Online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Chat Sessions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2">
                  <Button
                    onClick={() => createNewChatMutation.mutate()}
                    className="w-full justify-start mb-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {chatSessions.map((session) => (
                  <div key={session.id} className="flex items-center group">
                    <DropdownMenuItem
                      onClick={() => setCurrentSession(session.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.messageCount} messages
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatMutation.mutate(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:scale-105 transition-transform"
            >
              <Expand className="h-4 w-4" />
            </Button>
            
            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" aria-describedby="settings-description">
                <DialogHeader>
                  <DialogTitle>Chat Settings</DialogTitle>
                  <p id="settings-description" className="text-sm text-muted-foreground">
                    Customize your AI mentor chat experience with themes, sounds, and animations.
                  </p>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound">Sound Effects</Label>
                      <div className="flex items-center space-x-2">
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        <Switch
                          id="sound"
                          checked={soundEnabled}
                          onCheckedChange={setSoundEnabled}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scroll">Auto Scroll</Label>
                      <Switch
                        id="scroll"
                        checked={autoScroll}
                        onCheckedChange={setAutoScroll}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">3D Animations</Label>
                      <Switch
                        id="animations"
                        checked={animationsEnabled}
                        onCheckedChange={setAnimationsEnabled}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={chatTheme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatTheme("light")}
                        className="flex items-center space-x-1"
                      >
                        <Sun className="h-3 w-3" />
                        <span>Light</span>
                      </Button>
                      <Button
                        variant={chatTheme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatTheme("dark")}
                        className="flex items-center space-x-1"
                      >
                        <Moon className="h-3 w-3" />
                        <span>Dark</span>
                      </Button>
                      <Button
                        variant={chatTheme === "gradient" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatTheme("gradient")}
                        className="flex items-center space-x-1"
                      >
                        <Palette className="h-3 w-3" />
                        <span>Gradient</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className={`${isExpanded ? "h-[calc(100vh-200px)]" : "h-96"} flex flex-col`}>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.isAI ? "" : "justify-end"} ${
                    animationsEnabled ? "animate-in slide-in-from-bottom-2 duration-300" : ""
                  }`}
                  style={{ animationDelay: animationsEnabled ? `${index * 50}ms` : "0ms" }}
                >
                  {msg.isAI && (
                    <div className={`w-8 h-8 bg-gradient-to-r from-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ${
                      animationsEnabled ? "hover:rotate-[360deg] transition-transform duration-700" : ""
                    }`}>
                      <Sparkles className="text-white text-xs" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 max-w-xs lg:max-w-md transition-all duration-200 ${
                      animationsEnabled ? "hover:scale-[1.02] hover:shadow-lg" : ""
                    } ${
                      msg.isAI
                        ? chatTheme === "dark" 
                          ? "bg-gray-800 rounded-tl-lg" 
                          : "bg-neutral-50 rounded-tl-lg"
                        : "bg-primary text-white rounded-tr-lg shadow-md"
                    }`}
                  >
                    <p className={`text-sm ${
                      msg.isAI 
                        ? chatTheme === "dark" ? "text-gray-100" : "text-neutral-800" 
                        : "text-white"
                    }`}>
                      {msg.content}
                    </p>
                    <span
                      className={`text-xs mt-2 block ${
                        msg.isAI 
                          ? chatTheme === "dark" ? "text-gray-400" : "text-neutral-500"
                          : "text-blue-200"
                      }`}
                    >
                      {formatTime(msg.createdAt || undefined)}
                    </span>
                  </div>
                  {!msg.isAI && (
                    <div className={`w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 ${
                      animationsEnabled ? "hover:rotate-[360deg] transition-transform duration-700" : ""
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className={`flex items-start space-x-3 ${
                  animationsEnabled ? "animate-in slide-in-from-bottom-2 duration-300" : ""
                }`}>
                  <div className={`w-8 h-8 bg-gradient-to-r from-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ${
                    animationsEnabled ? "animate-pulse" : ""
                  }`}>
                    <Sparkles className="text-white text-xs" />
                  </div>
                  <div className={`${
                    chatTheme === "dark" ? "bg-gray-800" : "bg-neutral-50"
                  } rounded-2xl rounded-tl-lg p-4`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${
                        chatTheme === "dark" ? "bg-gray-400" : "bg-neutral-400"
                      } rounded-full animate-pulse`}></div>
                      <div className={`w-2 h-2 ${
                        chatTheme === "dark" ? "bg-gray-400" : "bg-neutral-400"
                      } rounded-full animate-pulse`} style={{ animationDelay: "0.2s" }}></div>
                      <div className={`w-2 h-2 ${
                        chatTheme === "dark" ? "bg-gray-400" : "bg-neutral-400"
                      } rounded-full animate-pulse`} style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input */}
        <div className={`border-t p-6 ${chatTheme === "dark" ? "border-gray-700" : "border-neutral-100"}`}>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:scale-105 transition-transform relative"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask your AI mentor anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`pr-12 ${animationsEnabled ? "focus:scale-[1.02] transition-transform" : ""} ${
                  chatTheme === "dark" ? "bg-gray-800 border-gray-600 text-white" : ""
                }`}
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-105 transition-transform ${
                  isListening ? "text-red-500 animate-pulse" : ""
                }`}
                onClick={toggleSpeechRecognition}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className={`${animationsEnabled ? "hover:scale-105 active:scale-95" : ""} transition-all duration-150 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90`}
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Upload status */}
          {isUploading && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
              <Upload className="h-4 w-4 animate-bounce" />
              <span>Analyzing document...</span>
            </div>
          )}
          
          {/* File upload info */}
          <div className="mt-2 text-xs text-muted-foreground">
            💡 Upload PDF, DOC, DOCX, or TXT files for career analysis | Use microphone for speech-to-text
          </div>
        </div>
      </div>
    </div>
  );
}
