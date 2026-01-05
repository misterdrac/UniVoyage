/**
 * DestinationAutoComplete Component
 * 
 * A configured version of AutoComplete with destination-specific defaults:
 * - maxResults: 8 items
 * - dynamicHeight: true (adjusts height based on item type and banner)
 * - popularOptions: optional popular destinations/countries banner
 * 
 * Used in DestinationPicker for country and destination selection.
 */

import { AutoComplete, type Option } from "@/components/ui/autocomplete"

type DestinationAutoCompleteProps = {
  options: Option[]
  emptyMessage: string
  value?: Option
  onValueChange?: (value: Option) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  popularOptions?: Option[]
  popularLabel?: string
  maxResults?: number
}

export const DestinationAutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  popularOptions,
  popularLabel = "Popular",
  maxResults = 8,
}: DestinationAutoCompleteProps) => {
  return (
    <AutoComplete
      options={options}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      isLoading={isLoading}
      popularOptions={popularOptions}
      popularLabel={popularLabel}
      maxResults={maxResults}
      dynamicHeight={true}
    />
  )
}
