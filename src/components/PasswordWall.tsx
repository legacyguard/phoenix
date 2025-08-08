import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePasswordWall } from './auth/PasswordWallContext';

const PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'legacy1guard';

interface PasswordWallProps {
  children: React.ReactNode;
}

export default function PasswordWall({ children }: PasswordWallProps) {
const { t, ready } = useTranslation('auth');
  const { t: tMicro } = useTranslation('micro-copy');
  const { setPasswordWallAuthenticated } = usePasswordWall();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  console.log('PasswordWall render - ready:', ready, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    // Always start with authentication required
    // No localStorage persistence for security
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === PASSWORD) {
      setIsAuthenticated(true);
      setPasswordWallAuthenticated(true);
      // Don't store authentication state - session only
    } else {
      setError(t('passwordWall.incorrectPassword'));
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordWallAuthenticated(false);
    setPassword('');
    setError('');
  };

  // Show loading state while i18n not ready
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse">{t("passwordWall.loading")}</div>
      </div>);
  }

  // Show protected content if authenticated
  if (isAuthenticated) {
    return (
      <>
        {/* Logout button positioned in top-right corner */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
            title={tMicro('tooltips.passwordWall.logout')}
            aria-label={tMicro('accessibility.labels.close')}
          >
            <LogOut className="h-4 w-4" />
            {t('passwordWall.logout')}
          </Button>
        </div>
        {children}
      </>
    );
  }

  // Show password form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
      <CardTitle className="text-2xl">{t('passwordWall.title')}</CardTitle>
      <CardDescription>
        {t('passwordWall.description')}
      </CardDescription>
      <p className="text-sm text-muted-foreground mt-2">
        {tMicro('tooltips.passwordWall.security')}
      </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordWall.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordWall.enterPassword')}
                aria-label={tMicro('accessibility.descriptions.required')}
                autoFocus
                required />

            </div>
            
            {error &&
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            }
            
            <Button type="submit" className="w-full" size="lg">
              {t('passwordWall.accessApplication')}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {tMicro('tooltips.passwordWall.session')}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>);
}