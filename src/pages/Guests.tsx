import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GuestCard from "../components/GuestCard";
import { hasRole } from "../lib/auth";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  isVIP: boolean;
}

const API = import.meta.env.VITE_API_URL;

function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [isVIP, setIsVIP] = useState(false);

  const navigate = useNavigate();

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function fetchGuests() {
    try {
      const response = await axios.get(`${API}/guests`, authHeaders());
      setGuests(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((g) => {
    const term = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(term) ||
      g.email?.toLowerCase().includes(term) ||
      g.phone?.toLowerCase().includes(term)
    );
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    await axios.post(
      `${API}/guests`,
      { name, email, phone, nationality, isVIP },
      authHeaders()
    );

    setName("");
    setEmail("");
    setPhone("");
    setNationality("");
    setIsVIP(false);
    setShowAddGuest(false);
    fetchGuests();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl text-ink">Guests</h1>
        {hasRole("ADMIN", "RECEPTIONIST") && (
          <button
            onClick={() => setShowAddGuest(true)}
            className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary-hover"
          >
            + Add Guest
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search guests by name, email or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-border rounded px-3 py-2 text-sm bg-surface mb-6 w-80"
      />

      <div className="grid grid-cols-3 gap-4">
        {filteredGuests.map((guest) => (
          <Link key={guest.id} to={`/guests/${guest.id}`}>
            <GuestCard
              name={guest.name}
              email={guest.email}
              phone={guest.phone}
              nationality={guest.nationality}
              isVIP={guest.isVIP}
            />
          </Link>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <p className="text-ink-muted text-sm mt-6">No guests match your search.</p>
      )}

      {showAddGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-surface p-6 rounded-lg shadow-lg w-96 border border-border">
            <h2 className="text-lg font-semibold text-ink mb-4">Add New Guest</h2>

            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" />
            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" />
            <input type="text" placeholder="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" />

            <label className="flex items-center gap-2 text-sm text-ink-muted mb-4">
              <input type="checkbox" checked={isVIP} onChange={(e) => setIsVIP(e.target.checked)} />
              VIP Guest
            </label>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddGuest(false)} className="px-4 py-2 text-sm rounded border border-border text-ink-muted hover:bg-background">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover">
                Save Guest
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Guests;