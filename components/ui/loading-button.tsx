import * as React from 'react'

import { Loader2 } from 'lucide-react'
import { Button, ButtonProps } from './button'

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, className, variant, size, loading = false, ...props }, ref) => {
    return (
      <Button className={className} ref={ref} {...props}>
        <>
          {loading ? (
            <>
              <Loading className="mr-1" />
              {children}
            </>
          ) : (
            children
          )}
        </>
      </Button>
    )
  }
)

function Loading({ className }: { className?: string }) {
  return (
    <span role="status" className={className}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="sr-only">Loading...</span>
    </span>
  )
}

LoadingButton.displayName = 'LoadingButton'
