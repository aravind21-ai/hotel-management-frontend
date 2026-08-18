import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Room {
  id: string;
  status: string;
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

function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [resRooms, resReservations] = await Promise.all([
          axios.get(`${API}/rooms`, { headers }),
          axios.get(`${API}/reservations`, { headers }),
        ]);
        setRooms(resRooms.data);
        setReservations(resReservations.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    }

    fetchData();
  }, [navigate]);

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const available = rooms.filter((r) => r.status === "AVAILABLE").length;
  const cleaning = rooms.filter((r) => r.status === "CLEANING").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  const today = new Date().toDateString();
  const arrivalsToday = reservations.filter(
    (r) => new Date(r.checkIn).toDateString() === today && r.status !== "CANCELLED"
  );
  const departuresToday = reservations.filter(
    (r) => new Date(r.checkOut).toDateString() === today && r.status === "CHECKED_IN"
  );

  const stats = [
    { label: "Occupancy", value: `${occupancyRate}%` },
    { label: "Rooms Available", value: available },
    { label: "Rooms Occupied", value: occupied },
    { label: "Rooms Cleaning", value: cleaning },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface rounded-lg shadow-sm p-4 border border-border">
            <p className="text-xs text-ink-muted mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
          <h2 className="text-sm font-semibold text-ink mb-3">Today's Arrivals ({arrivalsToday.length})</h2>
          {arrivalsToday.length === 0 && <p className="text-sm text-ink-muted">No arrivals today</p>}
          {arrivalsToday.map((r) => (
            <div key={r.id} className="text-sm text-ink py-1 border-b border-border last:border-0">
              {r.guest.name} — Room {r.room.number}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
          <h2 className="text-sm font-semibold text-ink mb-3">Today's Departures ({departuresToday.length})</h2>
          {departuresToday.length === 0 && <p className="text-sm text-ink-muted">No departures today</p>}
          {departuresToday.map((r) => (
            <div key={r.id} className="text-sm text-ink py-1 border-b border-border last:border-0">
              {r.guest.name} — Room {r.room.number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;