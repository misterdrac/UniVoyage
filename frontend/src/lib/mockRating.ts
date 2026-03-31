/**
 * Temporary mock ratings until backend endpoint is available.
 * Replace getMockRating with a real API call when wiring backend (issue #161).
 */
const mockRatings: Record<number, number> = {};

export function getMockRating(destinationId: number): number {
  if (!mockRatings[destinationId]) {
    mockRatings[destinationId] = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
  }
  return mockRatings[destinationId];
}