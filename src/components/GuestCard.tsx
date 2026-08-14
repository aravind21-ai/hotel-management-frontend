interface GuestCardProps {
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  isVIP: boolean;
}

function GuestCard({ name, email, phone, nationality, isVIP }: GuestCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-stone-200">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-stone-800">{name}</h3>
        {isVIP && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
            VIP
          </span>
        )}
      </div>
      <p className="text-sm text-stone-500">{email}</p>
      <p className="text-sm text-stone-500">{phone}</p>
      <p className="text-sm text-stone-600 mt-1">{nationality}</p>
    </div>
  );
}

export default GuestCard;