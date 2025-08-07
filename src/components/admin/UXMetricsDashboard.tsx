import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { auditEmpatheticUX, UXAuditResult, AuditMetrics } from '@/testing/uxAudit';
import { useUXMetrics } from '@/hooks/useUXMetrics';

interface MetricCardProps {
  title: string;
  value: number;
  target: number;
  description: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  target, 
  description, 
  icon,
  trend 
}) => {
  const percentage = (value / target) * 100;
  const isOnTarget = value >= target;
  
  return (
    <Card className={`${isOnTarget ? 'border-green-200' : 'border-amber-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {trend && (
            <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{value.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">Target: {target}</span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-2 ${isOnTarget ? 'bg-green-100' : 'bg-amber-100'}`}
          />
          {!isOnTarget && (
            <p className="text-xs text-amber-600">
              {(target - value).toFixed(1)} points below target
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UXMetricsDashboard: React.FC = () => {
  const [auditResults, setAuditResults] = useState<UXAuditResult[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);
  const metrics = useUXMetrics();

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const results = await auditEmpatheticUX();
      setAuditResults(results);
      setLastAuditTime(new Date());
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    // Run initial audit
    runAudit();
  }, []);

  const calculateOverallScore = () => {
    if (auditResults.length === 0) return 0;
    const totalScore = auditResults.reduce((sum, result) => sum + result.score, 0);
    return totalScore / auditResults.length;
  };

  const getCriticalIssues = () => {
    return auditResults.flatMap(result => 
      result.issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high')
    );
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: calculateOverallScore(),
      metrics,
      auditResults,
      criticalIssues: getCriticalIssues()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ux-audit-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="ux-metrics-dashboard p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">UX Empathy Metrics</h1>
          <p className="text-muted-foreground">
            Monitoring the caring, family-focused experience
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAudit} 
            disabled={isAuditing}
            variant="outline"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {lastAuditTime && (
        <p className="text-sm text-muted-foreground">
          Last audit: {lastAuditTime.toLocaleString()}
        </p>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Empathy Score" 
          value={metrics.empathyScore} 
          target={8.5}
          description="How empathetic the language feels to users"
          icon={<Heart className="h-4 w-4 text-rose-500" />}
          trend="up"
        />
        
        <MetricCard 
          title="Family Focus Ratio" 
          value={metrics.familyFocusRatio * 10} 
          target={8}
          description="Ratio of family-focused vs feature-focused content"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          trend="stable"
        />
        
        <MetricCard 
          title="Emotional Support Coverage" 
          value={metrics.emotionalSupportCoverage * 10} 
          target={9.5}
          description="Percentage of difficult moments with emotional support"
          icon={<MessageCircle className="h-4 w-4 text-green-500" />}
          trend="up"
        />
        
        <MetricCard 
          title="Assistant Consistency" 
          value={metrics.assistantConsistency * 10} 
          target={9}
          description="Consistency of caring assistant personality"
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          trend="stable"
        />
      </div>

      {/* Detailed Audit Results */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Experience Score</CardTitle>
              <CardDescription>
                Combined score across all empathy categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {calculateOverallScore().toFixed(1)}/10
              </div>
              <Progress value={calculateOverallScore() * 10} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.category}</CardTitle>
                    <Badge 
                      variant={result.emotionalTone === 'empathetic' ? 'default' : 
                               result.emotionalTone === 'warm' ? 'secondary' : 'outline'}
                    >
                      {result.emotionalTone}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{result.score.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      {result.issues.length} issues
                    </span>
                  </div>
                  <Progress value={result.score * 10} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {getCriticalIssues().length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Critical Issues ({getCriticalIssues().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {getCriticalIssues().map((issue, index) => (
                    <li key={index} className="border-l-4 border-red-400 pl-4">
                      <p className="font-medium">{issue.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Location: {issue.location} | Impact: {issue.impact}
                      </p>
                      {issue.suggestion && (
                        <p className="text-sm text-blue-600 mt-1">
                          Suggestion: {issue.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {auditResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{result.category} Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {result.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    No issues found
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {result.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <Badge 
                          variant={issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'default' :
                                  issue.severity === 'medium' ? 'secondary' : 'outline'}
                          className="mt-0.5"
                        >
                          {issue.severity}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{issue.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.location}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {auditResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{result.category} Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Review Technical Terms
          </Button>
          <Button variant="outline" size="sm">
            Check Error Messages
          </Button>
          <Button variant="outline" size="sm">
            Audit CTAs
          </Button>
          <Button variant="outline" size="sm">
            Test Emotional Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UXMetricsDashboard;
