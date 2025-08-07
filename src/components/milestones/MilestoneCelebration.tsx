import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, Sparkles, Trophy, Star, Heart, Shield, 
  Users, ChevronRight, X, Zap, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Milestone } from '@/services/progressiveDisclosure';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onClose: () => void;
  onContinue?: () => void;
  userProgress?: {
    completedItems: number;
    totalItems: number;
  };
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onClose,
  onContinue,
  userProgress
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti for major and mega milestones
    if (milestone.celebrationType !== 'minor') {
      setShowConfetti(true);
      const duration = milestone.celebrationType === 'mega' ? 3000 : 1500;
      const particleCount = milestone.celebrationType === 'mega' ? 200 : 100;
      
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#86BC25', '#F5E6D3', '#FFD700']
      });

      // Additional confetti bursts for mega celebrations
      if (milestone.celebrationType === 'mega') {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      }
    }
  }, [milestone.celebrationType]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (milestone.id) {
      case 'first-asset':
        return <Star className="h-8 w-8 text-yellow-500" />;
      case 'foundation-complete':
        return <Target className="h-8 w-8 text-green-500" />;
      case 'trusted-circle-created':
        return <Shield className="h-8 w-8 text-blue-500" />;
      case 'will-completed':
        return <Award className="h-8 w-8 text-purple-500" />;
      case 'advanced-planning':
        return <Trophy className="h-8 w-8 text-yellow-600" />;
      default:
        return <Sparkles className="h-8 w-8 text-warm-sage" />;
    }
  };

  const getCelebrationColor = () => {
    switch (milestone.celebrationType) {
      case 'mega':
        return 'from-yellow-400 via-orange-400 to-red-400';
      case 'major':
        return 'from-blue-400 via-purple-400 to-pink-400';
      default:
        return 'from-green-400 via-emerald-400 to-teal-400';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg"
          >
            <Card className={cn(
              "relative overflow-hidden border-2",
              milestone.celebrationType === 'mega' && "border-yellow-400 shadow-2xl shadow-yellow-400/20",
              milestone.celebrationType === 'major' && "border-purple-400 shadow-xl shadow-purple-400/20",
              milestone.celebrationType === 'minor' && "border-green-400 shadow-lg shadow-green-400/20"
            )}>
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-br",
                getCelebrationColor()
              )} />
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="text-center space-y-4 relative">
                {/* Animated icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    delay: 0.2,
                    damping: 10,
                    stiffness: 100
                  }}
                  className="mx-auto"
                >
                  <div className={cn(
                    "p-4 rounded-full inline-flex",
                    "bg-gradient-to-br",
                    getCelebrationColor()
                  )}>
                    {getIcon()}
                  </div>
                </motion.div>

                {/* Milestone icon and title */}
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl"
                  >
                    {milestone.icon}
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">
                    {milestone.name}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative">
                {/* Achievement message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-2"
                >
                  <p className="text-lg font-medium">
                    {milestone.message}
                  </p>
                  <p className="text-muted-foreground">
                    {milestone.familyBenefit}
                  </p>
                </motion.div>

                {/* Family impact */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-warm-sage/10 rounded-lg p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-warm-sage" />
                    <span className="font-medium">Family Impact</span>
                  </div>
                  <p className="text-sm">
                    Your family is now <span className="font-semibold">{milestone.improvementDescription}</span>
                  </p>
                </motion.div>

                {/* New features unlocked */}
                {milestone.newFeatures.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>New Features Unlocked:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {milestone.newFeatures.map((feature, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="bg-warm-sage/20 text-warm-sage border-warm-sage/30"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Progress indicator */}
                {userProgress && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">
                        {userProgress.completedItems} / {userProgress.totalItems} completed
                      </span>
                    </div>
                    <Progress 
                      value={(userProgress.completedItems / userProgress.totalItems) * 100}
                      className="h-2"
                    />
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3"
                >
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Celebrate Later
                  </Button>
                  <Button
                    className="flex-1 bg-warm-sage hover:bg-warm-sage/90"
                    onClick={() => {
                      handleClose();
                      onContinue?.();
                    }}
                  >
                    Continue Journey
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Smaller celebration for minor milestones
export const MiniMilestoneCelebration: React.FC<{
  message: string;
  onClose: () => void;
}> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50"
    >
      <Card className="border-green-400 shadow-lg">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-full bg-green-100">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Nice work! 🎉</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
