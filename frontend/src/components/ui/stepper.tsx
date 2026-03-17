import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { CheckIcon, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'

// <---------- CONTEXT ---------->

interface StepperContextValue extends StepperProps {
  clickable?: boolean
  isError?: boolean
  isLoading?: boolean
  isVertical?: boolean
  stepCount?: number
  expandVerticalSteps?: boolean
  activeStep: number
  initialStep: number
}

const StepperContext = React.createContext<
  StepperContextValue & {
    nextStep: () => void
    prevStep: () => void
    resetSteps: () => void
    setStep: (step: number) => void
  }
>({
  steps: [],
  activeStep: 0,
  initialStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  resetSteps: () => {},
  setStep: () => {},
})

interface StepperContextProviderProps {
  value: Omit<StepperContextValue, 'activeStep'>
  children: React.ReactNode
}

function StepperProvider({ value, children }: StepperContextProviderProps) {
  const isError = value.state === 'error'
  const isLoading = value.state === 'loading'

  const [activeStep, setActiveStep] = React.useState(value.initialStep)

  const nextStep = () => {
    setActiveStep(prev => prev + 1)
  }

  const prevStep = () => {
    setActiveStep(prev => prev - 1)
  }

  const resetSteps = () => {
    setActiveStep(value.initialStep)
  }

  const setStep = (step: number) => {
    setActiveStep(step)
  }

  return (
    <StepperContext.Provider
      value={{
        ...value,
        isError,
        isLoading,
        activeStep,
        nextStep,
        prevStep,
        resetSteps,
        setStep,
      }}
    >
      {children}
    </StepperContext.Provider>
  )
}

// <---------- HOOKS ---------->

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>()

  React.useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

function useStepper() {
  const context = React.useContext(StepperContext)

  if (context === undefined)
    throw new Error('useStepper must be used within a StepperProvider')

  const { children: _children, className: _className, ...rest } = context

  const isLastStep = context.activeStep === context.steps.length - 1
  const hasCompletedAllSteps = context.activeStep === context.steps.length

  const previousActiveStep = usePrevious(context.activeStep)

  const currentStep = context.steps[context.activeStep]
  const isOptionalStep = !!currentStep?.optional

  const isDisabledStep = context.activeStep === 0

  return {
    ...rest,
    isLastStep,
    hasCompletedAllSteps,
    isOptionalStep,
    isDisabledStep,
    currentStep,
    previousActiveStep,
  }
}

function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

// <---------- TYPES ---------->

type IconType = LucideIcon | React.ComponentType<unknown> | undefined

interface StepItem {
  id?: string
  label?: string
  description?: string
  icon?: IconType
  optional?: boolean
}

interface StepOptions {
  orientation?: 'vertical' | 'horizontal'
  state?: 'loading' | 'error'
  responsive?: boolean
  checkIcon?: IconType
  errorIcon?: IconType
  onClickStep?: (
    step: number,
    setStep: (step: number) => void,
    activeStep: number
  ) => void
  mobileBreakpoint?: string
  variant?: 'circle' | 'circle-alt' | 'line'
  expandVerticalSteps?: boolean
  size?: 'sm' | 'md' | 'lg'
  styles?: {
    'main-container'?: string
    'horizontal-step'?: string
    'horizontal-step-container'?: string
    'vertical-step'?: string
    'vertical-step-container'?: string
    'vertical-step-content'?: string
    'step-button-container'?: string
    'step-label-container'?: string
    'step-label'?: string
    'step-description'?: string
  }
  variables?: {
    '--step-icon-size'?: string
    '--step-gap'?: string
  }
  scrollTracking?: boolean
}

interface StepperProps extends StepOptions {
  children?: React.ReactNode
  className?: string
  initialStep: number
  steps: StepItem[]
}

const VARIABLE_SIZES = {
  sm: '36px',
  md: '40px',
  lg: '44px',
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const {
      className,
      children,
      orientation: orientationProp,
      state,
      responsive,
      checkIcon,
      errorIcon,
      onClickStep,
      mobileBreakpoint,
      expandVerticalSteps = false,
      initialStep = 0,
      size,
      steps,
      variant,
      styles,
      variables,
      scrollTracking = false,
      ...rest
    } = props

    const childArr = React.Children.toArray(children)

    const items = [] as React.ReactElement[]

    const footer = childArr.map((child) => {
      if (!React.isValidElement(child))
        throw new Error('Stepper children must be valid React elements.')

      if (child.type === Step) {
        items.push(child)
        return null
      }

      return child
    })

    const stepCount = items.length

    const isMobile = useMediaQuery(
      `(max-width: ${mobileBreakpoint || '768px'})`,
    )

    const clickable = !!onClickStep

    const orientation = isMobile && responsive ? 'vertical' : orientationProp

    const isVertical = orientation === 'vertical'

    return (
      <StepperProvider
        value={{
          initialStep,
          orientation,
          state,
          size,
          responsive,
          checkIcon,
          errorIcon,
          onClickStep,
          clickable,
          isVertical,
          variant: variant || 'circle',
          expandVerticalSteps,
          steps,
          stepCount,
          styles,
          variables,
          scrollTracking,
          children,
          className,
        }}
      >
        <div
          ref={ref}
          className={cn(
            'flex w-full flex-1 justify-between gap-4 text-center',
            isVertical ? 'flex-col' : 'flex-row',
            variant === 'line' && 'gap-0',
            styles?.['main-container'],
            className,
          )}
          style={
            {
              '--step-icon-size':
                variables?.['--step-icon-size']
                || `${VARIABLE_SIZES[size || 'md']}`,
              '--step-gap': variables?.['--step-gap'] || '8px',
            } as React.CSSProperties
          }
          {...rest}
        >
          <VerticalContent>{items}</VerticalContent>
        </div>
        {orientation === 'horizontal' && (
          <HorizontalContent>{items}</HorizontalContent>
        )}
        {footer}
      </StepperProvider>
    )
  },
)

Stepper.defaultProps = {
  size: 'md',
  orientation: 'horizontal',
  responsive: true,
}

function VerticalContent({ children }: { children: React.ReactNode }) {
  const { activeStep } = useStepper()

  const childArr = React.Children.toArray(children)
  const stepCount = childArr.length

  return (
    <>
      {React.Children.map(children, (child, i) => {
        const isCompletedStep =
          (React.isValidElement(child)
            && (child.props as Record<string, unknown>).isCompletedStep)
          ?? i < activeStep
        const isLastStep = i === stepCount - 1
        const isCurrentStep = i === activeStep

        const stepProps = {
          index: i,
          isCompletedStep,
          isCurrentStep,
          isLastStep,
        }

        if (React.isValidElement(child))
          return React.cloneElement(child, stepProps)

        return null
      })}
    </>
  )
}

function HorizontalContent({ children }: { children: React.ReactNode }) {
  const { activeStep } = useStepper()
  const childArr = React.Children.toArray(children)

  if (activeStep > childArr.length) return null

  return (
    <>
      {React.Children.map(childArr[activeStep], (node) => {
        if (!React.isValidElement(node)) return null
        return React.Children.map(
          (node.props as { children?: React.ReactNode }).children,
          (childNode) => childNode,
        )
      })}
    </>
  )
}

// <---------- STEP ---------->

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string | React.ReactNode
  description?: string
  icon?: IconType
  state?: 'loading' | 'error'
  checkIcon?: IconType
  errorIcon?: IconType
  isCompletedStep?: boolean
  isKeepError?: boolean
  onClickStep?: (
    step: number,
    setStep: (step: number) => void,
    activeStep: number
  ) => void
}

interface StepSharedProps extends StepProps {
  isLastStep?: boolean
  isCurrentStep?: boolean
  index?: number
  hasVisited: boolean | undefined
  isError?: boolean
  isLoading?: boolean
  clickable?: boolean
}

interface StepInternalConfig {
  index: number
  isCompletedStep?: boolean
  isCurrentStep?: boolean
  isLastStep?: boolean
}

interface FullStepProps extends StepProps, StepInternalConfig {}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const {
      children,
      description,
      icon,
      state,
      checkIcon,
      errorIcon,
      index,
      isCompletedStep,
      isCurrentStep,
      isLastStep,
      isKeepError,
      label,
      onClickStep,
    } = props as FullStepProps

    const { isVertical, isError, isLoading, clickable } = useStepper()

    const hasVisited = isCurrentStep || isCompletedStep

    const sharedProps: StepSharedProps = {
      isLastStep,
      isCompletedStep,
      isCurrentStep,
      index,
      isError,
      isLoading,
      clickable,
      label,
      description,
      hasVisited,
      icon,
      isKeepError,
      checkIcon,
      state,
      errorIcon,
      onClickStep,
    }

    const renderStep = () => {
      switch (isVertical) {
        case true:
          return (
            <VerticalStep ref={ref} {...sharedProps}>
              {children}
            </VerticalStep>
          )
        default:
          return <HorizontalStep ref={ref} {...sharedProps} />
      }
    }

    return renderStep()
  },
)

// <---------- VERTICAL STEP ---------->

type VerticalStepProps = StepSharedProps & {
  children?: React.ReactNode
}

const verticalStepVariants = cva(
  [
    'flex flex-col relative transition-all duration-200',
    'data-[completed=true]:[&:not(:last-child)]:after:bg-primary',
    'data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive',
  ],
  {
    variants: {
      variant: {
        circle: cn(
          '[&:not(:last-child)]:gap-[var(--step-gap)] [&:not(:last-child)]:pb-[var(--step-gap)]',
          '[&:not(:last-child)]:after:bg-border [&:not(:last-child)]:after:w-[2px] [&:not(:last-child)]:after:content-[\'\']',
          '[&:not(:last-child)]:after:inset-x-[calc(var(--step-icon-size)/2)]',
          '[&:not(:last-child)]:after:absolute',
          '[&:not(:last-child)]:after:top-[calc(var(--step-icon-size)+var(--step-gap))]',
          '[&:not(:last-child)]:after:bottom-[var(--step-gap)]',
          '[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200',
        ),
        line: 'flex-1 border-t-0 mb-4',
      },
    },
  },
)

const VerticalStep = React.forwardRef<HTMLDivElement, VerticalStepProps>(
  (props, ref) => {
    const {
      children,
      index,
      isCompletedStep,
      isCurrentStep,
      label,
      description,
      icon,
      hasVisited,
      state,
      checkIcon: checkIconProp,
      errorIcon: errorIconProp,
      onClickStep,
    } = props

    const {
      checkIcon: checkIconContext,
      errorIcon: errorIconContext,
      isError,
      isLoading,
      variant,
      onClickStep: onClickStepGeneral,
      clickable,
      expandVerticalSteps,
      styles,
      scrollTracking,
      orientation: _orientation,
      steps,
      setStep,
      activeStep,
      isLastStep: _isLastStepCurrentStep,
      previousActiveStep,
    } = useStepper()

    const opacity = hasVisited ? 1 : 0.8
    const localIsLoading = isLoading || state === 'loading'
    const localIsError = isError || state === 'error'

    const isLastStep = index === steps.length - 1

    const active =
      variant === 'line' ? isCompletedStep || isCurrentStep : isCompletedStep
    const checkIcon = checkIconProp || checkIconContext
    const errorIcon = errorIconProp || errorIconContext

    const renderChildren = () => {
      if (!expandVerticalSteps) {
        return (
          <Collapsible open={isCurrentStep}>
            <CollapsibleContent
              ref={(node) => {
                if (
                  scrollTracking
                  && ((index === 0
                    && previousActiveStep
                    && previousActiveStep === steps.length)
                    || (index && index > 0))
                ) {
                  node?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }
              }}
              className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden"
            >
              {children}
            </CollapsibleContent>
          </Collapsible>
        )
      }
      return children
    }

    return (
      <div
        ref={ref}
        className={cn(
          'stepper__vertical-step',
          'data-[clickable=true]:cursor-pointer',
          verticalStepVariants({
            variant: variant?.includes('circle') ? 'circle' : 'line',
          }),
          isLastStep && 'gap-[var(--step-gap)]',
          styles?.['vertical-step'],
        )}
        data-completed={isCompletedStep}
        data-active={isCurrentStep}
        data-clickable={clickable || !!onClickStep}
        data-invalid={localIsError && isCurrentStep}
        onClick={() => {
          if (onClickStep)
            onClickStep(index || 0, setStep, activeStep)
          else
            onClickStepGeneral?.(index || 0, setStep, activeStep)
        }}
      >
        <div
          data-vertical
          data-active={isCurrentStep}
          className={cn(
            'stepper__vertical-step-container',
            'flex items-center',
            variant !== 'line'
              && 'gap-2',
            styles?.['vertical-step-container'],
          )}
        >
          <StepButtonContainer
            {...{ isLoading: localIsLoading, isError: localIsError, ...props }}
          >
            <StepIcon
              {...{
                index,
                isError: localIsError,
                isLoading: localIsLoading,
                isCurrentStep,
                isCompletedStep,
              }}
              icon={icon}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
            />
          </StepButtonContainer>
          <StepLabel
            label={label}
            description={description}
            {...{ isCurrentStep, opacity }}
          />
        </div>
        <div
          className={cn(
            'stepper__vertical-step-content',
            !isLastStep && 'min-h-4',
            variant !== 'line' && 'ps-[--step-icon-size]',
            variant === 'line' && 'min-h-0 border-l-0 py-0',
            styles?.['vertical-step-content'],
          )}
        >
          {renderChildren()}
        </div>
      </div>
    )
  },
)

// <---------- HORIZONTAL STEP ---------->

const HorizontalStep = React.forwardRef<HTMLDivElement, StepSharedProps>(
  (props, ref) => {
    const {
      isError,
      isLoading,
      onClickStep,
      variant,
      clickable,
      checkIcon: checkIconContext,
      errorIcon: errorIconContext,
      styles,
      steps,
      setStep,
      activeStep,
    } = useStepper()

    const {
      index,
      isCompletedStep,
      isCurrentStep,
      hasVisited,
      icon,
      label,
      description,
      isKeepError,
      state,
      checkIcon: checkIconProp,
      errorIcon: errorIconProp,
    } = props

    const localIsLoading = isLoading || state === 'loading'
    const localIsError = isError || state === 'error'

    const opacity = hasVisited ? 1 : 0.8

    const active =
      variant === 'line' ? isCompletedStep || isCurrentStep : isCompletedStep

    const checkIcon = checkIconProp || checkIconContext
    const errorIcon = errorIconProp || errorIconContext

    return (
      <div
        className={cn(
          'stepper__horizontal-step',
          'relative flex items-center transition-all duration-200',
          'data-[clickable=true]:cursor-pointer',
          '[&:not(:last-child)]:flex-1',
          '[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200',
          '[&:not(:last-child)]:after:h-[2px] [&:not(:last-child)]:after:bg-border',
          'data-[completed=true]:[&:not(:last-child)]:after:bg-primary',
          'data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive',
          variant === 'circle-alt'
            && 'flex-1 flex-col justify-start [&:not(:last-child)]:after:relative [&:not(:last-child)]:after:order-[-1] [&:not(:last-child)]:after:start-[50%] [&:not(:last-child)]:after:end-[50%] [&:not(:last-child)]:after:top-[calc(var(--step-icon-size)/2)] [&:not(:last-child)]:after:w-[calc(100%-var(--step-icon-size)-var(--step-gap))]',
          variant === 'circle'
            && '[&:not(:last-child)]:after:me-2 [&:not(:last-child)]:after:ms-2 [&:not(:last-child)]:after:flex-1',
          variant === 'line'
            && 'flex-1 flex-col border-t-[3px] data-[active=true]:border-primary',
          styles?.['horizontal-step'],
        )}
        data-completed={isCompletedStep}
        data-active={isCurrentStep}
        data-clickable={clickable}
        data-invalid={localIsError && isCurrentStep}
        onClick={() => onClickStep?.(index || 0, setStep, activeStep)}
        ref={ref}
      >
        <div
          className={cn(
            'stepper__horizontal-step-container',
            'flex items-center',
            variant !== 'line' && 'gap-2',
            styles?.['horizontal-step-container'],
          )}
        >
          <StepButtonContainer
            {...{ ...props, isLoading: localIsLoading, isError: localIsError }}
          >
            <StepIcon
              {...{
                index,
                isCompletedStep,
                isCurrentStep,
                isError: localIsError,
                isKeepError,
                isLoading: localIsLoading,
              }}
              icon={icon}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
            />
          </StepButtonContainer>
          <StepLabel
            label={label}
            description={description}
            {...{ isCurrentStep, opacity }}
          />
        </div>
      </div>
    )
  },
)

// <---------- STEP BUTTON CONTAINER ---------->

type StepButtonContainerProps = StepSharedProps & {
  children?: React.ReactNode
}

function StepButtonContainer({
  isCurrentStep,
  isCompletedStep,
  children,
  isError,
  isLoading: isLoadingProp,
  onClickStep,
}: StepButtonContainerProps) {
  const {
    clickable,
    isLoading: isLoadingContext,
    variant,
    styles,
  } = useStepper()

  const currentStepClickable = clickable || !!onClickStep

  const isLoading = isLoadingProp || isLoadingContext

  if (variant === 'line') return null

  return (
    <Button
      variant="ghost"
      tabIndex={currentStepClickable ? 0 : -1}
      className={cn(
        'stepper__step-button-container',
        'pointer-events-none rounded-full p-0',
        'h-[var(--step-icon-size)] w-[var(--step-icon-size)]',
        'flex items-center justify-center rounded-full border-2',
        'data-[clickable=true]:pointer-events-auto',
        'data-[clickable=true]:cursor-pointer',
        'data-[active=true]:bg-primary data-[active=true]:border-primary data-[active=true]:text-primary-foreground',
        'data-[current=true]:border-primary data-[current=true]:bg-secondary',
        'data-[invalid=true]:bg-destructive data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-foreground',
        styles?.['step-button-container'],
      )}
      aria-current={isCurrentStep ? 'step' : undefined}
      data-current={isCurrentStep}
      data-invalid={isError && isCurrentStep}
      data-active={isCompletedStep}
      data-clickable={currentStepClickable}
      data-loading={isLoading && isCurrentStep}
    >
      {children}
    </Button>
  )
}

// <---------- STEP ICON ---------->

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-4',
      lg: 'size-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface StepIconProps {
  isCompletedStep?: boolean
  isCurrentStep?: boolean
  isError?: boolean
  isLoading?: boolean
  isKeepError?: boolean
  icon?: IconType
  index?: number
  checkIcon?: IconType
  errorIcon?: IconType
}

const StepIcon = React.forwardRef<HTMLDivElement, StepIconProps>(
  (props, ref) => {
    const { size } = useStepper()

    const {
      isCompletedStep,
      isCurrentStep,
      isError,
      isLoading,
      isKeepError,
      icon: CustomIcon,
      index,
      checkIcon: CustomCheckIcon,
      errorIcon: CustomErrorIcon,
    } = props

    const Icon = React.useMemo(
      () => CustomIcon || null,
      [CustomIcon],
    )

    const ErrorIcon = React.useMemo(
      () => CustomErrorIcon || null,
      [CustomErrorIcon],
    )

    const Check = React.useMemo(
      () => CustomCheckIcon || CheckIcon,
      [CustomCheckIcon],
    )

    return React.useMemo(() => {
      if (isCompletedStep) {
        if (isError && isKeepError) {
          return (
            <div ref={ref} key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          )
        }
        return (
          <div ref={ref} key="icon">
            <Check className={cn(iconVariants({ size }))} />
          </div>
        )
      }
      if (isCurrentStep) {
        if (isError && ErrorIcon) {
          return (
            <div ref={ref} key="icon">
              <ErrorIcon className={cn(iconVariants({ size }))} />
            </div>
          )
        }
        if (isError) {
          return (
            <div ref={ref} key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          )
        }
        if (isLoading) {
          return (
            <Loader2 className={cn(iconVariants({ size }), 'animate-spin')} />
          )
        }
      }
      if (Icon) {
        return (
          <div ref={ref} key="icon">
            <Icon className={cn(iconVariants({ size }))} />
          </div>
        )
      }
      return (
        <span ref={ref} key="icon" className={cn('text-sm font-medium')}>
          {(index || 0) + 1}
        </span>
      )
    }, [
      isCompletedStep,
      isCurrentStep,
      isError,
      isLoading,
      Icon,
      index,
      Check,
      ErrorIcon,
      isKeepError,
      ref,
      size,
    ])
  },
)

// <---------- STEP LABEL ---------->

interface StepLabelProps {
  isCurrentStep?: boolean
  opacity: number
  label?: string | React.ReactNode
  description?: string | null
}

const labelVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const descriptionVariants = cva('', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

function StepLabel({
  isCurrentStep,
  opacity,
  label,
  description,
}: StepLabelProps) {
  const { variant, styles, size, orientation } = useStepper()
  const shouldRender = !!label || !!description

  return shouldRender ? (
    <div
      aria-current={isCurrentStep ? 'step' : undefined}
      className={cn(
        'stepper__step-label-container',
        'flex flex-col justify-center',
        variant !== 'line' ? 'ms-2' : orientation === 'horizontal' && 'my-2',
        variant === 'circle-alt' && 'text-center',
        variant === 'circle-alt' && orientation === 'horizontal' && 'ms-0 flex-wrap justify-center',
        styles?.['step-label-container'],
      )}
      style={{ opacity }}
    >
      {!!label && (
        <span
          className={cn(
            'stepper__step-label',
            labelVariants({ size }),
            styles?.['step-label'],
          )}
        >
          {label}
        </span>
      )}
      {!!description && (
        <span
          className={cn(
            'stepper__step-description',
            'text-muted-foreground',
            descriptionVariants({ size }),
            styles?.['step-description'],
          )}
        >
          {description}
        </span>
      )}
    </div>
  ) : null
}

export { Stepper, Step, useStepper }
export type { StepProps, StepperProps, StepItem }
