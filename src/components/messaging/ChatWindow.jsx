import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import messageApiService from "@/services/message";
import { joinRoom, sendMessage, onReceiveMessage, onUserTyping, emitTyping } from "@/services/socket";

export default function ChatWindow({ room, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!room?.id) return;
    joinRoom(room.id);
    messageApiService.getMessages(room.id).then((data) => {
      setMessages(data.items || []);
    });

    const unsubMsg = onReceiveMessage((msg) => {
      if (msg.roomId === room.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    const unsubTyping = onUserTyping((data) => {
      if (data.userId !== currentUserId) {
        setTyping(data.isTyping ? data.userId : null);
      }
    });

    return () => { unsubMsg(); unsubTyping(); };
  }, [room?.id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !room?.id) return;
    sendMessage(room.id, currentUserId, input.trim());
    setInput("");
    emitTyping(room.id, currentUserId, false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(room.id, currentUserId, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emitTyping(room.id, currentUserId, false);
    }, 2000);
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <p className="font-semibold text-sm">{room.application?.job?.title || "Conversation"}</p>
        <p className="text-xs text-muted-foreground">
          {room.application?.user?.firstName} {room.application?.user?.lastName}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {typing && <p className="text-xs text-muted-foreground italic">Typing...</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
