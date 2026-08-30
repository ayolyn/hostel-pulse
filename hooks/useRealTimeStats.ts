"use client";

import { useQuery } from "@tanstack/react-query";

// Mock API Call
const fetchDashboardStats = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data that could "change" (randomized for demo effect if desired, but static is safer for stability)
    return {
        messages: 5,
        listings: {
            live: 4,
            pending: 2,
            incomplete: 1
        },
        stats: {
            views: 2543,
            inspectionRequests: 18
        }
    };
};

export function useRealTimeStats() {
    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardStats,
        refetchInterval: 30000, // 30 seconds auto-refresh
    });
}
