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

const ALL_LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "cy", name: "Cymraeg", flag: "🏴" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "et", name: "Eesti", flag: "🇪🇪" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ga", name: "Gaeilge", flag: "🇮🇪" },
  { code: "hr", name: "Hrvatski", flag: "🇭🇷" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "is", name: "Íslenska", flag: "🇮🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
  { code: "lv", name: "Latviešu", flag: "🇱🇻" },
  { code: "me", name: "Crnogorski", flag: "🇲🇪" },
  { code: "mk", name: "Македонски", flag: "🇲🇰" },
  { code: "mt", name: "Malti", flag: "🇲🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "sl", name: "Slovenščina", flag: "🇸🇮" },
  { code: "sq", name: "Shqip", flag: "🇦🇱" },
  { code: "sr", name: "Српски", flag: "🇷🇸" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation("ui-common");

  const languages = ALL_LANGUAGES;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    try { localStorage.setItem('i18nextLng', lng); } catch {}
    try { document.documentElement.lang = lng; } catch {}
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[160px]">
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
      <SelectContent className="max-h-80">
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
