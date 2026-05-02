import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Briefcase, FileText, Loader2, User, Building2 } from "lucide-react";
import messageApiService from "@/services/message";
import { joinRoom, sendMessage, onReceiveMessage, onUserTyping, emitTyping } from "@/services/socket";

export default function ChatWindow({ room, currentUserId, isEmployer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!room?.id) return;
    initialLoad.current = true;
    setPage(1);
    setMessages([]);
    setHasMore(false);
    joinRoom(room.id);

    messageApiService.getMessages(room.id, { page: 1, pageSize: 50 }).then((data) => {
      const items = data.items || [];
      setMessages(items);
      setHasMore(items.length < (data.total || 0));
      // Scroll to bottom on initial load
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 50);
      initialLoad.current = false;
    });

    const unsubMsg = onReceiveMessage((msg) => {
      if (msg.room_id === room.id) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    });
    const unsubTyping = onUserTyping((data) => {
      if (data.user_id !== currentUserId) {
        setTyping(data.is_typing ? data.user_id : null);
      }
    });

    return () => { unsubMsg(); unsubTyping(); };
  }, [room?.id, currentUserId]);

  const loadOlder = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const prevHeight = scrollRef.current?.scrollHeight || 0;
    try {
      const nextPage = page + 1;
      const data = await messageApiService.getMessages(room.id, { page: nextPage, pageSize: 50 });
      const items = data.items || [];
      setMessages((prev) => [...items, ...prev]);
      setPage(nextPage);
      setHasMore(messages.length + items.length < (data.total || 0));
      // Maintain scroll position
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
        }
      });
    } catch {}
    setLoadingMore(false);
  };

  const handleScroll = () => {
    if (scrollRef.current?.scrollTop === 0 && hasMore && !loadingMore) {
      loadOlder();
    }
  };

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

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground text-sm">
        Select a conversation to start messaging
      </div>
    );
  }

  const jobTitle = room.application?.job?.title || "Direct Outreach";
  const jobId = room.application?.job?.id;
  const companyName = room.application?.job?.company_name;
  const applicationId = room.application?.id || room.application_id;

  // Resolve other party info
  let otherName, otherEmail;
  if (isEmployer) {
    if (room.application?.user) {
      otherName = `${room.application.user.first_name || ""} ${room.application.user.last_name || ""}`.trim() || "Candidate";
      otherEmail = room.application.user.email;
    } else if (room.candidate) {
      otherName = `${room.candidate.first_name || ""} ${room.candidate.last_name || ""}`.trim() || "Candidate";
      otherEmail = room.candidate.email;
    } else {
      otherName = "Candidate";
    }
  } else {
    otherName = companyName || "Employer";
    otherEmail = room.application?.job?.company_name ? null : null;
  }

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-3.5 bg-muted/20 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              {isEmployer ? <User className="w-4 h-4 text-accent" /> : <Building2 className="w-4 h-4 text-accent" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-display font-semibold text-foreground truncate">{otherName}</p>
              <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
                <span>{jobTitle}</span>
                {otherEmail && <span>· {otherEmail}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEmployer && room.candidate_id && (
              <Button asChild variant="outline" size="sm" className="h-7 text-[0.65rem] rounded-lg px-2.5">
                <Link to={`/dashboard/cv-search/${room.candidate_id}`}>
                  <FileText className="w-3 h-3 mr-1" /> Profile
                </Link>
              </Button>
            )}
            {jobId && (
              <Button asChild variant="outline" size="sm" className="h-7 text-[0.65rem] rounded-lg px-2.5">
                <Link to={`/jobs/${jobId}`}>
                  <Briefcase className="w-3 h-3 mr-1" /> Job
                </Link>
              </Button>
            )}
            {isEmployer && applicationId && (
              <Button asChild variant="outline" size="sm" className="h-7 text-[0.65rem] rounded-lg px-2.5">
                <Link to={`/dashboard/applications/${applicationId}`}>
                  <FileText className="w-3 h-3 mr-1" /> Application
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
      >
        {hasMore && (
          <div className="text-center pb-2">
            <Button variant="ghost" size="sm" onClick={loadOlder} disabled={loadingMore} className="text-xs text-muted-foreground h-7">
              {loadingMore ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Loading...</> : "Load older messages"}
            </Button>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const time = formatTime(msg.createdAt || msg.created_at);
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${isMe ? "bg-accent text-accent-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                <p className="leading-relaxed">{msg.message}</p>
                {time && (
                  <p className={`text-[0.6rem] mt-0.5 ${isMe ? "text-accent-foreground/50" : "text-muted-foreground/70"}`}>
                    {time}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {typing && <p className="text-xs text-muted-foreground italic pl-1">Typing...</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/40 px-4 py-3 flex gap-2 shrink-0 bg-card">
        <Input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl"
        />
        <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
