import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import type { Trip } from '@/types/trip'

interface DeleteTripDialogProps {
  open: boolean
  isConfirming: boolean
  trip: Trip | null
  errorMessage: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteTripDialog({
  open,
  isConfirming,
  trip,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border/70 p-0 shadow-xl sm:max-w-md">
        <div className="flex flex-col items-center gap-5 px-6 pt-6 text-center sm:px-8 sm:pt-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="h-6 w-6" />
          </span>
          <DialogHeader className="w-full space-y-3 text-center">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Delete this trip?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {trip
                ? `Removing your trip to ${trip.destinationName} can’t be undone. You’ll lose all related plans and details.`
                : 'Removing this trip can’t be undone. You’ll lose all related plans and details.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {errorMessage ? (
          <div className="px-6 pb-0 sm:px-8">
            <p
              className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 px-6 pb-6 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8 sm:pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
            className="w-full rounded-full sm:w-auto sm:px-6"
          >
            Keep trip
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirming}
            className="w-full gap-2 rounded-full sm:w-auto sm:px-6"
          >
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete trip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

