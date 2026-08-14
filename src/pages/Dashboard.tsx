import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";

interface Room {
  id: string;
  number: string;
  type: string;
  pricePerNight: number;
  status: string;
}

function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:3000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    }

    fetchRooms();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-6">Hotel Management System</h1>
      <div className="grid grid-cols-3 gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            number={room.number}
            type={room.type}
            pricePerNight={room.pricePerNight}
            status={room.status}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;