import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEPT_COLORS = ['#0F766E', '#2563EB', '#7C3AED', '#D97706', '#DC2626'];

export default function DepartmentHeadcountChart({ data }) {
  const chartData = data.map(item => ({
    name: item.dept,
    value: item.count
  }));

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <PieChart>
          <Pie 
            data={chartData} 
            dataKey="value" 
            nameKey="name" 
            innerRadius={60} 
            outerRadius={90} 
            paddingAngle={2}
            cx="50%"
            cy="50%"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconSize={10} 
            iconType="circle"
            wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
