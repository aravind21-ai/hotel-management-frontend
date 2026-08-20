import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  room: { number: string };
}

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  isVIP: boolean;
  reservations: Reservation[];
}

const API = import.meta.env.VITE_API_URL;

function GuestDetail() {
  const { id } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGuest() {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${API}/guests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGuest(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/login");
        }
      }
    }

    fetchGuest();
  }, [id, navigate]);

  if (!guest) {
    return <p className="text-ink-muted">Loading...</p>;
  }

  return (
    <div>
      <Link to="/guests" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to Guests
      </Link>

      <div className="bg-surface rounded-lg shadow-sm p-6 border border-border mb-6">
        <div className="flex justify-between items-start">
          <h1 className="font-serif text-2xl text-ink">{guest.name}</h1>
          {guest.isVIP && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent">VIP</span>
          )}
        </div>
        <p className="text-sm text-ink-muted mt-2">{guest.email}</p>
        <p className="text-sm text-ink-muted">{guest.phone}</p>
        <p className="text-sm text-ink mt-1">{guest.nationality}</p>
      </div>

      <h2 className="text-sm font-semibold text-ink mb-3">
        Reservation History ({guest.reservations.length})
      </h2>

      <div className="space-y-2">
        {guest.reservations.map((r) => (
          <div key={r.id} className="bg-surface rounded-lg shadow-sm p-4 border border-border flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-ink">Room {r.room.number}</p>
              <p className="text-xs text-ink-muted">
                {new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-background text-ink-muted">
              {r.status}
            </span>
          </div>
        ))}

        {guest.reservations.length === 0 && (
          <p className="text-sm text-ink-muted">No reservations yet.</p>
        )}
      </div>
    </div>
  );
}

export default GuestDetail;