"use client";

import { useEffect } from "react";
import { ErrorIcon } from "@/components/ui/AnimatedIcons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <ErrorIcon size={96} className="mb-6" />
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Something went wrong!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        An unexpected error occurred while trying to load this space. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#16a34a] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}
