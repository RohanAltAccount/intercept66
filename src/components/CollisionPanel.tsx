import { CollisionPrediction } from '@/lib/collision-detection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CollisionPanelProps {
  predictions: CollisionPrediction[];
}

export default function CollisionPanel({ predictions }: CollisionPanelProps) {
  const dangerCount = predictions.filter(p => p.riskLevel === 'danger').length;
  const proximityCount = predictions.filter(p => p.riskLevel === 'proximity').length;

  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            collision predictions
          </span>
          <div className="flex gap-2">
            {dangerCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {dangerCount} danger
              </Badge>
            )}
            {proximityCount > 0 && (
              <Badge className="text-xs bg-warning/20 text-warning border-warning/30">
                {proximityCount} proximity
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-auto max-h-[400px]">
        {predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="w-12 h-12 text-success/50 mb-3" />
            <p className="text-sm text-muted-foreground">no collision risks detected</p>
            <p className="text-xs text-muted-foreground mt-1">add satellites to monitor potential collisions</p>
          </div>
        ) : (
          predictions.map((prediction, index) => (
            <div
              key={`${prediction.sat1Id}-${prediction.sat2Id}-${index}`}
              className={`p-3 rounded-lg border transition-all ${
                prediction.riskLevel === 'danger'
                  ? 'bg-danger/10 border-danger/30 animate-pulse'
                  : prediction.riskLevel === 'proximity'
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-secondary/30 border-border/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle 
                    className={`w-4 h-4 ${
                      prediction.riskLevel === 'danger' ? 'text-danger' : 'text-warning'
                    }`} 
                  />
                  <span className="text-xs font-semibold">
                    {prediction.riskLevel === 'danger' ? 'collision risk' : 'close approach'}
                  </span>
                </div>
                <Badge 
                  variant={prediction.riskLevel === 'danger' ? 'destructive' : 'outline'}
                  className="text-[10px]"
                >
                  {prediction.minDistance.toFixed(2)} km
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">object 1</p>
                  <p className="font-mono truncate">{prediction.sat1Name.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">object 2</p>
                  <p className="font-mono truncate">{prediction.sat2Name.toLowerCase()}</p>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground">
                  closest approach: {formatDistanceToNow(prediction.closestApproachTime, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
