import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';import { useTranslation } from "react-i18next";

interface UpgradeCardProps {
  title: string;
  text: string;
  buttonText?: string;
  className?: string;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title,
  text,
  buttonText,
  className = ""
}) => {
  const { t } = useTranslation();
  const defaultButtonText = t("upgradeCard.defaultButtonText");
  return (
    <Card className={`border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-6 text-base">
          {text}
        </CardDescription>
        <Button asChild className="w-full sm:w-auto">
          <Link to={t("upgradeCard.pricing")}>
            {buttonText || defaultButtonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>);

};

export default UpgradeCard;