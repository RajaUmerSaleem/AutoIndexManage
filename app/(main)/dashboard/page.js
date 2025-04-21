"use client";
import { useState, useEffect } from "react";
import PerformanceComparison from "@/app/components/BeforeAfter";
import IndexTypeChart from "@/app/components/indexDistribution";
import MostImprovedQueriesChart from "@/app/components/mostimprovedqueries";
import { Button } from "@/components/ui/button"; // Import Button if not already imported
import Link from "next/link";

export default function Home() {
  const [metrics, setMetrics] = useState({
    beforeTime: 850,
    afterTime: 150,
    improvement: 82.4,
    indexesCreated: 8,
    totalIndexes: 12,
    queryCount: 124,
    indexDistribution: {
      "B-tree": 65,
      Hash: 20,
      Bitmap: 10,
    },
    improvedQueries: [],
    comparisonData: {
      labels: [],
      beforeData: [],
      afterData: [],
    },
  });

  const [hasData, setHasData] = useState(true); // Track if we have query data

  const processMetrics = (queries, recommendations) => {
    const queryCount = queries.length;

    // Calculate index distribution
    const indexDistribution = {
      "B-tree": 0,
      Hash: 0,
      Bitmap: 0,
    };

    recommendations.forEach((rec) => {
      if (indexDistribution[rec.type] !== undefined) {
        indexDistribution[rec.type]++;
      } else {
        indexDistribution["B-tree"]++;
      }
    });

    // If no recommendations, set default values
    const hasRecommendations = recommendations.length > 0;

    const beforeTime = hasRecommendations
      ? Math.round(500 + Math.random() * 500) // Simulate before time
      : Math.round(500 + Math.random() * 500); // Default before time

    const improvementFactor = hasRecommendations
      ? 0.75 * (1 - Math.exp(-recommendations.length / 5)) // Improvement based on recommendations
      : 0; // No improvement if no recommendations

    const afterTime = Math.round(beforeTime * (1 - improvementFactor));
    const improvement = hasRecommendations
      ? ((beforeTime - afterTime) / beforeTime * 100).toFixed(1)
      : 0; // No improvement if no recommendations

    const comparisonData = {
      labels: [],
      beforeData: [],
      afterData: [],
    };

    queries.slice(0, 6).forEach((query, index) => {
      const queryText = query.query.substring(0, 25) + (query.query.length > 25 ? "..." : "");
      comparisonData.labels.push(queryText);

      const baseBefore = Math.round(500 + Math.random() * 800);
      comparisonData.beforeData.push(baseBefore);
      comparisonData.afterData.push(
        hasRecommendations ? Math.round(baseBefore * (0.2 + Math.random() * 0.3)) : baseBefore
      );
    });

    const improvedQueries = [];
    if (hasRecommendations) {
      for (let i = 0; i < Math.min(5, queries.length); i++) {
        const improvement = 95 - i * 5 - Math.round(Math.random() * 5);
        improvedQueries.push({
          query: `Query #${i + 1}`,
          improvement,
        });
      }
    }

    setMetrics({
      beforeTime,
      afterTime,
      improvement,
      indexesCreated: recommendations.length,
      totalIndexes: recommendations.length + 4, // Adjust this if needed
      queryCount,
      indexDistribution,
      improvedQueries,
      comparisonData,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setHasData(false);
          return;
        }

        // Fetch query logs from MongoDB
        const queryLogsResponse = await fetch("/api/data/queries", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!queryLogsResponse.ok) {
          setHasData(false);
          return;
        }

        const queries = await queryLogsResponse.json();
        queries.forEach((query) => {
          if (!query.executionTime) {
            query.executionTime = Math.round(500 + Math.random() * 500); // Simulate execution time
          }
        });

        // Fetch applied indexes from MongoDB
        const appliedIndexesResponse = await fetch(
          "/api/data/appliedIndexes",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!appliedIndexesResponse.ok) {
          setHasData(false);
          return;
        }

        const recommendations = await appliedIndexesResponse.json();

        if (queries.length === 0) {
          setHasData(false);
          return;
        }

        setHasData(true);

        // Process metrics
        processMetrics(queries, recommendations);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasData(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="w-5/6 h-full overflow-y-hidden overflow-x-hidden relative">
        {/* The No-Data Overlay */}
        {!hasData && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="text-center p-8 rounded-lg max-w-md">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Query Data Found
              </h2>
              <p className="text-gray-600 mb-6">
                To see performance metrics and recommendations, please
                upload query logs first.
              </p>
              <Link href="/query" passHref>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Go to Query Logs
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Your existing dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 mt-1 w-[98%] h-[17vh] m-auto">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Avg. Query Time Before
              </h3>
              <div className="text-red-500 bg-red-500/10 p-1 rounded text-xs font-medium">
                {metrics.beforeTime}ms
              </div>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.beforeTime}ms
            </p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on {metrics.queryCount} queries</span>
            </div>
          </div>
          {/* Rest of your existing metrics cards... */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Avg. Query Time After
              </h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">
                {metrics.afterTime}ms
              </div>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.afterTime}ms
            </p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on {metrics.queryCount} queries</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Performance Improvement
              </h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">
                {metrics.improvement}%
              </div>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.improvement}%
            </p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Avg. improvement</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Indexes Created
              </h3>
              <div className="text-amber-500 bg-amber-500/10 p-1 rounded text-xs font-medium">
                +{metrics.indexesCreated}
              </div>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.totalIndexes}
            </p>
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