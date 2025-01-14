import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function ChartProfit({ data, title }) {
  const chartData = data.time_steps.map((step, idx) => {
    return {
      step,
      profit: data.profit_series[idx]
    };
  });

  return (
    <div style={{ margin: "10px" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>
        {title || "Profit Over Time"}
      </h3>
      <LineChart
        width={350}
        height={220}
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 5
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#888" 
        />
        <XAxis 
          dataKey="step" 
          stroke="#ccc" 
        />
        <YAxis 
          stroke="#ccc" 
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#FF8042"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </div>
  );
}
