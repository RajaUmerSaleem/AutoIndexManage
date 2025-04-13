"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, CheckCircle2Icon, XCircleIcon, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function Recommendations() {
  const [activeQueryTab, setActiveQueryTab] = useState("");
  const [appliedRecommendations, setAppliedRecommendations] = useState([]);
  const [queriesData, setQueriesData] = useState({});
  const [queryKeys, setQueryKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const queriesPerPage = 5; 

  useEffect(() => {
    setIsLoading(true);
    
    // Load previously applied recommendations
    
    const storedQueries = localStorage.getItem('queryLogs');
    if (storedQueries) {
      const parsedQueries = JSON.parse(storedQueries);
      // Process and generate recommendations for each query
      const processedData = {};
      const keys = [];
      
      parsedQueries.forEach((query, index) => {
        const queryId = `query${index + 1}`;
        keys.push(queryId);
        
        // Generate synthetic execution plan and recommendations based on query text
        const { executionPlan, recommendations, tables } = analyzeQuery(query.query);
        
        processedData[queryId] = {
          sql: query.query,
          table: tables.join(', '),
          executionTime: `${Math.round(500 + Math.random() * 1000)}ms`,
          timestamp: query.timestamp,
          fileName: query.fileName,
          executionPlan,
          recommendations
        };
      });
      
      setQueriesData(processedData);
      setQueryKeys(keys);
      
      if (keys.length > 0) {
        setActiveQueryTab(keys[0]);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Analyze query to generate execution plan and recommendations
  const analyzeQuery = (queryText) => {
    const query = queryText.toLowerCase();
    const tables = extractTables(query);
    const hasJoin = query.includes('join');
    const hasWhere = query.includes('where');
    const hasOrderBy = query.includes('order by');
    const hasGroupBy = query.includes('group by');
    
    // Generate execution plan
    const executionPlan = [];
    let cost = 100;
    
    if (hasOrderBy) {
      const sortColumn = extractOrderByColumns(query);
      executionPlan.unshift({ 
        id: "sort", 
        label: "Sort", 
        description: `Sort by ${sortColumn}`, 
        cost: `${cost}`
      });
      cost += 150;
    }
    
    if (hasGroupBy) {
      const groupByColumn = extractGroupByColumns(query);
      executionPlan.unshift({ 
        id: "groupby", 
        label: "Group By", 
        description: `Group by ${groupByColumn}`, 
        cost: `${cost}`
      });
      cost += 200;
    }
    
    if (hasWhere) {
      const whereConditions = extractWhereConditions(query);
      executionPlan.unshift({ 
        id: "filter", 
        label: "Filter", 
        description: whereConditions, 
        cost: `${cost}`
      });
      cost += 200;
    }
    
    if (hasJoin) {
      const joinTables = extractJoinTables(query);
      executionPlan.unshift({ 
        id: "hash_join", 
        label: "Hash Join", 
        description: joinTables, 
        cost: `${cost}`
      });
      cost += 300;
      
      tables.forEach((table, idx) => {
        executionPlan.push({ 
          id: `seq_scan_${table}`, 
          label: "Seq Scan", 
          description: table, 
          cost: `${Math.round(cost / (idx + 1.5))}`
        });
      });
    } else {
      tables.forEach(table => {
        executionPlan.push({ 
          id: `seq_scan_${table}`, 
          label: "Seq Scan", 
          description: table, 
          cost: `${Math.round(cost / 2)}`
        });
      });
    }
    
    // Generate recommendations
    const recommendations = [];
    let recId = 1;
    
    if (hasWhere) {
      const whereColumns = extractWhereColumns(query);
      whereColumns.forEach(col => {
        // Determine column cardinality (estimation)
        const isLowCardinality = estimateCardinality(col.column);
        
        // Determine best index type based on operator and cardinality
        let indexType;
        let reason;
        
        if (col.operator === '=') {
          // For equality operations
          indexType = isLowCardinality ? "Bitmap" : "Hash";
          reason = isLowCardinality 
            ? "Low-cardinality column with equality filter - bitmap provides compact storage" 
            : "Frequent equality comparisons - hash index provides O(1) lookups";
        } else if (col.operator === 'like') {
          indexType = "B-tree";
          reason = "Pattern matching queries benefit from B-tree indexes";
        } else {
          // For range operations (>, <, >=, <=)
          indexType = "B-tree";
          reason = "Range-based filtering - B-tree supports efficient range scans";
        }
        
        const improvement = Math.round(40 + Math.random() * 40);
        recommendations.push({
          id: recId++,
          type: indexType,
          table: col.table || tables[0],
          columns: [col.column],
          improvement,
          reason: reason,
          operator: col.operator,
          sql: generateCreateIndexSQL(indexType, col.table || tables[0], [col.column])
        });
      });
    }
    
    if (hasJoin) {
      const joinColumns = extractJoinColumns(query);
      joinColumns.forEach(join => {
        const improvement = Math.round(50 + Math.random() * 30);
        recommendations.push({
          id: recId++,
          type: "B-tree",
          table: join.table1,
          columns: [join.column1],
          improvement,
          reason: "Improves join performance"
        });
        
        if (Math.random() > 0.5) {
          recommendations.push({
            id: recId++,
            type: "B-tree",
            table: join.table2,
            columns: [join.column2],
            improvement: improvement - Math.round(Math.random() * 10),
            reason: "Improves join performance on secondary table"
          });
        }
      });
    }
    
    if (hasOrderBy) {
      const orderColumns = extractOrderByColumns(query).split(',').map(c => c.trim());
      const improvement = Math.round(30 + Math.random() * 30);
      recommendations.push({
        id: recId++,
        type: "B-tree",
        table: tables[0],
        columns: orderColumns,
        improvement,
        reason: "Improves ORDER BY performance"
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        id: recId++,
        type: "B-tree",
        table: tables[0],
        columns: ["id"],
        improvement: 35,
        reason: "General improvement for primary key lookups"
      });
    }
    
    return {
      executionPlan,
      recommendations,
      tables
    };
  };
  
  // Helper extraction functions
  const extractTables = (query) => {
    const fromMatch = query.match(/from\s+([a-z0-9_,\s]+)(?:\s+where|\s+group|\s+order|\s+limit|$)/i);
    if (!fromMatch) return ['unknown_table'];
    
    const tablesStr = fromMatch[1];
    return tablesStr.split(',').map(t => {
      // Handle table aliases like "customers c"
      const parts = t.trim().split(/\s+/);
      return parts[0].trim();
    });
  };
  
  const extractWhereConditions = (query) => {
    const whereMatch = query.match(/where\s+(.+?)(?:\s+group|\s+order|\s+limit|$)/i);
    if (!whereMatch) return "unknown conditions";
    return whereMatch[1];
  };
  
  const extractWhereColumns = (query) => {
    const whereMatch = query.match(/where\s+(.+?)(?:\s+group|\s+order|\s+limit|$)/i);
    if (!whereMatch) return [];
    
    const conditions = whereMatch[1];
    const columnMatches = conditions.split(/and|or/i).map(condition => {
      const match = condition.match(/([a-z0-9_]+)\.?([a-z0-9_]+)?\s*(=|>|<|>=|<=|!=|like|in)\s*.+/i);
      if (match) {
        if (match[2]) {
          // Format: table.column
          return { table: match[1], column: match[2], operator: match[3] };
        } else {
          // Format: just column
          return { table: null, column: match[1], operator: match[3] };
        }
      }
      return null;
    }).filter(Boolean);
    
    return columnMatches;
  };
  
  const extractOrderByColumns = (query) => {
    const orderByMatch = query.match(/order\s+by\s+(.+?)(?:\s+limit|$)/i);
    if (!orderByMatch) return "unknown column";
    return orderByMatch[1];
  };
  
  const extractGroupByColumns = (query) => {
    const groupByMatch = query.match(/group\s+by\s+(.+?)(?:\s+having|\s+order|\s+limit|$)/i);
    if (!groupByMatch) return "unknown column";
    return groupByMatch[1];
  };
  
  const extractJoinTables = (query) => {
    const joinMatch = query.match(/join\s+([a-z0-9_]+)\s+(?:as\s+)?([a-z0-9_]+)?\s+on\s+(.+?)(?:\s+where|\s+group|\s+order|\s+limit|$)/i);
    if (!joinMatch) return "unknown join condition";
    return joinMatch[3];
  };
  
  const extractJoinColumns = (query) => {
    const joinMatches = [];
    const joinRegex = /join\s+([a-z0-9_]+)\s+(?:as\s+)?([a-z0-9_]+)?\s+on\s+([a-z0-9_]+)\.([a-z0-9_]+)\s*=\s*([a-z0-9_]+)\.([a-z0-9_]+)/ig;
    
    let match;
    while (match = joinRegex.exec(query)) {
      const joinTable = match[1];
      const joinAlias = match[2] || match[1];
      const leftTable = match[3];
      const leftColumn = match[4];
      const rightTable = match[5];
      const rightColumn = match[6];
      
      joinMatches.push({
        table1: leftTable,
        column1: leftColumn,
        table2: rightTable,
        column2: rightColumn
      });
    }
    
    return joinMatches;
  };

  // Add a helper function to estimate column cardinality
  // This would normally be based on database statistics - here we're using a simple heuristic
  const estimateCardinality = (columnName) => {
    const lowCardinalityPatterns = [
      'status', 'type', 'category', 'gender', 'priority', 'state', 
      'active', 'enabled', 'flag', 'role', 'level', 'tier', 'color'
    ];
    
    // Force some common ID patterns to high cardinality
    if (/(_id|id|_key|key|code|num|number)$/i.test(columnName)) {
      return false; // Not low cardinality
    }
    
    return lowCardinalityPatterns.some(pattern => 
      columnName.toLowerCase().includes(pattern));
  };

  // Generate SQL for creating the index
  const generateCreateIndexSQL = (type, table, columns) => {
    const columnList = columns.join(', ');
    const indexName = `idx_${table}_${columns.join('_')}`;
    
    let sql = `CREATE INDEX ${indexName} ON ${table} (${columnList})`;
    
    if (type === "Hash") {
      sql += " USING HASH";
    } else if (type === "Bitmap") {
      sql += " USING BITMAP"; 
    }
    
    return sql;
  };

  const handleApplyRecommendation = (recId, queryKey) => {
    // Debugging: Check what type of index this recommendation is
    const recommendation = queriesData[queryKey].recommendations.find(rec => rec.id === recId);
    console.log(`Applying index: ${recommendation.type} on ${recommendation.table}.${recommendation.columns}`);
    console.log(`Operator detected: ${recommendation.operator}`);
    console.log(`SQL: ${recommendation.sql}`);
    // First add to the UI state
    setAppliedRecommendations(prev => [...prev, recId]);
  
    if (!recommendation) return;
    
    // Create a record of the applied recommendation
    const appliedRec = {
      id: recId,
      type: recommendation.type,
      table: recommendation.table,
      columns: recommendation.columns,
      improvement: recommendation.improvement,
      queryId: queryKey,
      query: queriesData[queryKey].sql,
      appliedAt: new Date().toISOString(),
      sql: recommendation.sql
    };
    
    // Store in localStorage
    const existingApplied = JSON.parse(localStorage.getItem('appliedRecommendations') || '[]');
    existingApplied.push(appliedRec);
    localStorage.setItem('appliedRecommendations', JSON.stringify(existingApplied));
    
    // Optional: Show a success message or toast notification
    alert(`Index applied successfully: ${recommendation.sql}`);
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

  // Add this function for pagination calculation
  const paginatedQueryKeys = () => {
    const startIndex = currentPage * queriesPerPage;
    return queryKeys.slice(startIndex, startIndex + queriesPerPage);
  };

  // Add these functions to handle pagination
  const nextPage = () => {
    if ((currentPage + 1) * queriesPerPage < queryKeys.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 w-5/6 h-[98%] overflow-y-scroll">
      <h1 className="text-3xl font-bold mb-4">Query Analysis & Index Recommendations</h1>
      <p className="text-muted-foreground mb-6">
        Analyze query execution plans and get intelligent index recommendations based on your uploaded query patterns.
      </p>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">Loading query data...</div>
          </CardContent>
        </Card>
      ) : queryKeys.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No queries found in the database.</p>
            <p className="text-sm">Please upload query logs in the Query Logs section first.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/query'}>
              Go to Query Logs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center mb-2 justify-between">
              <h2 className="text-lg font-medium">Queries ({queryKeys.length})</h2>
              {queryKeys.length > queriesPerPage && (
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {Math.ceil(queryKeys.length / queriesPerPage)}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextPage}
                    disabled={(currentPage + 1) * queriesPerPage >= queryKeys.length}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              )}
            </div>

            <Tabs 
              defaultValue={activeQueryTab} 
              value={activeQueryTab} 
              onValueChange={setActiveQueryTab}
            >
              <TabsList className="w-full border-b pb-px mb-4">
                {paginatedQueryKeys().map((queryKey, index) => {
                  const globalIndex = currentPage * queriesPerPage + index;
                  return (
                    <TabsTrigger 
                      key={queryKey} 
                      value={queryKey}
                      className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-b-none px-4"
                    >
                      Query #{globalIndex + 1}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {queryKeys.map((queryKey) => (
                <TabsContent key={queryKey} value={queryKey} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SQL Query</CardTitle>
                      <CardDescription>Table(s): {queriesData[queryKey].table}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                        {queriesData[queryKey].sql}
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <span className="text-muted-foreground">Execution time: </span>
                        <Badge variant="outline" className="ml-2 text-red-500">
                          {queriesData[queryKey].executionTime}
                        </Badge>
                        <span className="ml-4 text-muted-foreground">Source: </span>
                        <Badge variant="outline" className="ml-2">
                          {queriesData[queryKey].fileName}
                        </Badge>
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
                          {queriesData[queryKey].executionPlan.map(node => renderExecutionPlanNode(node))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Index Recommendations */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Index Recommendations</CardTitle>
                          <CardDescription>
                            Automatically generated index suggestions
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {queriesData[queryKey].recommendations.map(rec => (
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
                                  onClick={() => handleApplyRecommendation(rec.id, queryKey)}
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
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Understanding Index Types</CardTitle>
              <CardDescription>
                Different types of indexes are recommended based on query patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Keep the rest of your existing content */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Your existing index type explanations */}
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
        </>
      )}
    </div>
  );
}