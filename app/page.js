import Image from "next/image";
import PerformanceComparison from "./components/BeforeAfter";
import IndexTypeChart from "./components/indexDistribution";
import MostImprovedQueriesChart from "./components/mostimprovedqueries";
export default function Home() {
  return (
    <>
      <div className="w-5/6 h-full ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1 mt-1 w-[98%] m-auto h-[17vh]">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Avg. Query Time Before</h3>
              <div className="text-red-500 bg-red-500/10 p-1 rounded text-xs font-medium">850ms</div>
            </div>
            <p className="text-2xl font-bold mt-1">850ms</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on 124 queries</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Avg. Query Time After</h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">150ms</div>
            </div>
            <p className="text-2xl font-bold mt-1">150ms</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Based on 124 queries</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Performance Improvement</h3>
              <div className="text-green-500 bg-green-500/10 p-1 rounded text-xs font-medium">82.4%</div>
            </div>
            <p className="text-2xl font-bold mt-1">82.4%</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Avg. improvement</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[17vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Indexes Created</h3>
              <div className="text-amber-500 bg-amber-500/10 p-1 rounded text-xs font-medium">+8</div>
            </div>
            <p className="text-2xl font-bold mt-1">12</p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Total optimized indexes</span>
            </div>
          </div>
        </div>
        <div className="w-[98%] m-auto h-[40vh]">
        <PerformanceComparison  />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-[98%] m-auto h-[40vh] mt-1">
          <IndexTypeChart />
          <MostImprovedQueriesChart />
        </div>
      </div>
    </>
  );
}
