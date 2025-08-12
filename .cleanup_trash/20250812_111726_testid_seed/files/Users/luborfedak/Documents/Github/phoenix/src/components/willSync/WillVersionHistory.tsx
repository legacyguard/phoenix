import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  FileText,
  GitBranch,
  RotateCcw,
  Download,
  User,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WillVersion, WillChanges } from "@/types/willSync";
import format from "date-fns/format";

interface WillVersionHistoryProps {
  versions: WillVersion[];
  currentVersionId: string;
  onRestore?: (versionId: string) => void;
  onExport?: (versionId: string) => void;
  onViewDiff?: (fromVersion: string, toVersion: string) => void;
}

export function WillVersionHistory({
  versions,
  currentVersionId,
  onRestore,
  onExport,
  onViewDiff,
}: WillVersionHistoryProps) {
  const { t } = useTranslation("wills");
  const [selectedVersions, setSelectedVersions] = useState<[string?, string?]>(
    [],
  );

  const getCreatedByIcon = (createdBy: WillVersion["created_by"]) => {
    switch (createdBy) {
      case "user":
        return <User className="h-4 w-4" />;
      case "system":
        return <Cpu className="h-4 w-4" />;
      case "auto_sync":
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const renderChangesSummary = (changes?: WillChanges) => {
    if (!changes) return null;

    const summaryItems: string[] = [];

    // Count total changes
    const addedCount =
      (changes.added?.assets?.length || 0) +
      (changes.added?.beneficiaries?.length || 0) +
      (changes.added?.guardians?.length || 0) +
      (changes.added?.executors?.length || 0);

    const removedCount =
      (changes.removed?.assets?.length || 0) +
      (changes.removed?.beneficiaries?.length || 0) +
      (changes.removed?.guardians?.length || 0) +
      (changes.removed?.executors?.length || 0);

    const modifiedCount =
      (changes.modified?.assets?.length || 0) +
      (changes.modified?.beneficiaries?.length || 0) +
      (changes.modified?.allocations?.length || 0);

    if (addedCount > 0) {
      summaryItems.push(t("willVersion.added", { count: addedCount }));
    }
    if (removedCount > 0) {
      summaryItems.push(t("willVersion.removed", { count: removedCount }));
    }
    if (modifiedCount > 0) {
      summaryItems.push(t("willVersion.modified", { count: modifiedCount }));
    }

    return summaryItems.join(", ");
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions[0] === versionId) {
      setSelectedVersions([undefined, selectedVersions[1]]);
    } else if (selectedVersions[1] === versionId) {
      setSelectedVersions([selectedVersions[0], undefined]);
    } else if (!selectedVersions[0]) {
      setSelectedVersions([versionId, selectedVersions[1]]);
    } else if (!selectedVersions[1]) {
      setSelectedVersions([selectedVersions[0], versionId]);
    } else {
      setSelectedVersions([versionId, undefined]);
    }
  };

  const canCompare = selectedVersions[0] && selectedVersions[1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {t("willVersion.title")}
              </CardTitle>
              <CardDescription>
                {t("willVersion.description", { count: versions.length })}
              </CardDescription>
            </div>
            {canCompare && (
              <Button
                size="sm"
                onClick={() =>
                  onViewDiff?.(selectedVersions[0]!, selectedVersions[1]!)
                }
              >
                {t("willVersion.compareDiff")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {versions.map((version) => (
                <Card
                  key={version.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVersions.includes(version.id)
                      ? "border-primary"
                      : ""
                  } ${version.id === currentVersionId ? "bg-muted/50" : ""}`}
                  onClick={() => handleVersionSelect(version.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {t("willVersion.versionNumber", {
                              number: version.version_number,
                            })}
                          </span>
                          {version.id === currentVersionId && (
                            <Badge variant="default" className="text-xs">
                              {t("willVersion.current")}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getCreatedByIcon(version.created_by)}
                            <span className="ml-1">
                              {t(`willVersion.createdBy.${version.created_by}`)}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {version.created_reason}
                        </p>
                        {version.changes_from_previous && (
                          <p className="text-sm text-muted-foreground">
                            {renderChangesSummary(
                              version.changes_from_previous,
                            )}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.created_at), "PPp")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {version.id !== currentVersionId && onRestore && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestore(version.id);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t("willVersion.restore")}
                          </Button>
                        )}
                        {onExport && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onExport(version.id);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedVersions[0] && selectedVersions[1] && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("willVersion.comparePrompt", {
                version1: versions.find((v) => v.id === selectedVersions[0])
                  ?.version_number,
                version2: versions.find((v) => v.id === selectedVersions[1])
                  ?.version_number,
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
