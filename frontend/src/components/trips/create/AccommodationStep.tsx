import { Hotel, MapPin, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AccommodationData {
  accommodationName: string
  accommodationAddress: string
  accommodationPhone: string
}

interface AccommodationStepProps {
  data: AccommodationData
  onChange: (data: AccommodationData) => void
}

export function AccommodationStep({ data, onChange }: AccommodationStepProps) {
  const handleChange = (field: keyof AccommodationData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Where are you staying?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Add your accommodation details now or skip and fill them in later. All fields are optional.
        </p>
      </div>

      <div className="w-full max-w-md space-y-5">
        <div className="space-y-2">
          <Label htmlFor="accommodationName" className="text-sm text-muted-foreground">
            Hotel / Hostel Name
          </Label>
          <div className="relative">
            <Hotel className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="accommodationName"
              type="text"
              value={data.accommodationName}
              onChange={(e) => handleChange('accommodationName', e.target.value)}
              placeholder="e.g. Grand Hotel Budapest"
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accommodationAddress" className="text-sm text-muted-foreground">
            Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="accommodationAddress"
              type="text"
              value={data.accommodationAddress}
              onChange={(e) => handleChange('accommodationAddress', e.target.value)}
              placeholder="e.g. 123 Main Street, City"
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accommodationPhone" className="text-sm text-muted-foreground">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="accommodationPhone"
              type="tel"
              value={data.accommodationPhone}
              onChange={(e) => handleChange('accommodationPhone', e.target.value)}
              placeholder="e.g. +1 234 567 8900"
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground text-center">
            Don't have these details yet? No worries — you can add or update accommodation info from your trip page anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
