import React from "react";
import AppFooter from "@/components/AppFooter";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <img
            src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png"
            alt="MaKonim"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-3xl shadow-xl shadow-primary/10 border border-primary/15 p-6 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
        <AppFooter />
      </div>
    </div>
  );
}