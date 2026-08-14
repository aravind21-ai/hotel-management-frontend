import { useState, useRef, useEffect } from "react";

interface Option {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  onAddNew,
  addNewLabel,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={isOpen ? query : selected?.label || ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className="border border-stone-300 rounded px-2 py-1 text-sm w-full"
      />

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-stone-200 rounded shadow-lg">
          {filtered.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setQuery("");
                setIsOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-stone-100 cursor-pointer"
            >
              {option.label}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-stone-400">No matches</div>
          )}

          {onAddNew && (
            <div
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              className="px-3 py-2 text-sm text-green-700 font-medium hover:bg-green-50 cursor-pointer border-t border-stone-100"
            >
              + {addNewLabel || "Add new"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;