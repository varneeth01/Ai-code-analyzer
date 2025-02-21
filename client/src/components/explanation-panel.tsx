import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type CodeAnalysis } from "@/lib/gemini";
import { AlertTriangle, Clock, Code, Lightbulb, Database } from "lucide-react";

interface ExplanationPanelProps {
  analysis?: CodeAnalysis;
  isLoading?: boolean;
}

export function ExplanationPanel({ analysis, isLoading }: ExplanationPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Enter some code to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <CardHeader>
          <CardTitle>Code Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Explanation</h3>
            <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Complexity Analysis
            </h3>
            <div className="space-y-1">
              <p className="text-sm">
                <strong>Time Complexity:</strong> {analysis.timeComplexity}
              </p>
              <p className="text-sm">
                <strong>Space Complexity:</strong> {analysis.spaceComplexity}
              </p>
            </div>
          </div>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggestions
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.optimizedCode && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5" />
                Optimized Code
              </h3>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                <code>{analysis.optimizedCode}</code>
              </pre>
            </div>
          )}

          {analysis.errors && analysis.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Errors
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.errors.map((error, i) => (
                  <li key={i} className="text-sm text-destructive">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}