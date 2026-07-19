"use client";

import { Trash2 } from "lucide-react";

import { deleteTripAction } from "./actions";

export function DeleteTripButton({ tripId, tripTitle }: Readonly<{ tripId: string; tripTitle: string }>) {
  const action = deleteTripAction.bind(null, tripId);
  return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete ${tripTitle}? This removes its flights and activity permanently.`)) event.preventDefault(); }}><button className="inline-flex items-center gap-2 rounded-lg border border-[#D64545]/40 px-4 py-2.5 text-sm font-medium text-[#C53030] hover:bg-[#FFF5F5]" type="submit"><Trash2 className="size-4" /> Delete trip</button></form>;
}
