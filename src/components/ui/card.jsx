import React from "react";
import "./uiStyles.css";

/* 
  Clean React JSX Card System
  No Tailwind
  No utility functions
  Fully reusable
*/

export function Card({ className = "", children, ...props }) {
  return (
    <div
      data-slot="card"
      className={`ui-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={`ui-card-header ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={`ui-card-title ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={`ui-card-description ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardAction({ className = "", children, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={`ui-card-action ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={`ui-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={`ui-card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}