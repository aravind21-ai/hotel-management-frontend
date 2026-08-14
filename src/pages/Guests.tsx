import { useState, useEffect } from "react";
import axios from "axios";
import GuestCard from "../components/GuestCard";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  isVIP: boolean;
}

function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    async function fetchGuests() {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/api/guests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGuests(response.data);
    }

    fetchGuests();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-6">Guests</h1>
      <div className="grid grid-cols-3 gap-4">
        {guests.map((guest) => (
          <GuestCard
            key={guest.id}
            name={guest.name}
            email={guest.email}
            phone={guest.phone}
            nationality={guest.nationality}
            isVIP={guest.isVIP}
          />
        ))}
      </div>
    </div>
  );
}

export default Guests;