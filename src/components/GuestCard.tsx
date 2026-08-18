interface GuestCardProps {
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  isVIP: boolean;
}

function GuestCard({ name, email, phone, nationality, isVIP }: GuestCardProps) {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-ink">{name}</h3>
        {isVIP && (
          <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent">
            VIP
          </span>
        )}
      </div>
      <p className="text-sm text-ink-muted">{email}</p>
      <p className="text-sm text-ink-muted">{phone}</p>
      <p className="text-sm text-ink mt-1">{nationality}</p>
    </div>
  );
}

export default GuestCard;