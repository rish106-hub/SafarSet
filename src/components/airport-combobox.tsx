"use client";

import { Check, MapPin, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { airportDisplayCity, airports, type Airport } from "@/data/airports";

function searchAirports(query: string): readonly Airport[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return airports.slice(0, 8);
  return airports.filter((airport) =>
    airport.code.toLowerCase().startsWith(normalized)
    || airport.city.toLowerCase().includes(normalized)
    || airport.name.toLowerCase().includes(normalized)
    || airport.keywords.toLowerCase().includes(normalized)
    || airport.country.toLowerCase() === normalized,
  ).slice(0, 8);
}

export function AirportCombobox({
  label,
  name,
  value,
  onChange,
  placeholder = "Search city or airport",
}: Readonly<{
  label: string;
  name?: string;
  value: string;
  onChange: (airport: Airport) => void;
  placeholder?: string;
}>) {
  const id = useId();
  const selected = airports.find((airport) => airport.code === value) ?? null;
  const [query, setQuery] = useState(selected ? `${airportDisplayCity(selected)} (${selected.code})` : "");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchAirports(query), [query]);
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[#334E68]" htmlFor={id}>{label}</label>
      {name && <input name={name} type="hidden" value={value} />}
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#829AB1]" />
        <input
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-expanded={open}
          autoComplete="off"
          className="field mt-0 pl-10"
          id={id}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          role="combobox"
          value={query}
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-[#BCCCDC] bg-white p-1.5 shadow-[0_20px_45px_rgba(16,42,67,0.16)]" id={`${id}-listbox`} role="listbox">
          {results.length === 0 ? <p className="px-3 py-4 text-sm text-[#627D98]">No airport found. Try a nearby city.</p> : results.map((airport) => (
            <button
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#F0F4F8] focus:bg-[#F0F4F8] focus:outline-none"
              key={airport.code}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(airport); setQuery(`${airportDisplayCity(airport)} (${airport.code})`); setOpen(false); }}
              aria-selected={value === airport.code}
              role="option"
              type="button"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#147D92]" />
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#102A43]">{airportDisplayCity(airport)} <span className="font-mono text-xs text-[#147D92]">{airport.code}</span></span><span className="block truncate text-xs text-[#627D98]">{airport.name} · {airport.country}</span></span>
              {value === airport.code && <Check className="mt-1 size-4 text-[#147D92]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
