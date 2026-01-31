import React from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = "top",
}) => {
  return (
    <div className="relative group inline-flex">
      {children}

      <span
        className={`
          pointer-events-none absolute whitespace-nowrap rounded-md bg-gray-900 px-2 py-1
          text-xs text-white opacity-0 shadow-lg transition-opacity duration-200
          group-hover:opacity-100
          ${position === "top"
            ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
            : "top-full left-1/2 -translate-x-1/2 mt-2"}
        `}
      >
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
