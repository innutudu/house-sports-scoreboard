import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectContextType {
  value: string
  onValueChange: (val: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      id={id}
      type="button"
      onClick={() => ctx?.setOpen((prev) => !prev)}
      className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return <span>{ctx?.value || placeholder}</span>
}

export function SelectContent({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div
        className={`absolute left-0 top-full z-50 mt-1 max-h-60 min-w-[8rem] w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      >
        {children}
      </div>
    </>
  )
}

export function SelectItem({
  value,
  children,
  className = '',
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx?.value === value

  return (
    <div
      onClick={() => {
        ctx?.onValueChange(value)
        ctx?.setOpen(false)
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        isSelected ? 'bg-accent text-accent-foreground' : ''
      } ${className}`}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  )
}
