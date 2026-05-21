import React from "react";
import "./Marquee.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "marquee-group",
        className
      )}
      style={{
        flexDirection: vertical ? "column" : "row",
        gap: "var(--gap)",
        ...(props.style || {})
      }}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              pauseOnHover ? "group-hover-pause" : "",
              reverse ? "reverse-marquee" : "",
              !vertical ? "animate-marquee" : "animate-marquee-vertical"
            )}
            style={{
              display: "flex",
              flexShrink: 0,
              justifyContent: "space-around",
              gap: "var(--gap)",
              flexDirection: vertical ? "column" : "row",
            }}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
