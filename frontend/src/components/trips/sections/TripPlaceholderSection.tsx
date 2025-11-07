interface TripPlaceholderSectionProps {
  message: string
}

export function TripPlaceholderSection({ message }: TripPlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}


