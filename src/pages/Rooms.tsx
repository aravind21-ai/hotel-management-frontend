import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import RoomFormModal from "../components/RoomFormModal";
import { hasRole } from "../lib/auth";

interface Room {
  id: string;
  number: string;
  type: string;
  pricePerNight: number;
  status: string;
  floor: number;
  capacity: number;
}

const API = import.meta.env.VITE_API_URL;
function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("number");

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function fetchRooms() {
    try {
      const response = await axios.get(`${API}/rooms`, authHeaders());
      setRooms(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  const roomTypes = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.type))),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    let result = rooms.filter((r) => r.number.includes(search));

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (typeFilter !== "ALL") {
      result = result.filter((r) => r.type === typeFilter);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "price") return a.pricePerNight - b.pricePerNight;
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });

    return result;
  }, [rooms, search, statusFilter, typeFilter, sortBy]);

  async function handleSave(data: {
    number: string;
    type: string;
    pricePerNight: number;
    floor: number;
    capacity: number;
  }) {
    if (editingRoom) {
      await axios.patch(`${API}/rooms/${editingRoom.id}`, data, authHeaders());
    } else {
      await axios.post(`${API}/rooms`, data, authHeaders());
    }
    setShowForm(false);
    setEditingRoom(undefined);
    fetchRooms();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError("");

    try {
      await axios.delete(`${API}/rooms/${deleteTarget.id}`, authHeaders());
      setDeleteTarget(null);
      fetchRooms();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setDeleteError(err.response.data.error);
      }
    }
  }

  async function handleMarkClean(id: string) {
    await axios.patch(`${API}/rooms/${id}/mark-clean`, {}, authHeaders());
    fetchRooms();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl text-ink">Rooms</h1>
        {hasRole("ADMIN") && (
          <button
            onClick={() => {
              setEditingRoom(undefined);
              setShowForm(true);
            }}
            className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary-hover"
          >
            + Add Room
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-surface"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-surface"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="CLEANING">Cleaning</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-surface"
        >
          <option value="ALL">All Types</option>
          {roomTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-surface"
        >
          <option value="number">Sort: Room Number</option>
          <option value="price">Sort: Price</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <div key={room.id}>
            <RoomCard
              number={room.number}
              type={room.type}
              pricePerNight={room.pricePerNight}
              status={room.status}
            />
            <div className="flex gap-2 mt-2">
              {hasRole("ADMIN") && (
                <>
                  <button
                    onClick={() => {
                      setEditingRoom(room);
                      setShowForm(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(room)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </>
              )}
              {room.status === "CLEANING" && hasRole("ADMIN", "HOUSEKEEPING") && (
                <button onClick={() => handleMarkClean(room.id)} className="text-xs text-accent hover:underline">
                  Mark Clean
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <p className="text-ink-muted text-sm mt-6">No rooms match your filters.</p>
      )}

      {showForm && (
        <RoomFormModal
          initial={editingRoom}
          onClose={() => {
            setShowForm(false);
            setEditingRoom(undefined);
          }}
          onSubmit={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg shadow-lg w-96 border border-border">
            <h2 className="text-lg font-semibold text-ink mb-2">Delete Room {deleteTarget.number}?</h2>
            <p className="text-sm text-ink-muted mb-4">This cannot be undone.</p>

            {deleteError && <p className="text-red-600 text-sm mb-3">{deleteError}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                className="px-4 py-2 text-sm rounded border border-border text-ink-muted hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;