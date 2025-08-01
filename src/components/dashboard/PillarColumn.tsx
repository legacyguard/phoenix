
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PillarColumnProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PillarColumn: React.FC<PillarColumnProps> = ({
  title,
  description,
  icon,
  children
}) => {
  return (
    <Card variant="earth" className="h-full">
      <CardHeader className="text-center">
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <CardTitle className="text-xl text-primary">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
