import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
  required?: boolean
  description?: string
  containerClassName?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, description, containerClassName, id, className, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className={cn("space-y-1", containerClassName)}>
        <Label
          htmlFor={fieldId}
          variant={required ? "required" : "default"}
        >
          {label}
        </Label>
        <Input
          ref={ref}
          id={fieldId}
          className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
