"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IndexTypeChart = () => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Chart configuration
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['B-Tree', 'Hash', 'GIN', 'BRIN', 'GiST'],
        datasets: [{
          data: [65, 20, 8, 5, 2],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // blue
            'rgba(99, 102, 241, 0.8)', // indigo
            'rgba(139, 92, 246, 0.8)',  // violet
            'rgba(168, 85, 247, 0.8)',  // purple
            'rgba(217, 70, 239, 0.8)'   // fuchsia
          ],
          hoverBackgroundColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(217, 70, 239, 1)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${percentage}%`;
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
        <CardTitle>Index Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexTypeChart;