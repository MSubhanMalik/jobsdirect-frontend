import React, { useEffect, useState } from "react";
import { useOutletContext, useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Briefcase, Lock } from "lucide-react";
import messageApiService from "@/services/message";
import ChatWindow from "@/components/messaging/ChatWindow";

export default function DashboardMessages() {
  const { user, isEmployer, employer } = useOutletContext();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasProPlan = !isEmployer || employer?.candidate_database_status === "cv_db_pro";

  useEffect(() => {
    if (!hasProPlan) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const candidateId = params.get("candidateId");

    const fetchRooms = async () => {
      try {
        let data = await messageApiService.getRooms();
        
        // If we have a candidateId, ensure a room exists
        if (candidateId) {
          const existing = data.find(r => r.candidateId === candidateId && !r.applicationId);
          if (existing) {
            navigate(`/dashboard/messages/${existing.id}`, { replace: true });
          } else {
            // Create new room
            const newRoom = await messageApiService.createRoom({ candidateId });
            data = [newRoom, ...data];
            navigate(`/dashboard/messages/${newRoom.id}`, { replace: true });
          }
        }

        setRooms(data);
        if (roomId && data.length > 0) {
          const room = data.find(r => r.id === roomId);
          if (room) setSelectedRoom(room);
        }
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [roomId, hasProPlan, window.location.search]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    navigate(`/dashboard/messages/${room.id}`);
  };

  if (!hasProPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Pro Plan Required</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          In-platform messaging with candidates is available on the CV Database Pro plan. Upgrade to start conversations directly with applicants.
        </p>
        <Button asChild>
          <Link to="/dashboard/billing">Upgrade to Pro</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading conversations...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[60vh]">
      {/* Room list */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
            </h2>
          </div>
          <div className="divide-y max-h-[60vh] overflow-y-auto">
            {rooms.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              rooms.map((room) => {
                const jobTitle = room.application?.job?.title || "Direct Outreach";
                const otherParty = isEmployer
                  ? (room.application 
                      ? `${room.application.user?.firstName || "Candidate"} ${room.application.user?.lastName || ""}`.trim()
                      : `${room.candidate?.firstName || "Candidate"} ${room.candidate?.lastName || ""}`.trim())
                  : (room.application?.job?.companyName || "Employer");

                return (
                  <button
                    key={room.id}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors ${selectedRoom?.id === room.id ? "bg-muted border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold truncate pr-2">{jobTitle}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(room.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{otherParty}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat window */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 h-full">
          <ChatWindow room={selectedRoom} currentUserId={user.id} isEmployer={isEmployer} />
        </CardContent>
      </Card>
    </div>
  );
}
