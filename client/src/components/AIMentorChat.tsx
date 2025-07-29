import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Expand, Settings, Paperclip, Mic, Send } from "lucide-react";
import { ChatMessage } from "@shared/schema";

interface AIMentorChatProps {
  userId: string;
}

export function AIMentorChat({ userId }: AIMentorChatProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        content,
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "Just now";
    const messageDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="border-b border-neutral-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-secondary to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">AI Career Mentor</h3>
              <p className="text-sm text-neutral-500">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Expand className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-96 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.isAI ? "" : "justify-end"}`}
                >
                  {msg.isAI && (
                    <div className="w-8 h-8 bg-gradient-to-r from-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 max-w-xs lg:max-w-md ${
                      msg.isAI
                        ? "bg-neutral-50 rounded-tl-lg"
                        : "bg-primary text-white rounded-tr-lg"
                    }`}
                  >
                    <p className={`text-sm ${msg.isAI ? "text-neutral-800" : "text-white"}`}>
                      {msg.content}
                    </p>
                    <span
                      className={`text-xs mt-2 block ${
                        msg.isAI ? "text-neutral-500" : "text-blue-200"
                      }`}
                    >
                      {formatTime(msg.createdAt || undefined)}
                    </span>
                  </div>
                  {!msg.isAI && (
                    <img
                      src="https://via.placeholder.com/32"
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl rounded-tl-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div className="border-t border-neutral-100 p-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask your AI mentor anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
