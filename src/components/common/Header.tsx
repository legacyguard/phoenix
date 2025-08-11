import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Header: React.FC = () => {
  const { t } = useTranslation("ui-common");

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Shield className="h-8 w-8 text-accent-primary" />
            <span className="text-xl font-bold text-text-heading">
              {t("ui-elements:ui.name")}
            </span>
          </Link>

          {/* Simple content - this is for public pages */}
          <div className="text-sm text-muted-foreground">
            {t("ui-elements:ui.tagline")}
          </div>
        </div>
      </div>
    </header>
  );
};
