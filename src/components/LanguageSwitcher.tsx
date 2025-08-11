import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("ui-common");

  const languages = [
    { code: "en", name: t("languages.en"), flag: "🇬🇧" },
    { code: "sk", name: t("languages.sk"), flag: "🇸🇰" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
              <span className="sm:hidden">
                {currentLanguage.code.toUpperCase()}
              </span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
