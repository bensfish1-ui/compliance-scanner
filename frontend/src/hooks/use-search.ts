import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./use-debounce";

interface SearchResult {
  id: string;
  type: "regulation" | "project" | "audit" | "policy" | "document";
  title: string;
  description: string;
  url: string;
}

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Mock search results
      return [
        { id: "1", type: "regulation", title: "GDPR", description: "General Data Protection Regulation", url: "/regulations/1" },
        { id: "2", type: "project", title: "GDPR Remediation", description: "GDPR compliance project", url: "/projects/1" },
      ];
    },
    enabled: debouncedQuery.length >= 2,
  });
}
