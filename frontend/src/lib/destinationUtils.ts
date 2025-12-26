import type { Destination } from '@/data/destinations'

export const DEFAULT_DESTINATION_IMAGE =
  'https://images.unsplash.com/photo-1613744696511-fd64320d6c7b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074'

export const getDestinationImageById = (
  destinationId: number | null | undefined,
  destinationsList: Destination[]
): string => {
  if (destinationId == null) {
    return DEFAULT_DESTINATION_IMAGE
  }

  const destination = destinationsList.find((d) => d.id === destinationId)
  return destination?.imageUrl || DEFAULT_DESTINATION_IMAGE
}


