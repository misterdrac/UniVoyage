import { Sparkles } from 'lucide-react'

interface RawItineraryDebugProps {
  raw: string
}

export function RawItineraryDebug({ raw }: RawItineraryDebugProps) {
  let formatted = raw
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    formatted = raw
  }

  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Gemini debug snapshot
      </div>
      <pre className="max-h-[420px] overflow-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word">
        {formatted}
      </pre>
    </div>
  )
}


