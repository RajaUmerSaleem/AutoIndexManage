"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MostImprovedQueriesChart = () => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Chart configuration
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Query #1', 'Query #2', 'Query #3', 'Query #4', 'Query #5'],
        datasets: [{
          label: 'Performance Improvement',
          data: [94, 88, 82, 75, 68],
          backgroundColor: 'rgba(139, 92, 246, 0.8)', // violet
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.x}% faster`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
    
    // Clean up the chart when component unmounts
    return () => chart.destroy();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Improved Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default MostImprovedQueriesChart;