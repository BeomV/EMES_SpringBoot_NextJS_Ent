import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-[9px] text-muted-foreground mt-0">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-1">{children}</div>}
    </div>
  )
}
