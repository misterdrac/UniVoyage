import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

const STALE_MS = 30 * 60 * 1000;

/**
 * Cached reference data for signup, profile pickers, and admin destination form.
 */
export function useReferenceDictionaries() {
  return useQuery({
    queryKey: ["reference", "dictionaries"],
    queryFn: async () => {
      const [hobbies, languages, countries] = await Promise.all([
        apiService.getReferenceHobbies(),
        apiService.getReferenceLanguages(),
        apiService.getReferenceCountries(),
      ]);
      return { hobbies, languages, countries };
    },
    staleTime: STALE_MS,
  });
}
