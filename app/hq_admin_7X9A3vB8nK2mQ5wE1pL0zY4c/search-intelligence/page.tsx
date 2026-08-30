import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SearchIntelligenceClient from '@/components/admin/SearchIntelligenceClient';

// Helper to determine budget bucket
const getBudgetBucket = (budget: number) => {
    if (!budget) return 'Unknown';
    if (budget < 100000) return 'Under 100k';
    if (budget <= 150000) return '100k-150k';
    if (budget <= 200000) return '150k-200k';
    return '200k+';
};

export const metadata = {
    title: 'Search Intelligence | Admin Dashboard',
    description: 'Real-time student demand and market insights',
};

export default async function SearchIntelligencePage() {
    const supabase = await createClient();

    // Ensure user is authenticated and authorized (basic check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/auth/login');
    }

    // Fetch raw search logs (last 30 days would be ideal, fetching top 1000 for calculation here)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: rawLogs, error } = await supabase
        .from('search_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

    if (error || !rawLogs) {
        console.error('Error fetching search logs:', error);
        // We will pass undefined to let the client component fall back to MOCK_DATA
        return <SearchIntelligenceClient />;
    }

    // 1. Calculate Top-Level KPIs
    const totalSearches = rawLogs.length;

    // Calculate most demanded area
    const locationCounts: Record<string, number> = {};
    rawLogs.forEach(log => {
        // If location is provided, use it. Otherwise try to infer from search_term
        const term = log.search_term?.toLowerCase() || '';
        let loc = 'Unknown';
        if (term.includes('under-g') || term.includes('under g')) loc = 'Under-G';
        else if (term.includes('adenike')) loc = 'Adenike';
        else if (term.includes('takie')) loc = 'Takie';
        else if (term.includes('aroje')) loc = 'Aroje';
        else if (term.includes('stadium')) loc = 'Stadium';
        
        if (loc !== 'Unknown') {
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
    });

    let mostDemandedArea = 'N/A';
    let maxLocCount = 0;
    Object.entries(locationCounts).forEach(([loc, count]) => {
        if (count > maxLocCount) {
            maxLocCount = count;
            mostDemandedArea = loc;
        }
    });

    // Calculate Average Max Budget
    const logsWithBudget = rawLogs.filter(log => log.max_budget && log.max_budget > 0);
    const avgMaxBudget = logsWithBudget.length > 0 
        ? Math.round(logsWithBudget.reduce((sum, log) => sum + log.max_budget, 0) / logsWithBudget.length)
        : 0;

    // 2. Prepare Data for Charts
    
    // Top Locations (BarChart)
    const topLocations = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

    // Category Demand (PieChart)
    const categoryCounts: Record<string, number> = {};
    rawLogs.forEach(log => {
        const cat = log.category || 'Any';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryDemand = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .filter(c => c.name !== 'Any')
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Budget Distribution (AreaChart)
    const budgetBuckets = {
        'Under 100k': 0,
        '100k-150k': 0,
        '150k-200k': 0,
        '200k+': 0
    };
    
    logsWithBudget.forEach(log => {
        const bucket = getBudgetBucket(log.max_budget);
        if (bucket in budgetBuckets) {
            budgetBuckets[bucket as keyof typeof budgetBuckets]++;
        }
    });

    const budgetDistribution = [
        { name: 'Under 100k', count: budgetBuckets['Under 100k'] },
        { name: '100k-150k', count: budgetBuckets['100k-150k'] },
        { name: '150k-200k', count: budgetBuckets['150k-200k'] },
        { name: '200k+', count: budgetBuckets['200k+'] },
    ];

    // 3. Live Search Feed
    const recentSearches = rawLogs.slice(0, 50);

    const aggregatedData = {
        totalSearches,
        mostDemandedArea,
        avgMaxBudget,
        topLocations,
        categoryDemand,
        budgetDistribution,
        recentSearches
    };

    return <SearchIntelligenceClient data={aggregatedData} />;
}
