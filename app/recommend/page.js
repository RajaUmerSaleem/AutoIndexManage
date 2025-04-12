"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRightIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

export default function Recommendations() {
  const [activeQueryTab, setActiveQueryTab] = useState("query1");
  const [appliedRecommendations, setAppliedRecommendations] = useState([]);
  
  // Sample query data
  const queries = {
    query1: {
      sql: "SELECT * FROM customers WHERE last_purchase_date > '2023-01-01' AND customer_status = 'active' ORDER BY customer_name",
      table: "customers",
      executionTime: "850ms",
      executionPlan: [
        { id: "sort", label: "Sort", description: "Sort by customer_name", cost: "150" },
        { id: "filter", label: "Filter", description: "last_purchase_date > '2023-01-01' AND customer_status = 'active'", cost: "700" },
        { id: "seq_scan", label: "Seq Scan", description: "customers", cost: "500" }
      ],
      recommendations: [
        { id: 1, type: "B-tree", table: "customers", columns: ["last_purchase_date"], improvement: 78, reason: "Improves WHERE clause filtering" },
        { id: 2, type: "Hash", table: "customers", columns: ["customer_status"], improvement: 45, reason: "Frequent equality comparisons on low-cardinality column" }
      ]
    },
    query2: {
      sql: "SELECT o.order_id, o.order_date, c.customer_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.amount > 1000",
      table: "orders, customers",
      executionTime: "1240ms",
      executionPlan: [
        { id: "hash_join", label: "Hash Join", description: "o.customer_id = c.customer_id", cost: "800" },
        { id: "seq_scan_orders", label: "Seq Scan", description: "orders WHERE amount > 1000", cost: "600" },
        { id: "hash", label: "Hash", description: "Build hash table from customers", cost: "400" },
        { id: "seq_scan_customers", label: "Seq Scan", description: "customers", cost: "300" }
      ],
      recommendations: [
        { id: 3, type: "B-tree", table: "orders", columns: ["customer_id"], improvement: 65, reason: "Improves join performance" },
        { id: 4, type: "B-tree", table: "orders", columns: ["amount"], improvement: 40, reason: "Improves range filter performance" },
        { id: 5, type: "Bitmap", table: "orders", columns: ["order_date"], improvement: 25, reason: "Good for range queries on dates with repeated values" }
      ]
    }
  };

  const handleApplyRecommendation = (recId) => {
    setAppliedRecommendations(prev => [...prev, recId]);
  };

  const isApplied = (recId) => appliedRecommendations.includes(recId);

  // Helper function to render execution plan nodes
  const renderExecutionPlanNode = (node, level = 0) => {
    return (
      <div key={node.id} className="ml-6 relative">
        <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700" 
             style={{ left: '-12px' }}></div>
        <div className="flex items-start mb-3 relative">
          <div className="absolute w-3 h-0 border-t-2 border-dashed border-zinc-200 dark:border-zinc-700" 
               style={{ left: '-12px', top: '12px' }}></div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border w-full">
            <div className="flex justify-between">
              <div className="font-medium">{node.label}</div>
              <div className="text-muted-foreground text-xs">Cost: {node.cost}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{node.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const activeQuery = queries[activeQueryTab];

  return (
    <div className="container mx-auto p-6 w-[98%] h-[98%] overflow-y-scroll ">
      <h1 className="text-3xl font-bold mb-4">Query Analysis & Index Recommendations</h1>
      <p className="text-muted-foreground mb-6">
        Analyze query execution plans and get intelligent index recommendations based on query patterns.
      </p>

      <Tabs defaultValue="query1" value={activeQueryTab} onValueChange={setActiveQueryTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="query1">Query #1</TabsTrigger>
          <TabsTrigger value="query2">Query #2</TabsTrigger>
        </TabsList>

        {Object.keys(queries).map(queryKey => (
          <TabsContent key={queryKey} value={queryKey} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SQL Query</CardTitle>
                <CardDescription>Table(s): {queries[queryKey].table}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {queries[queryKey].sql}
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-muted-foreground">Execution time: </span>
                  <Badge variant="outline" className="ml-2 text-red-500">{queries[queryKey].executionTime}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Query Execution Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Query Execution Plan</CardTitle>
                  <CardDescription>
                    Visual representation of how the query is executed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    {queries[queryKey].executionPlan.map(node => renderExecutionPlanNode(node))}
                  </div>
                </CardContent>
              </Card>

              {/* Index Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Index Recommendations</CardTitle>
                  <CardDescription>
                    Automatically generated index suggestions to improve query performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {queries[queryKey].recommendations.map(rec => (
                      <div key={rec.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center">
                              <span className="mr-2">
                                {rec.type === "B-tree" && "🌲"}
                                {rec.type === "Hash" && "🔢"}
                                {rec.type === "Bitmap" && "🗺️"}
                              </span>
                              Add {rec.type} Index on {rec.table}({rec.columns.join(", ")})
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {rec.reason}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-xs font-medium">Expected improvement:</span>
                              <div className={`ml-2 px-1.5 py-0.5 rounded text-xs ${rec.improvement > 50 ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                {rec.improvement}%
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={isApplied(rec.id) ? "outline" : "default"}
                            disabled={isApplied(rec.id)}
                            onClick={() => handleApplyRecommendation(rec.id)}
                            className="whitespace-nowrap"
                          >
                            {isApplied(rec.id) ? (
                              <><CheckCircle2Icon className="h-4 w-4 mr-1" /> Applied</>
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Understanding Index Types</CardTitle>
          <CardDescription>
            Different types of indexes are recommended based on query patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <span className="mr-2">🌲</span> B-Tree Index
              </h3>
              <p className="text-sm text-muted-foreground">
                General-purpose index structure ideal for columns used in range queries, sorting, and equality comparisons. Preferred for high-cardinality columns.
              </p>
              <div className="mt-2 text-sm">
                <strong>Best for:</strong>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Primary keys</li>
                  <li>Range queries (&gt;, &lt;, BETWEEN)</li>
                  <li>ORDER BY clauses</li>
                  <li>High-cardinality columns</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <span className="mr-2">🔢</span> Hash Index
              </h3>
              <p className="text-sm text-muted-foreground">
                Optimized for exact equality comparisons. Very fast for point queries but doesn't support range scans or ordering.
              </p>
              <div className="mt-2 text-sm">
                <strong>Best for:</strong>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Exact equality (=) comparisons</li>
                  <li>Foreign keys used in joins</li>
                  <li>Low-cardinality columns</li>
                  <li>IN clauses with discrete values</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <span className="mr-2">🗺️</span> Bitmap Index
              </h3>
              <p className="text-sm text-muted-foreground">
                Efficient for columns with a low number of distinct values. Stores a bitmap for each distinct value in the column.
              </p>
              <div className="mt-2 text-sm">
                <strong>Best for:</strong>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Low-cardinality columns (status, type)</li>
                  <li>Data warehouse environments</li>
                  <li>Multiple AND conditions</li>
                  <li>Columns with repeated values</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rule-Based Recommendation System</CardTitle>
          <CardDescription>
            How our system determines the optimal indexes for your queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Query Pattern Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  We analyze your query patterns to identify columns used in WHERE clauses, JOIN conditions, and ORDER BY statements.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Cardinality Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  For each column, we assess the number of distinct values (cardinality) to determine the most suitable index type.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Operation Type Matching</h3>
                <p className="text-sm text-muted-foreground">
                  We match operation types (=, &gt;, &lt;, BETWEEN) with appropriate index structures for optimal performance.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Impact Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Each recommendation includes an estimated performance improvement based on execution plan analysis and database statistics.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}