import { useState, useEffect } from "react";

interface RoomFormModalProps {
  initial?: {
    id: string;
    number: string;
    type: string;
    pricePerNight: number;
    floor: number;
    capacity: number;
  };
  onClose: () => void;
  onSubmit: (data: {
    number: string;
    type: string;
    pricePerNight: number;
    floor: number;
    capacity: number;
  }) => void;
}

function RoomFormModal({ initial, onClose, onSubmit }: RoomFormModalProps) {
  const [number, setNumber] = useState(initial?.number || "");
  const [type, setType] = useState(initial?.type || "Standard");
  const [pricePerNight, setPricePerNight] = useState(initial?.pricePerNight || 0);
  const [floor, setFloor] = useState(initial?.floor || 1);
  const [capacity, setCapacity] = useState(initial?.capacity || 1);

  useEffect(() => {
    if (initial) {
      setNumber(initial.number);
      setType(initial.type);
      setPricePerNight(initial.pricePerNight);
      setFloor(initial.floor);
      setCapacity(initial.capacity);
    }
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ number, type, pricePerNight, floor, capacity });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-lg w-96 border border-border">
        <h2 className="text-lg font-semibold text-ink mb-4">
          {initial ? "Edit Room" : "Add New Room"}
        </h2>

        <label className="block text-xs text-ink-muted mb-1">Room Number</label>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 mb-3 text-sm"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Room Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 mb-3 text-sm"
        >
          <option>Standard</option>
          <option>Deluxe</option>
          <option>Suite</option>
          <option>Presidential Suite</option>
        </select>

        <label className="block text-xs text-ink-muted mb-1">Price per Night (€)</label>
        <input
          type="number"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(Number(e.target.value))}
          className="w-full border border-border rounded px-3 py-2 mb-3 text-sm"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Floor</label>
        <input
          type="number"
          value={floor}
          onChange={(e) => setFloor(Number(e.target.value))}
          className="w-full border border-border rounded px-3 py-2 mb-3 text-sm"
          required
        />

        <label className="block text-xs text-ink-muted mb-1">Capacity</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="w-full border border-border rounded px-3 py-2 mb-4 text-sm"
          required
        />

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border border-border text-ink-muted hover:bg-background">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default RoomFormModal;