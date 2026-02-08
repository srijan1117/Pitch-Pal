import * as React from "react";
import { cn } from "./utils";

function Badge({ className = "", variant = "default", ...props }) {
  const variants = {
    default:
      "bg-gray-900 text-white border-transparent",
    outline:
      "bg-white text-gray-800 border border-gray-200",
    success:
      "bg-green-50 text-green-700 border border-green-100",
    warning:
      "bg-yellow-50 text-yellow-800 border border-yellow-100",
    danger:
      "bg-red-50 text-red-700 border border-red-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
