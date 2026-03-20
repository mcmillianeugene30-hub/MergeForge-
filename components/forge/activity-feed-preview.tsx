import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Event = {
  id: string;
  event_type: string;
  title: string;
  actor: string | null;
  created_at: string;
};

export function ActivityFeedPreview({ events }: { events: Event[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No synced activity yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">
                {event.actor || "system"} • {formatDistanceToNow(new Date(event.created_at))} ago
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
