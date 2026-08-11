interface RoomCardProps {
  number: string;
  type: string;
  pricePerNight: number;
  status: string;
}

function RoomCard({ number, type, pricePerNight, status }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-800">Room {number}</h3>
      <p className="text-sm text-stone-500">{type}</p>
      <p className="text-sm text-stone-600 mt-2">€{pricePerNight} / night</p>
      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
        {status}
      </span>
    </div>
  );
}

export default RoomCard;