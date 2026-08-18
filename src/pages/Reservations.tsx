import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchableSelect from "../components/SearchableSelect";

interface Guest {
  id: string;
  name: string;
}

interface Room {
  id: string;
  number: string;
}

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guest: { name: string };
  room: { number: string };
}

const API = "http://localhost:3000/api";

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-6">Reservations</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow border border-stone-200 mb-8 flex flex-wrap gap-3 items-start">
        <div className="w-48">
          <label className="block text-xs text-stone-500 mb-1">Guest</label>
          <SearchableSelect
            options={guests.map((g) => ({ id: g.id, label: g.name }))}
            value={guestId}
            onChange={setGuestId}
            placeholder="Search guest..."
            onAddNew={() => setShowAddGuest(true)}
            addNewLabel="Add new guest"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs text-stone-500 mb-1">Room</label>
          <SearchableSelect
            options={rooms.map((r) => ({ id: r.id, label: `Room ${r.number}` }))}
            value={roomId}
            onChange={setRoomId}
            placeholder="Search room..."
          />
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Check-in</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required />
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Check-out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required />
        </div>

        <button type="submit" className="bg-green-700 text-white rounded px-4 py-2 text-sm font-medium hover:bg-green-800 mt-4">
          Create Reservation
        </button>

        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
      </form>

      {showAddGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreateGuest} className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Add New Guest</h2>

            <input
              type="text"
              placeholder="Full name"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 mb-3 text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newGuestEmail}
              onChange={(e) => setNewGuestEmail(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 mb-3 text-sm"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newGuestPhone}
              onChange={(e) => setNewGuestPhone(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 mb-4 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddGuest(false)}
                className="px-4 py-2 text-sm rounded border border-stone-300 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-green-700 text-white hover:bg-green-800"
              >
                Save Guest
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow p-4 border border-stone-200 flex justify-between items-center">
            <div>
              <p className="font-semibold text-stone-800">{r.guest.name} — Room {r.room.number}</p>
              <p className="text-sm text-stone-500">
                {new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}
              </p>
              <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-700">
                {r.status}
              </span>
            </div>

            <div className="flex gap-2">
              {r.status !== "CHECKED_IN" && r.status !== "CHECKED_OUT" && r.status !== "CANCELLED" && (
                <button onClick={() => handleCheckIn(r.id)} className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700">
                  Check In
                </button>
              )}
              {r.status === "CHECKED_IN" && (
                <button onClick={() => handleCheckOut(r.id)} className="bg-orange-600 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-700">
                  Check Out
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reservations;