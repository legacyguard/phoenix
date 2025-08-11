import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  loading = "lazy",
  priority = false,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use Intersection Observer for truly lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before the image enters viewport
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, loading]);

  // Handle image loading
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image errors with fallback
  const handleError = () => {
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      setIsLoading(false);
      onError?.();
    }
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc: string) => {
    // If it's already a full URL or data URL, don't modify it
    if (baseSrc.startsWith("http") || baseSrc.startsWith("data:")) {
      return undefined;
    }

    // Generate multiple sizes for responsive loading
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    const srcSetParts = sizes.map((size) => {
      const url = baseSrc.replace(/\.[^.]+$/, `-${size}w$&`);
      return `${url} ${size}w`;
    });

    return srcSetParts.join(", ");
  };

  // Determine WebP support
  const supportsWebP = () => {
    if (typeof window === "undefined") return false;

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("image/webp") === 0;
  };

  // Convert image URL to WebP if supported
  const getOptimizedSrc = (originalSrc: string) => {
    if (!supportsWebP() || originalSrc.includes(".svg")) {
      return originalSrc;
    }

    // If it's a local image and not already WebP, try WebP version
    if (!originalSrc.startsWith("http") && !originalSrc.endsWith(".webp")) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    }

    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(imageSrc);

  return (
    <div className={cn("relative", className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className,
          )}
          srcSet={generateSrcSet(optimizedSrc)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          {...props}
        />
      )}

      {/* Invisible placeholder for lazy loading */}
      {!isInView && <div ref={imgRef} className={cn("invisible", className)} />}
    </div>
  );
};

// Picture component for art direction and format selection
interface OptimizedPictureProps {
  sources: Array<{
    srcSet: string;
    media?: string;
    type?: string;
  }>;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export const OptimizedPicture: React.FC<OptimizedPictureProps> = ({
  sources,
  alt,
  className,
  loading = "lazy",
  priority = false,
}) => {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <OptimizedImage
        src={sources[sources.length - 1].srcSet}
        alt={alt}
        className={className}
        loading={loading}
        priority={priority}
      />
    </picture>
  );
};
