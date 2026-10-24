"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// חלון בלי תיאור מקבל סימון מפורש כדי שקוראי מסך לא ייחשפו להתראת נגישות מיותרת,
// וחלון שכן מכיל תיאור שומר על הקישור האוטומטי של הספרייה
const containsDescription = (nodes) => React.Children.toArray(nodes).some((node) => {
  if (!React.isValidElement(node)) return false;
  if (node.type === DialogDescription) return true;
  return node.props?.children ? containsDescription(node.props.children) : false;
});

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "pointer-events-auto fixed left-[50%] top-[50%] z-50 grid w-[calc(100vw-1.5rem)] max-w-[26rem] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-5 shadow-lg duration-200 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-3xl sm:max-w-lg sm:rounded-2xl",
        className
      )}
      {...(containsDescription(children) ? props : { "aria-describedby": undefined, ...props })}>
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute end-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-market-ink/20 bg-muted text-market-ink shadow-sm transition-colors hover:border-market-pink hover:bg-market-pink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-market-ink disabled:pointer-events-none">
        <X className="h-5 w-5" strokeWidth={2.75} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props} />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}