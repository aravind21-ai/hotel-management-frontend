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
  updatedAt: string;
  guest: { name: string };
  room: { number: string };
}

const API = import.meta.env.VITE_API_URL;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const activityLabel: Record<string, (r: Reservation) => string> = {
  PENDING: (r) => `Reservation created for ${r.guest.name}`,
  CONFIRMED: (r) => `Reservation confirmed for ${r.guest.name}`,
  CHECKED_IN: (r) => `${r.guest.name} checked in to Room ${r.room.number}`,
  CHECKED_OUT: (r) => `${r.guest.name} checked out of Room ${r.room.number}`,
  CANCELLED: (r) => `Reservation cancelled for ${r.guest.name}`,
  NO_SHOW: (r) => `${r.guest.name} marked as no-show`,
};

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
  const tomorrow = new Date(Date.now() + 86400000).toDateString();

  const arrivalsToday = reservations.filter(
    (r) => new Date(r.checkIn).toDateString() === today && r.status !== "CANCELLED"
  );
  const arrivalsTomorrow = reservations.filter(
    (r) => new Date(r.checkIn).toDateString() === tomorrow && r.status !== "CANCELLED"
  );
  const departuresToday = reservations.filter(
    (r) => new Date(r.checkOut).toDateString() === today && r.status === "CHECKED_IN"
  );

  const recentActivity = [...reservations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const stats = [
    { label: "Total Rooms", value: totalRooms },
    { label: "Occupancy", value: `${occupancyRate}%` },
    { label: "Available", value: available },
    { label: "Cleaning", value: cleaning },
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
          <h2 className="text-sm font-semibold text-ink mb-3">Upcoming Arrivals</h2>

          <p className="text-xs text-ink-muted mb-1">Today</p>
          {arrivalsToday.length === 0 && <p className="text-sm text-ink-muted mb-3">None</p>}
          {arrivalsToday.map((r) => (
            <div key={r.id} className="text-sm text-ink py-1 border-b border-border last:border-0">
              {r.guest.name} — Room {r.room.number}
            </div>
          ))}

          <p className="text-xs text-ink-muted mt-3 mb-1">Tomorrow</p>
          {arrivalsTomorrow.length === 0 && <p className="text-sm text-ink-muted">None</p>}
          {arrivalsTomorrow.map((r) => (
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

        <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
          <h2 className="text-sm font-semibold text-ink mb-3">Recent Activity</h2>
          {recentActivity.map((r) => (
            <div key={r.id} className="text-sm text-ink py-1.5 border-b border-border last:border-0 flex justify-between gap-2">
              <span>{activityLabel[r.status]?.(r) || `${r.guest.name} — ${r.status}`}</span>
              <span className="text-xs text-ink-muted whitespace-nowrap">{timeAgo(r.updatedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;