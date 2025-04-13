"use client";
import { useState, useEffect } from "react";
import PerformanceComparison from "./components/BeforeAfter";
import IndexTypeChart from "./components/indexDistribution";
import MostImprovedQueriesChart from "./components/mostimprovedqueries";

export default function Home() {
  const [metrics, setMetrics] = useState({
    beforeTime: 850,
    afterTime: 150,
    improvement: 82.4,
    indexesCreated: 8,
    totalIndexes: 12,
    queryCount: 124,
    indexDistribution: {
      'B-tree': 65,
      'Hash': 20,
      'Bitmap': 10,
      'GIN': 3,
      'BRIN': 2
    },
    improvedQueries: [],
    comparisonData: {
      labels: [],
      beforeData: [],
      afterData: []
    }
  });

  useEffect(() => {
    // Load data from localStorage
    const storedQueries = localStorage.getItem('queryLogs');
    const appliedRecommendations = localStorage.getItem('appliedRecommendations');
    
    if (storedQueries) {
      const queries = JSON.parse(storedQueries);
      const recommendations = appliedRecommendations ? JSON.parse(appliedRecommendations) : [];
      
      // Calculate metrics based on actual data
      const queryCount = queries.length;
      
      // Calculate index distribution
      const indexDistribution = {
        'B-tree': 0,
        'Hash': 0,
        'Bitmap': 0,
        'GIN': 0,
        'BRIN': 0
      };
      
      // Count the types of applied indexes
      recommendations.forEach(rec => {
        if (indexDistribution[rec.type] !== undefined) {
          indexDistribution[rec.type]++;
        } else {
          indexDistribution['B-tree']++; // Default if unknown
        }
      });
      
      // Add some defaults if no recommendations yet
      if (recommendations.length === 0) {
        indexDistribution['B-tree'] = 65;
        indexDistribution['Hash'] = 20;
        indexDistribution['Bitmap'] = 10;
        indexDistribution['GIN'] = 3;
        indexDistribution['BRIN'] = 2;
      }
      
      // For demonstration, we'll calculate a simulated improvement
      const beforeTime = Math.round(500 + Math.random() * 500);
      
      // Improvement percentage based on number of recommendations applied
      const improvementFactor = recommendations.length > 0 ? 
        0.75 * (1 - Math.exp(-recommendations.length / 5)) : 0.1;
      
      const afterTime = Math.round(beforeTime * (1 - improvementFactor));
      const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(1);
      
      // Generate data for the performance comparison chart
      const comparisonData = {
        labels: [],
        beforeData: [],
        afterData: []
      };
      
      // Use actual queries for the chart data
      queries.slice(0, 6).forEach((query, index) => {
        // Extract query for label (truncate if too long)
        const queryText = query.query.substring(0, 25) + (query.query.length > 25 ? '...' : '');
        comparisonData.labels.push(queryText);
        
        // Generate before/after times
        const baseBefore = 500 + Math.random() * 800;
        comparisonData.beforeData.push(Math.round(baseBefore));
        comparisonData.afterData.push(Math.round(baseBefore * (0.2 + Math.random() * 0.3)));
      });
      
      // If we don't have enough queries, add placeholder data
      if (comparisonData.labels.length === 0) {
        comparisonData.labels = [
          'SELECT * FROM customers',
          'JOIN orders, customers',
          'SELECT COUNT(*) GROUP BY',
          'Complex JOIN with subquery',
          'SELECT with ORDER BY',
          'WHERE with multiple conditions'
        ];
        comparisonData.beforeData = [850, 1240, 920, 1650, 780, 1100];
        comparisonData.afterData = [150, 320, 180, 410, 130, 240];
      }
      
      // Generate most improved queries data
      const improvedQueries = [];
      for (let i = 0; i < Math.min(5, queries.length); i++) {
        const improvement = 95 - (i * 5) - Math.round(Math.random() * 5);
        improvedQueries.push({
          query: `Query #${i + 1}`,
          improvement
        });
      }
      
      // If we don't have enough queries, use placeholder data
      if (improvedQueries.length === 0) {
        improvedQueries.push(
          { query: 'Query #1', improvement: 94 },
          { query: 'Query #2', improvement: 88 },
          { query: 'Query #3', improvement: 82 },
          { query: 'Query #4', improvement: 75 },
          { query: 'Query #5', improvement: 68 }
        );
      }
      
      setMetrics({
        beforeTime,
        afterTime,
        improvement,
        indexesCreated: recommendations.length,
        totalIndexes: recommendations.length + 4, // Assuming 4 existing indexes
        queryCount,
        indexDistribution,
        improvedQueries,
        comparisonData
      });
    }
  }, []);

  return (
    <>
      <div className="w-5/6 h-full overflow-y-hidden overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 mt-1 w-[98%] h-[17vh] m-auto">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Avg. Query Time Before</h3>
              <div className="text-red-500 bg-red-500/10 p-1 rounded text-xs font-medium">{metrics.beforeTime}ms</div>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.beforeTime}ms</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on {metrics.queryCount} queries</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Avg. Query Time After</h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">{metrics.afterTime}ms</div>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.afterTime}ms</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on {metrics.queryCount} queries</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Performance Improvement</h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">{metrics.improvement}%</div>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.improvement}%</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Avg. improvement</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Indexes Created</h3>
              <div className="text-amber-500 bg-amber-500/10 p-1 rounded text-xs font-medium">+{metrics.indexesCreated}</div>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalIndexes}</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Total optimized indexes</span>
            </div>
          </div>
        </div>
        <div className="w-[98%] h-[40vh] m-auto">
          <PerformanceComparison data={metrics.comparisonData} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-[98%] h-[35vh] mt-1 m-auto">
          <IndexTypeChart distribution={metrics.indexDistribution} />
          <MostImprovedQueriesChart queries={metrics.improvedQueries} />
        </div>
      </div>
    </>
  );
}