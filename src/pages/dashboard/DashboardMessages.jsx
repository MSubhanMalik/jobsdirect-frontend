import React, { useEffect, useState } from "react";
import { useOutletContext, useParams, useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Briefcase, Lock, ArrowRight, ChevronRight } from "lucide-react";
import messageApiService from "@/services/message";
import ChatWindow from "@/components/messaging/ChatWindow";

export default function DashboardMessages() {
  const { user, isEmployer, employer } = useOutletContext();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const hasProPlan = !isEmployer || employer?.candidate_database_status === "cv_db_pro";
  const candidate_id = searchParams.get("candidateId");

  useEffect(() => {
    if (!hasProPlan) { setLoading(false); return; }
    
    const fetchRooms = async () => {
      try {
        let data = await messageApiService.getRooms();
        if (candidate_id) {
          const existing = data.find(r => r.candidate_id === candidate_id && !r.application_id);
          if (existing) {
            navigate(`/dashboard/messages/${existing.id}`, { replace: true });
          } else {
            const newRoom = await messageApiService.createRoom({ candidateId: candidate_id });
            data = [newRoom, ...data];
            navigate(`/dashboard/messages/${newRoom.id}`, { replace: true });
          }
          // Important: return early if we are redirecting to avoid double-fetching/setting
          return;
        }

        setRooms(data);
        if (roomId && data.length > 0) {
          const room = data.find(r => r.id === roomId);
          if (room) setSelectedRoom(room);
        } else if (!roomId && data.length > 0) {
          // If no roomId but we have rooms, maybe auto-select first? 
          // (Optional, keeping as is for now)
        }
      } catch (err) {
        console.error("[DashboardMessages] Error fetching rooms:", err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [roomId, hasProPlan, candidate_id]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    navigate(`/dashboard/messages/${room.id}`);
  };

  if (!hasProPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Lock className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Pro Plan Required</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          In-platform messaging with candidates is available on the CV Database Pro plan. Upgrade to start conversations directly.
        </p>
        <Link to="/dashboard/billing">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium group">
            Upgrade to Pro
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-24 mb-4" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
        <div className="rounded-xl border border-border/50 bg-card">
          <Skeleton className="h-full min-h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-display font-semibold text-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{rooms.length} conversation{rooms.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
        {/* Room list */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Conversations
            </p>
          </div>
          <div className="divide-y divide-border/30 max-h-[60vh] overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
              </div>
            ) : (
              rooms.map((room) => {
                const jobTitle = room.application?.job?.title || "Direct Outreach";
                const otherParty = isEmployer
                  ? (room.application
                      ? `${room.application.user?.first_name || "Candidate"} ${room.application.user?.last_name || ""}`.trim()
                      : `${room.candidate?.first_name || "Candidate"} ${room.candidate?.last_name || ""}`.trim())
                  : (room.application?.job?.company_name || "Employer");
                const isActive = selectedRoom?.id === room.id;

                return (
                  <button
                    key={room.id}
                    className={`w-full text-left px-4 py-3.5 transition-colors group ${
                      isActive ? "bg-accent/[0.06]" : "hover:bg-muted/40"
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-accent/10" : "bg-muted"
                      }`}>
                        <span className="text-xs font-display font-bold text-muted-foreground">
                          {(otherParty || "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium truncate pr-2 ${isActive ? "text-accent" : "text-foreground"}`}>
                            {jobTitle}
                          </p>
                          <span className="text-[0.6rem] text-muted-foreground shrink-0">
                            {(() => {
                              const d = room.updatedAt || room.updated_at || room.createdAt || room.created_at;
                              return d ? new Date(d).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : "Recently";
                            })()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{otherParty}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <ChatWindow room={selectedRoom} currentUserId={user.id} isEmployer={isEmployer} />
        </div>
      </div>
    </div>
  );
}
