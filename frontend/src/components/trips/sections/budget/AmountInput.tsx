import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AmountInputProps {
  id: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

export function AmountInput({
  id,
  value,
  onChange,
  placeholder = '0.00',
  className,
}: AmountInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 text-sm sm:text-base">$</span>
      <Input
        id={id}
        type="number"
        min="0"
        step="1"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={cn(
          'text-sm sm:text-base pl-7 sm:pl-8 pr-16 sm:pr-20',
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
          className
        )}
      />
      <div className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-muted rounded-b-none"
          onClick={() => onChange((value || 0) + 1)}
        >
          <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-muted rounded-t-none"
          onClick={() => onChange(Math.max(0, (value || 0) - 1))}
        >
          <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>
      </div>
    </div>
  )
}

