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
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
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
    // Only reset to selected label if there's a selection, otherwise keep what user typed
    if (selected && selected.label) {
      setInputValue(selected.label)
    }
  }, [selected])

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

  // Filter options based on input value
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

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
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-[100] w-full rounded-md border bg-popover shadow-md",
            isOpen && filteredOptions.length > 0 ? "block" : "hidden",
          )}
        >
          <CommandList className="rounded-lg">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {filteredOptions.length > 0 && !isLoading ? (
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
                        {option.location && (
                          <span className="text-xs text-muted-foreground">{option.location}</span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
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