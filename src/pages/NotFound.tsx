import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">{t('notfound.title')}</h2>
        <p className="text-muted-foreground max-w-md">
          {t('notfound.description')}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {t('notfound.goHome')}
          </Link>
        </Button>
        <Button asChild variant="outline" onClick={() => window.history.back()}>
          <button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('notfound.goBack')}
          </button>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
