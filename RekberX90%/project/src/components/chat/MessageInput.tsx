import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  selectedImage,
  setSelectedImage,
  isUploading,
  onSubmit,
  onTyping
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (onTyping) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear typing indicator immediately on send
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    
    onSubmit(e);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping && onTyping) {
        onTyping(false);
      }
    };
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        {selectedImage && (
          <div className="mb-2">
            <ImageUpload
              onImageSelect={setSelectedImage}
              onImageRemove={() => setSelectedImage(null)}
              selectedImage={selectedImage}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-shrink-0">
            <ImageUpload
              onImageSelect={setSelectedImage}
              onImageRemove={() => setSelectedImage(null)}
              selectedImage={null}
              disabled={isUploading}
            />
          </div>
          
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isUploading}
            />
          </div>
          
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={(!message.trim() && !selectedImage) || isUploading}
              className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;