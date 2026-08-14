import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  async function handleCheckIn(id: string) {
    await axios.patch(`${API}/reservations/${id}/check-in`, {}, authHeaders());
    fetchAll();
  }

  async function handleCheckOut(id: string) {
    await axios.patch(`${API}/reservations/${id}/check-out`, {}, authHeaders());
    fetchAll();
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-6">Reservations</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow border border-stone-200 mb-8 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Guest</label>
          <select value={guestId} onChange={(e) => setGuestId(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required>
            <option value="">Select guest</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Room</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required>
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>Room {r.number}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Check-in</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required />
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Check-out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-sm" required />
        </div>

        <button type="submit" className="bg-green-700 text-white rounded px-4 py-2 text-sm font-medium hover:bg-green-800">
          Create Reservation
        </button>

        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
      </form>

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