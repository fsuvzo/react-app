// src/hooks/useCounter.ts
import { useQuery } from "@tanstack/react-query";

export function useCounter(endpoint: string, staleMs = 55_000) {
    return useQuery({
        queryKey: [endpoint],
        queryFn: async () => {
            const res  = await fetch(endpoint);
            const json = await res.json();
            if (!json.success) throw new Error("API error");
            return json.total as number;
        },
        // ─ auto-refetch cada 60 s (coincide con TTL backend) ─
        refetchInterval: 60_000,
        staleTime: staleMs,        // evita flash de loading
    });
}
