import Link from "next/link";
import { EmptyHouseIcon } from "@/components/ui/AnimatedIcons";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <EmptyHouseIcon size={96} className="mb-6" />
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        We couldn't find the space you're looking for. It might have been moved or no longer exists.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[#16a34a] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
