import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import messageApiService from "@/services/message";
import ChatWindow from "@/components/messaging/ChatWindow";

export default function DashboardMessages() {
  const { user } = useOutletContext();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageApiService.getRooms()
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

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
              rooms.map((room) => (
                <button
                  key={room.id}
                  className={`w-full text-left p-3 hover:bg-muted transition-colors ${selectedRoom?.id === room.id ? "bg-muted" : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <p className="text-sm font-medium truncate">{room.application?.job?.title || "Conversation"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {room.application?.user?.firstName} {room.application?.user?.lastName}
                  </p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat window */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 h-full">
          <ChatWindow room={selectedRoom} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
