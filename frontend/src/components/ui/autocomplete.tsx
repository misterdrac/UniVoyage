/**
 * AutoComplete Component
 * 
 * A flexible autocomplete component with support for:
 * - Basic filtering and search
 * - Popular options display (optional)
 * - Result limiting (optional)
 * - Dynamic height calculation (optional)
 * 
 * @see DestinationAutoComplete for a configured version with destination-specific defaults
 * 
 * Optional Future Optimizations (see inline comments):
 * - Consider useMemo for filtering if performance issues arise with large datasets (1000+ items)
 * - Consider useMemo for dynamic height calculation if virtual scrolling is added
 */

import {
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import React, { useState, useRef, useCallback, type KeyboardEvent } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type Option = Record<"value" | "label", string> & Record<string, string>

type AutoCompleteProps = {
  options: Option[]
  emptyMessage: string
  value?: Option
  onValueChange?: (value: Option) => void
  onBlur?: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  popularOptions?: Option[]
  popularLabel?: string
  maxResults?: number
  dynamicHeight?: boolean
}

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  onBlur,
  disabled,
  isLoading = false,
  popularOptions,
  popularLabel = "Popular",
  maxResults,
  dynamicHeight = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState<Option | undefined>(value)
  const [inputValue, setInputValue] = useState<string>(value?.label || "")

  // Update when external value changes
  React.useEffect(() => {
    if (value !== selected) {
      setSelected(value)
      setInputValue(value?.label || "")
    }
  }, [value, selected])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true)
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && inputValue !== "") {
        const optionToSelect = options.find(
          (option) => option.label === inputValue,
        )
        if (optionToSelect) {
          setSelected(optionToSelect)
          onValueChange?.(optionToSelect)
          setInputValue(optionToSelect.label)
        }
      }

      if (event.key === "Escape") {
        inputRef.current?.blur()
      }
    },
    [isOpen, options, onValueChange, inputValue],
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
    // Only reset to selected label if there's a selection, otherwise clear invalid input
    if (selected && selected.label) {
      setInputValue(selected.label)
    } else {
      // Clear invalid input if no valid selection
      setInputValue('')
      setSelected(undefined)
    }
    onBlur?.()
  }, [selected, onBlur])

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label)

      setSelected(selectedOption)
      onValueChange?.(selectedOption)

   
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange],
  )


  const isEmpty = !inputValue || inputValue.trim() === ''
  
  // Filter options based on input value
  const filteredOptions = (() => {
    // If input is empty and popular options are provided, show popular options
    if (isEmpty && popularOptions && popularOptions.length > 0) {
      const results = maxResults ? popularOptions.slice(0, maxResults) : popularOptions
      return results
    }
    
    // Otherwise, filter based on input value
    const filtered = options
      .filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact matches, then starts with, then contains
        const aLower = a.label.toLowerCase()
        const bLower = b.label.toLowerCase()
        const inputLower = inputValue.toLowerCase()
        
        if (aLower === inputLower && bLower !== inputLower) return -1
        if (bLower === inputLower && aLower !== inputLower) return 1
        if (aLower.startsWith(inputLower) && !bLower.startsWith(inputLower)) return -1
        if (bLower.startsWith(inputLower) && !aLower.startsWith(inputLower)) return 1
        return 0
      })
    
    return maxResults ? filtered.slice(0, maxResults) : filtered
  })()
  
  // Check if we're showing popular options
  const isShowingPopular = isEmpty && popularOptions && popularOptions.length > 0
  

  let listClassName = "rounded-lg max-h-[300px] overflow-y-auto overflow-x-hidden"
  let calculatedHeight = 300
  if (dynamicHeight) {
    const hasMultiLineItems = filteredOptions.some(opt => opt.location && opt.location !== opt.label)
    const itemHeight = hasMultiLineItems ? 56 : 36
    const bannerHeight = isShowingPopular ? 40 : 0
    const totalHeight = filteredOptions.length * itemHeight + bannerHeight
    const maxHeightFor10Items = 10 * itemHeight + bannerHeight
    calculatedHeight = Math.min(totalHeight, Math.min(maxHeightFor10Items, 500))
    listClassName = `rounded-lg overflow-y-auto overflow-x-hidden`
  }

  return (
    <CommandPrimitive>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(isLoading ? inputValue : e.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10"
        />
      </div>
      <div className="relative mt-1">
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-9999 w-full rounded-md border bg-popover shadow-md",
            isOpen && filteredOptions.length > 0 ? "block" : "hidden",
          )}
        >
          <CommandList className={listClassName} style={dynamicHeight ? { maxHeight: `${calculatedHeight}px` } : undefined}>
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {filteredOptions.length > 0 && !isLoading ? (
              <>
                {isShowingPopular && (
                  <div className="px-3 py-2 text-sm font-semibold text-muted-foreground border-b border-border">
                    {popularLabel}
                  </div>
                )}
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = selected?.value === option.value
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          "flex w-full items-center gap-2",
                          !isSelected ? "pl-8" : null,
                        )}
                      >
                        {isSelected ? <Check className="w-4" /> : null}
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          {option.location && option.location !== option.label && (
                            <span className="text-xs text-muted-foreground">{option.location}</span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            ) : null}
            {!isLoading && filteredOptions.length === 0 && (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                {emptyMessage}
              </CommandPrimitive.Empty>
            )}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}