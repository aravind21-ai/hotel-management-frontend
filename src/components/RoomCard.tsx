interface RoomCardProps {
  number: string;
  type: string;
  pricePerNight: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-primary/10 text-primary",
  OCCUPIED: "bg-accent/15 text-accent",
  CLEANING: "bg-orange-100 text-orange-700",
  MAINTENANCE: "bg-red-100 text-red-700",
  RESERVED: "bg-blue-100 text-blue-700",
  OUT_OF_SERVICE: "bg-stone-200 text-stone-600",
};

function RoomCard({ number, type, pricePerNight, status }: RoomCardProps) {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
      <h3 className="text-lg font-semibold text-ink">Room {number}</h3>
      <p className="text-sm text-ink-muted">{type}</p>
      <p className="text-sm text-ink mt-2">€{pricePerNight} / night</p>
      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${statusStyles[status] || "bg-stone-100 text-stone-700"}`}>
        {status}
      </span>
    </div>
  );
}

export default RoomCard;