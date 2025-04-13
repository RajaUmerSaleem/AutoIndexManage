"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PerformanceComparison = ({ data = null }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Use provided data or fallback to defaults
    const labels = data?.labels || [
      'SELECT * FROM customers',
      'JOIN orders, customers',
      'SELECT COUNT(*) GROUP BY', 
      'Complex JOIN with subquery',
      'SELECT with ORDER BY',
      'WHERE with multiple conditions'
    ];
    
    const beforeData = data?.beforeData || [850, 1240, 920, 1650, 780, 1100];
    const afterData = data?.afterData || [150, 320, 180, 410, 130, 240];
    
    // Chart configuration
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Before Indexing (ms)',
          data: beforeData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }, {
          label: 'After Indexing (ms)',
          data: afterData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // green
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (context.parsed.y !== null) {
                  label = `${label}: ${context.parsed.y}ms`;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              callback: function(value, index) {
                const label = this.getLabelForValue(value);
                // Truncate long query text
                return label.length > 15 ? label.substr(0, 15) + '...' : label;
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Execution Time (ms)'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          }
        }
      }
    });
    
    // Clean up the chart when component unmounts
    return () => chart.destroy();
  }, [data]);

  return (
    <Card className="h-[40vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Performance Comparison</CardTitle>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-muted-foreground">Before Indexing</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-muted-foreground">After Indexing</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1">
            <div className="h-[30vh]">
                <canvas ref={chartRef}></canvas>
            </div>
        </CardContent>
    </Card>
  );
};

export default PerformanceComparison;