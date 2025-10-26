import React, { useState, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Option } from "./autocomplete"

interface ChipSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ChipSelect({
  options,
  value,
  onChange,
  placeholder = "Type to search...",
  disabled = false,
  className,
}: ChipSelectProps) {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter out already selected options
  const availableOptions = options.filter(
    (opt) => !value.includes(opt.value)
  )

  // Filter options based on search
  const filteredOptions = availableOptions.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (option: Option) => {
    if (!value.includes(option.value)) {
      onChange([...value, option.value])
    }
    setInputValue("")
    // Keep dropdown open and input focused for continuous selection
    setTimeout(() => {
      setIsOpen(true)
      inputRef.current?.focus()
    }, 0)
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault()
      // Try to find matching option or add as custom value
      const exactMatch = filteredOptions.find(
        (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
      )
      if (exactMatch) {
        handleSelect(exactMatch)
      } else {
        // Allow adding custom values if not in options
        const newValue = inputValue.trim()
        if (!value.includes(newValue)) {
          onChange([...value, newValue])
          setInputValue("")
        }
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last chip when backspace is pressed on empty input
      handleRemove(value[value.length - 1])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 min-h-10 p-2 border border-input rounded-md bg-background">
        {value.map((val) => {
          const option = options.find((opt) => opt.value === val)
          const label = option?.label || val
          return (
            <div
              key={val}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md"
            >
              <span>{label}</span>
              <button
                type="button"
                onClick={() => handleRemove(val)}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Clear input and close dropdown
            setTimeout(() => {
              setIsOpen(false)
              setInputValue("")
            }, 200)
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && filteredOptions.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95 max-h-[200px] overflow-y-auto">
            <div className="p-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(option)
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

