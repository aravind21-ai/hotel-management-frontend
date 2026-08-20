import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../components/SearchableSelect";
import { hasRole } from "../lib/auth";

interface Guest {
  id: string;
  name: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  pricePerNight: number;
}

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  updatedAt: string;
  guest: { name: string };
  room: { number: string; type: string };
}

const API = import.meta.env.VITE_API_URL;

const statusStyles: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-primary/10 text-primary",
  CHECKED_OUT: "bg-stone-100 text-stone-500",
  CANCELLED: "bg-red-100 text-red-600",
  NO_SHOW: "bg-red-100 text-red-600",
};

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [guestId, setGuestId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"ALL" | "TODAY" | "UPCOMING" | "CHECKED_IN" | "CANCELLED">("ALL");

  const navigate = useNavigate();

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function fetchAll() {
    try {
      const [resReservations, resGuests, resRooms] = await Promise.all([
        axios.get(`${API}/reservations`, authHeaders()),
        axios.get(`${API}/guests`, authHeaders()),
        axios.get(`${API}/rooms`, authHeaders()),
      ]);
      setReservations(resReservations.data);
      setGuests(resGuests.data);
      setRooms(resRooms.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        `${API}/reservations`,
        { guestId, roomId, checkIn, checkOut },
        authHeaders()
      );
      setGuestId("");
      setRoomId("");
      setCheckIn("");
      setCheckOut("");
      fetchAll();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong");
      }
    }
  }

  async function handleCreateGuest(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/guests`,
        { name: newGuestName, email: newGuestEmail, phone: newGuestPhone },
        authHeaders()
      );

      const createdGuest = response.data;
      setGuests((prev) => [...prev, createdGuest]);
      setGuestId(createdGuest.id);

      setNewGuestName("");
      setNewGuestEmail("");
      setNewGuestPhone("");
      setShowAddGuest(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCheckIn(id: string) {
    await axios.patch(`${API}/reservations/${id}/check-in`, {}, authHeaders());
    fetchAll();
  }

  async function handleCheckOut(id: string) {
    await axios.patch(`${API}/reservations/${id}/check-out`, {}, authHeaders());
    fetchAll();
  }

  async function handleCancel(id: string) {
    await axios.patch(`${API}/reservations/${id}/cancel`, {}, authHeaders());
    fetchAll();
  }

  const selectedGuest = guests.find((g) => g.id === guestId);
  const selectedRoom = rooms.find((r) => r.id === roomId);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.pricePerNight * nights : 0;

  const today = new Date().toDateString();

  const counts = useMemo(() => {
    return {
      ALL: reservations.length,
      TODAY: reservations.filter(
        (r) => new Date(r.checkIn).toDateString() === today || new Date(r.checkOut).toDateString() === today
      ).length,
      UPCOMING: reservations.filter((r) => ["PENDING", "CONFIRMED"].includes(r.status)).length,
      CHECKED_IN: reservations.filter((r) => r.status === "CHECKED_IN").length,
      CANCELLED: reservations.filter((r) => r.status === "CANCELLED").length,
    };
  }, [reservations, today]);

  const filtered = useMemo(() => {
    let result = reservations;

    if (tab === "TODAY") {
      result = result.filter(
        (r) => new Date(r.checkIn).toDateString() === today || new Date(r.checkOut).toDateString() === today
      );
    } else if (tab === "UPCOMING") {
      result = result.filter((r) => ["PENDING", "CONFIRMED"].includes(r.status));
    } else if (tab === "CHECKED_IN") {
      result = result.filter((r) => r.status === "CHECKED_IN");
    } else if (tab === "CANCELLED") {
      result = result.filter((r) => r.status === "CANCELLED");
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.guest.name.toLowerCase().includes(term) ||
          r.room.number.toLowerCase().includes(term)
      );
    }

    return result;
  }, [reservations, tab, search, today]);

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "TODAY", label: "Today" },
    { key: "UPCOMING", label: "Upcoming" },
    { key: "CHECKED_IN", label: "Checked In" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  const canManage = hasRole("ADMIN", "RECEPTIONIST");

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink mb-6">Reservations</h1>

      {canManage && (
        <div className="grid grid-cols-3 gap-6 mb-8 items-start">
          <form onSubmit={handleCreate} className="col-span-2 bg-surface p-4 rounded-lg shadow-sm border border-border">
            <h2 className="text-sm font-semibold text-ink mb-3">New Reservation</h2>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="w-48">
                <label className="block text-xs text-ink-muted mb-1">Guest</label>
                <SearchableSelect
                  options={guests.map((g) => ({ id: g.id, label: g.name }))}
                  value={guestId}
                  onChange={setGuestId}
                  placeholder="Search guest..."
                  onAddNew={() => setShowAddGuest(true)}
                  addNewLabel="Add new guest"
                />
              </div>

              <div className="w-56">
                <label className="block text-xs text-ink-muted mb-1">Room</label>
                <SearchableSelect
                  options={rooms.map((r) => ({
                    id: r.id,
                    label: `Room ${r.number} — ${r.type} (${r.status})`,
                  }))}
                  value={roomId}
                  onChange={setRoomId}
                  placeholder="Search room..."
                />
              </div>

              <div>
                <label className="block text-xs text-ink-muted mb-1">Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border border-border rounded px-2 py-1 text-sm" required />
              </div>

              <div>
                <label className="block text-xs text-ink-muted mb-1">Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border border-border rounded px-2 py-1 text-sm" required />
              </div>

              <button type="submit" className="bg-primary text-white rounded px-4 py-2 text-sm font-medium hover:bg-primary-hover">
                Create Reservation
              </button>
            </div>

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          </form>

          <div className="bg-surface p-4 rounded-lg shadow-sm border border-border">
            <h2 className="text-sm font-semibold text-ink mb-3">Reservation Summary</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Guest</dt>
                <dd className="text-ink">{selectedGuest?.name || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Room</dt>
                <dd className="text-ink">{selectedRoom ? `${selectedRoom.number} — ${selectedRoom.type}` : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Check-in</dt>
                <dd className="text-ink">{checkIn ? formatDate(checkIn) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Check-out</dt>
                <dd className="text-ink">{checkOut ? formatDate(checkOut) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Duration</dt>
                <dd className="text-ink">{nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Rate</dt>
                <dd className="text-ink">{selectedRoom ? `€${selectedRoom.pricePerNight}/night` : "—"}</dd>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-border font-semibold">
                <dt className="text-ink">Estimated Total</dt>
                <dd className="text-primary">{estimatedTotal > 0 ? `€${estimatedTotal}` : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {showAddGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreateGuest} className="bg-surface p-6 rounded-lg shadow-lg w-96 border border-border">
            <h2 className="text-lg font-semibold text-ink mb-4">Add New Guest</h2>
            <input type="text" placeholder="Full name" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" required />
            <input type="email" placeholder="Email" value={newGuestEmail} onChange={(e) => setNewGuestEmail(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" />
            <input type="text" placeholder="Phone" value={newGuestPhone} onChange={(e) => setNewGuestPhone(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-4 text-sm" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddGuest(false)} className="px-4 py-2 text-sm rounded border border-border text-ink-muted hover:bg-background">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover">Save Guest</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          type="text"
          placeholder="Search reservations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-surface"
        />

        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                tab === t.key ? "bg-primary text-white" : "bg-surface text-ink-muted border border-border hover:bg-background"
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const canCheckIn = r.status === "PENDING" || r.status === "CONFIRMED";
          const canCheckOut = r.status === "CHECKED_IN";
          const canCancel = r.status === "PENDING" || r.status === "CONFIRMED";

          return (
            <div key={r.id} className="bg-surface rounded-lg shadow-sm p-4 border border-border">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-ink">{r.guest.name}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[r.status] || "bg-stone-100 text-stone-700"}`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-ink-muted">Room {r.room.number} · {r.room.type}</p>
              <p className="text-sm text-ink-muted">
                {formatDate(r.checkIn)} → {formatDate(r.checkOut)} · {nightsBetween(r.checkIn, r.checkOut)} nights
              </p>

              {canManage && (
                <div className="flex gap-2 mt-3">
                  {canCheckIn && (
                    <button onClick={() => handleCheckIn(r.id)} className="bg-primary text-white text-sm px-3 py-1.5 rounded hover:bg-primary-hover">
                      Check In
                    </button>
                  )}
                  {canCheckOut && (
                    <button onClick={() => handleCheckOut(r.id)} className="bg-accent text-white text-sm px-3 py-1.5 rounded hover:opacity-90">
                      Check Out
                    </button>
                  )}
                  {canCancel && (
                    <button onClick={() => handleCancel(r.id)} className="text-sm px-3 py-1.5 rounded border border-border text-ink-muted hover:bg-background">
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-ink-muted text-sm">No reservations match your filters.</p>
        )}
      </div>
    </div>
  );
}

export default Reservations;