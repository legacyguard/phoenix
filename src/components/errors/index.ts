// Main error components
export { default as EmpatheticErrorBoundary } from "./EmpatheticErrorBoundary";
export {
  default as EmpatheticFormError,
  InlineEmpatheticError,
} from "./EmpatheticFormError";
export { default as EmotionalRecoverySupport } from "./EmotionalRecoverySupport";
export { default as ProgressiveErrorRecovery } from "./ProgressiveErrorRecovery";
export {
  default as ProactiveErrorPrevention,
  FormFieldWithPrevention,
  UploadWithPrevention,
} from "./ProactiveErrorPrevention";

// Error handling hooks
export * from "@/hooks/useEmpatheticError";

// Utility functions
export * from "@/utils/error-logging";
export * from "@/utils/support";
