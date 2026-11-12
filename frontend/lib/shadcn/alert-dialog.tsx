import * as React from 'react'
import { Button } from './button'

interface AlertDialogContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {open ? <div className="fixed inset-0 z-50 flex items-center justify-center">{children}</div> : null}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogContent({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx?.open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => ctx.onOpenChange(false)} />
      <div
        className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg ${className}`}
      >
        {children}
      </div>
    </>
  )
}

export function AlertDialogHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
}

export function AlertDialogFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
}

export function AlertDialogTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />
}

export function AlertDialogDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />
}

export function AlertDialogAction({
  className = '',
  onClick,
  disabled,
  children,
}: {
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

export function AlertDialogCancel({
  className = '',
  disabled,
  children,
}: {
  className?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const ctx = React.useContext(AlertDialogContext)
  return (
    <Button
      variant="outline"
      className={className}
      disabled={disabled}
      onClick={() => ctx?.onOpenChange(false)}
    >
      {children}
    </Button>
  )
}
