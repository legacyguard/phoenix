import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGenderContext, GENDER_OPTIONS } from "../../i18n/gender-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Info, Save } from "lucide-react";

export const GenderPreferenceSettings: React.FC = () => {
  const { t } = useTranslation("settings");
  const { gender, setGender } = useGenderContext();
  const [selectedGender, setSelectedGender] = useState(gender);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGender(selectedGender);
      setSaveStatus("success");

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");

      // Clear error message after 5 seconds
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedGender !== gender;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("genderPreference.title")}</CardTitle>
        <CardDescription>{t("genderPreference.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Selection */}
        <div className="space-y-2">
          <Label htmlFor="gender-preference">
            {t("genderPreference.selectLabel")}
          </Label>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger id="gender-preference">
              <SelectValue placeholder={t("genderPreference.selectLabel")} />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(`genderPreference.options.${option.value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">
            Examples of how this affects translations:
          </h4>
          <div className="grid gap-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">Welcome Message:</p>
              <p className="text-muted-foreground">
                {selectedGender === "masculine" && "Welcome back, sir!"}
                {selectedGender === "feminine" && "Welcome back, ma'am!"}
                {selectedGender === "neutral" && "Welcome back!"}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">Success Notification:</p>
              <p className="text-muted-foreground">
                {selectedGender === "masculine" &&
                  "Your profile has been updated, sir"}
                {selectedGender === "feminine" &&
                  "Your profile has been updated, ma'am"}
                {selectedGender === "neutral" &&
                  "Your profile has been updated"}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t("genderPreference.privacyNote")}
          </AlertDescription>
        </Alert>

        {/* Save Status */}
        {saveStatus === "success" && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200">
              {t("genderPreference.saveSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {t("genderPreference.saveError")}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t("genderPreference.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("genderPreference.save")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenderPreferenceSettings;
