import * as React from 'react'

interface TabsContextType {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className = '',
  children,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [currentTab, setCurrentTab] = React.useState(value || defaultValue || '')

  const handleChange = (val: string) => {
    setCurrentTab(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ value: value !== undefined ? value : currentTab, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const isSelected = ctx?.value === value

  return (
    <button
      type="button"
      onClick={() => ctx?.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? 'bg-background text-foreground shadow'
          : 'hover:bg-background/50 hover:text-foreground'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null

  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none ${className}`} {...props}>
      {children}
    </div>
  )
}
