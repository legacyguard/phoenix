import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle,
  X, 
  Trash2, 
  Copy, 
  Download, 
  ChevronDown,
  ChevronUp,
  Bug,
  Clock,
  FileText,
  MapPin
} from 'lucide-react';
import { parseStackTrace, formatStackFrame } from '@/utils/stackTrace';
import { toast } from 'sonner';

interface StoredError {
  timestamp: string;
  error?: {
    message: string;
    name: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
  location?: {
    href: string;
    pathname: string;
    search: string;
  };
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export const ErrorDebugPanel: React.FC = () => {
  const { t } = useTranslation('ui-common');
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<StoredError[]>([]);
  const [selectedError, setSelectedError] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stack']));

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    loadErrors();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadErrors();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for new errors every 5 seconds
    const interval = setInterval(loadErrors, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadErrors = () => {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      setErrors(storedErrors);
    } catch (e) {
      console.error('Failed to load errors from localStorage:', e);
    }
  };

  const clearErrors = () => {
    localStorage.removeItem('app_errors');
    setErrors([]);
    setSelectedError(null);
    toast.success(t('help.panel.messages.errorsCleared'));
  };

  const copyError = (error: StoredError) => {
    const errorText = JSON.stringify(error, null, 2);
    navigator.clipboard.writeText(errorText);
    toast.success(t('help.panel.messages.errorCopied'));
  };

  const downloadErrors = () => {
    const data = JSON.stringify(errors, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('help.panel.messages.errorsDownloaded'));
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (process.env.NODE_ENV !== 'development' || errors.length === 0) {
    return null;
  }

  const selectedErrorData = selectedError !== null ? errors[selectedError] : null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-destructive text-destructive-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
          title={t('debug.panel.errorCount', { count: errors.length })}
        >
          <div className="relative">
            <Bug className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-background text-destructive text-xs rounded-full h-5 w-5 flex items-center justify-center border border-destructive">
              {errors.length}
            </span>
          </div>
        </button>
      )}

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full md:w-[600px] h-[70vh] bg-background border-l border-t rounded-tl-lg shadow-2xl">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>{t('help.panel.title')}</CardTitle>
                  <Badge variant="destructive">{errors.length}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={downloadErrors}
                    title={t('help.panel.actions.downloadErrors')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={clearErrors}
                    title={t('help.panel.actions.clearAllErrors')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {t('help.panel.recentErrors')}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="list" className="h-full flex flex-col">
                <TabsList className="mx-4">
                  <TabsTrigger value="list">{t('help.panel.tabs.list')}</TabsTrigger>
                  <TabsTrigger value="details" disabled={selectedError === null}>
                    {t('help.panel.tabs.details')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="flex-1 overflow-hidden mt-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {errors.map((error, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedError === index
                              ? 'bg-muted border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            setSelectedError(index);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {error.error?.name || t('help.panel.error.unknownError')}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {error.error?.message || t('help.panel.error.noMessage')}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(error.timestamp).toLocaleTimeString()}
                                </span>
                                {error.location && (
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {error.location.pathname}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyError(error);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="details" className="flex-1 overflow-hidden mt-0">
                  {selectedErrorData && (
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {/* Error message */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">{t('help.panel.error.errorMessage')}</h4>
                          <div className="bg-destructive/10 p-3 rounded-md">
                            <p className="text-sm font-mono">
                              {selectedErrorData.error?.name}: {selectedErrorData.error?.message}
                            </p>
                          </div>
                        </div>

                        {/* Stack trace */}
                        {selectedErrorData.error?.stack && (
                          <div>
                            <button
                              onClick={() => toggleSection('stack')}
                              className="flex items-center justify-between w-full text-left"
                            >
                              <h4 className="font-semibold text-sm">{t('help.panel.sections.stackTrace')}</h4>
                              {expandedSections.has('stack') ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {expandedSections.has('stack') && (
                              <div className="mt-2 bg-muted/30 p-3 rounded-md">
                                <div className="space-y-1">
                                  {parseStackTrace(selectedErrorData.error.stack).map((frame, i) => (
                                    <div key={i} className="text-xs font-mono">
                                      {formatStackFrame(frame)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Context */}
                        {selectedErrorData.context && (
                          <div>
                            <button
                              onClick={() => toggleSection('context')}
                              className="flex items-center justify-between w-full text-left"
                            >
                              <h4 className="font-semibold text-sm">{t('help.panel.sections.context')}</h4>
                              {expandedSections.has('context') ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {expandedSections.has('context') && (
                              <div className="mt-2 bg-muted/30 p-3 rounded-md">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {JSON.stringify(selectedErrorData.context, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Location */}
                        {selectedErrorData.location && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">{t('help.panel.sections.location')}</h4>
                            <div className="bg-muted/30 p-3 rounded-md space-y-1">
                              <p className="text-xs">
                                <span className="font-medium">{t('help.panel.fields.url')}</span> {selectedErrorData.location.href}
                              </p>
                              <p className="text-xs">
                                <span className="font-medium">{t('help.panel.fields.path')}</span> {selectedErrorData.location.pathname}
                              </p>
                              {selectedErrorData.location.search && (
                                <p className="text-xs">
                                  <span className="font-medium">{t('help.panel.fields.query')}</span> {selectedErrorData.location.search}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Browser info */}
                        <div>
                          <button
                            onClick={() => toggleSection('browser')}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <h4 className="font-semibold text-sm">{t('help.panel.sections.browserInfo')}</h4>
                            {expandedSections.has('browser') ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {expandedSections.has('browser') && (
                            <div className="mt-2 bg-muted/30 p-3 rounded-md space-y-1">
                              <p className="text-xs">
                                <span className="font-medium">{t('help.panel.fields.userAgent')}</span> {selectedErrorData.userAgent}
                              </p>
                              {selectedErrorData.viewport && (
                                <p className="text-xs">
                                  <span className="font-medium">{t('help.panel.fields.viewport')}</span> {selectedErrorData.viewport.width} x {selectedErrorData.viewport.height}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">{t('help.panel.sections.time')}</h4>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <p className="text-xs">
                              {new Date(selectedErrorData.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
