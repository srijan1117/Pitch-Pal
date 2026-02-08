import * as React from "react";
import { cn } from "./utils";

const TabsContext = React.createContext();

function Tabs({ defaultValue, children, className }) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col gap-4", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-gray-100 p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, className }) {
  const ctx = React.useContext(TabsContext);

  const isActive = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-6 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-800",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }) {
  const ctx = React.useContext(TabsContext);

  if (ctx.value !== value) return null;

  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
