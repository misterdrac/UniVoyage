import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

export interface TripSectionDefinition<T extends string = string> {
  id: T
  label: string
  icon: ComponentType<{ className?: string }>
}

interface TripSectionTabsProps<T extends string = string> {
  sections: TripSectionDefinition<T>[]
  activeSection: T
  onSectionChange: (section: T) => void
}

export function TripSectionTabs<T extends string>({
  sections,
  activeSection,
  onSectionChange,
}: TripSectionTabsProps<T>) {
  return (
    <div className="sticky top-[68px] z-40 bg-background/95 backdrop-blur-sm border-b -mt-px">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Trip detail sections">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  'border-b-2 border-transparent shrink-0',
                  isActive
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${section.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                id={`${section.id}-tab`}
              >
                <Icon className="size-3 sm:size-4" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


