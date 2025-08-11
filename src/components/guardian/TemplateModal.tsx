import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlaybookTemplate,
  PlaybookTemplates,
  getTemplatesByFilter,
  replaceVariables,
} from "@/data/playbookTemplates";
import {
  FileText,
  User,
  Briefcase,
  Heart,
  TreePine,
  Home,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: keyof PlaybookTemplates;
  onInsert: (content: string) => void;
  existingContent?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  religious: <Heart className="h-4 w-4" />,
  secular: <User className="h-4 w-4" />,
  environmental: <TreePine className="h-4 w-4" />,
  detailed: <FileText className="h-4 w-4" />,
  simple: <Sparkles className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  professional: <Briefcase className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  family: <Users className="h-4 w-4" />,
  comprehensive: <FileText className="h-4 w-4" />,
  immediate: <AlertCircle className="h-4 w-4" />,
};

const toneColors = {
  formal: "default",
  personal: "secondary",
  professional: "outline",
} as const;

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  section,
  onInsert,
  existingContent,
}) => {
  const { t } = useTranslation("family-core");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PlaybookTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [insertMode, setInsertMode] = useState<"replace" | "append">("replace");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const templates = getTemplatesByFilter(
    section,
    activeCategory === "all" ? undefined : { category: activeCategory },
  );

  // Get unique categories for this section
  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  const handleSelectTemplate = (template: PlaybookTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables with empty strings
    const initialVars: Record<string, string> = {};
    template.variables?.forEach((v) => {
      initialVars[v] = "";
    });
    setVariables(initialVars);
  };

  const handleInsert = () => {
    if (!selectedTemplate) return;

    let content = replaceVariables(selectedTemplate.content, variables);

    // Clean up any remaining unreplaced variables
    content = content.replace(/{{[^}]+}}/g, "[PLEASE FILL IN]");

    if (insertMode === "append" && existingContent) {
      content = existingContent + "\n\n" + content;
    }

    onInsert(content);
    onClose();
  };

  const getPreview = () => {
    if (!selectedTemplate) return "";
    return replaceVariables(selectedTemplate.content, variables);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("family.templates.title")}</DialogTitle>
          <DialogDescription>
            {t("family.templates.description")}
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          // Template Selection View
          <div className="space-y-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-6 h-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {categoryIcons[category]}
                    <span className="ml-1 text-xs">
                      {t(`playbook.templates.categories.${category}`, category)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[template.category]}
                          <CardTitle className="text-base">
                            {template.title}
                          </CardTitle>
                        </div>
                        <Badge variant={toneColors[template.tone]}>
                          {t("family.templates.tone.${template.tone}")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content.substring(0, 150)}
                        {t("family.templateModal._1")}
                      </p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">
                            {t("playbook.templates.variableCount", {
                              count: template.variables.length,
                            })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Template Customization View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedTemplate.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                {t("family.templates.backToTemplates")}
              </Button>
            </div>

            {selectedTemplate.variables &&
              selectedTemplate.variables.length > 0 && (
                <div className="space-y-3">
                  <Label>{t("family.templates.fillInVariables")}</Label>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable} className="space-y-1">
                          <Label htmlFor={variable} className="text-sm">
                            {t(
                              `playbook.templates.variables.${variable}`,
                              variable,
                            )}
                          </Label>
                          <Input
                            id={variable}
                            value={variables[variable] || ""}
                            onChange={(e) =>
                              setVariables((prev) => ({
                                ...prev,
                                [variable]: e.target.value,
                              }))
                            }
                            placeholder={t(
                              "family.templates.variablePlaceholder",
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

            <div className="space-y-2">
              <Label>{t("family.templates.preview")}</Label>
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {getPreview()}
                </pre>
              </ScrollArea>
            </div>

            {existingContent && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{t("family.templates.existingContent")}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          insertMode === "replace" ? "default" : "outline"
                        }
                        onClick={() => setInsertMode("replace")}
                      >
                        {t("family.templates.replace")}
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          insertMode === "append" ? "default" : "outline"
                        }
                        onClick={() => setInsertMode("append")}
                      >
                        {t("family.templates.append")}
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          {selectedTemplate && (
            <Button onClick={handleInsert}>
              {t("family.templates.insertTemplate")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
