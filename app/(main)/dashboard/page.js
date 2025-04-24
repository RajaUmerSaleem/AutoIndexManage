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
  const normalizeId = (id) => {
    // Remove any suffix (e.g., "-0") from the ID for consistent matching
    return id.includes("-") ? id.split("-")[0] : id;
  };



  const [hasData, setHasData] = useState(true); // Track if we have query data

  const processMetrics = (queries, recommendations) => {
    if (!queries || !recommendations || queries.length === 0 || recommendations.length === 0) {
      console.error("Invalid or empty data provided to processMetrics.");
      setMetrics({
        beforeTime: 0,
        afterTime: 0,
        improvement: 0,
        indexesCreated: 0,
        totalIndexes: 0,
        queryCount: 0,
        indexDistribution: {
          "B-tree": 0,
          Hash: 0,
          Bitmap: 0,
        },
        comparisonData: {
          labels: [],
          beforeData: [],
          afterData: [],
        },
        improvedQueries: [],
      });
      return;
    }

    // Normalize IDs for matching
    const normalizedRecommendations = recommendations.map((rec) => ({
      ...rec,
      queryId: normalizeId(rec.queryId),
    }));

    const filteredQueries = queries.filter((query) => {
      return normalizedRecommendations.some((rec) => rec.queryId === normalizeId(query._id||query.id));
    });

    const queryCount = filteredQueries.length;

    if (queryCount === 0) {
      console.error("No matching queries found for recommendations.");
      setMetrics({
        beforeTime: 0,
        afterTime: 0,
        improvement: 0,
        indexesCreated: recommendations.length,
        totalIndexes: recommendations.length,
        queryCount: 0,
        indexDistribution: {
          "B-tree": 0,
          Hash: 0,
          Bitmap: 0,
        },
        comparisonData: {
          labels: [],
          beforeData: [],
          afterData: [],
        },
        improvedQueries: [],
      });
      return;
    }

    // Calculate index distribution
    const indexDistribution = {
      "B-tree": 0,
      Hash: 0,
      Bitmap: 0,
    };

    normalizedRecommendations.forEach((rec) => {
      if (indexDistribution[rec.type] !== undefined) {
        indexDistribution[rec.type]++;
      } else {
        indexDistribution["B-tree"]++;
      }
    });

    const comparisonData = {
      labels: [],
      beforeData: [],
      afterData: [],
    };

    const improvedQueries = [];

    // Process performance comparison for filtered queries
    filteredQueries.forEach((query) => {
      const queryText = query.query.substring(0, 25) + (query.query.length > 25 ? "..." : "");
      comparisonData.labels.push(queryText);

      const beforeTime = query.executionTime || Math.round(500 + Math.random() * 500);
      const afterTime = normalizedRecommendations.some((rec) => rec.queryId === normalizeId(query.id || query._id))
        ? Math.round(beforeTime * 0.7) // Simulate improvement for queries with indexes
        : beforeTime;

      comparisonData.beforeData.push(beforeTime);
      comparisonData.afterData.push(afterTime);

      improvedQueries.push({
        query: queryText,
        improvement: ((beforeTime - afterTime) / beforeTime) * 100,
      });
    });

 
    const beforeTime = comparisonData.beforeData.reduce((sum, time) => sum + time, 0) / queryCount;
    const afterTime = comparisonData.afterData.reduce((sum, time) => sum + time, 0) / queryCount;
    const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(1);

    setMetrics({
      beforeTime: Math.round(beforeTime),
      afterTime: Math.round(afterTime),
      improvement,
      indexesCreated: recommendations.length,
      totalIndexes: recommendations.length,
      queryCount,
      indexDistribution,
      comparisonData,
      improvedQueries,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Guest mode: Fetch data from localStorage
          const storedQueries = localStorage.getItem("queryLogs");
          const storedIndexes = localStorage.getItem("appliedIndexes");

          if (!storedQueries || !storedIndexes) {
            console.error("No data found in localStorage.");
            setHasData(false);
            return;
          }

          const queries = JSON.parse(storedQueries).map((query) => ({
            ...query,
            executionTime: parseInt(query.executionTime, 10), // Ensure executionTime is a number
          }));

          const recommendations = JSON.parse(storedIndexes);

          if (queries.length === 0 || recommendations.length === 0) {
            console.error("No valid data in localStorage.");
            setHasData(false);
            return;
          }

          console.log("Guest Mode - Queries:", queries);
          console.log("Guest Mode - Recommendations:", recommendations);

          setHasData(true);

          // Process metrics
          processMetrics(queries, recommendations);
          return;
        }

        // Logged-in mode: Fetch data from MongoDB
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

        const appliedIndexesResponse = await fetch("/api/data/appliedIndexes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!appliedIndexesResponse.ok) {
          setHasData(false);
          return;
        }

        const recommendations = await appliedIndexesResponse.json();

        console.log("MongoDB Mode - Queries:", queries);
        console.log("MongoDB Mode - Recommendations:", recommendations);

        if (queries.length === 0 || recommendations.length === 0) {
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
                Apply Indexes to your queries.
              </p>
              <Link href="/recommend" passHref>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Go to Recommendations
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