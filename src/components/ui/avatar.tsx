import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props}>
      {children}
    </div>
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <span
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ 
  className, 
  src,
  alt,
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  );
};
