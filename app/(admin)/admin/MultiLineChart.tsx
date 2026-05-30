'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MultiLineChartProps {
  data: {
    name: string;
    penggunaBaru: number;
    ulasan: number;
    favorit: number;
  }[];
}

export default function MultiLineChart({ data }: MultiLineChartProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 w-full" style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
      width: '100%'
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>
        Tren Aktivitas Mingguan
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            {/* CartesianGrid: horizontal lines only, thin gray */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            
            {/* XAxis: no axis line, no tick line */}
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dy={10}
            />
            
            {/* YAxis: no axis line, no tick line */}
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dx={-10}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
            />
            
            {/* Garis 1: Pengguna Baru (Hijau Cerah #10b981) */}
            <Line 
              type="monotone" 
              dataKey="penggunaBaru" 
              name="Pengguna Baru"
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            {/* Garis 2: Favorit Baru (Merah Muda/Merah #f43f5e) */}
            <Line 
              type="monotone" 
              dataKey="favorit" 
              name="Favorit Baru"
              stroke="#f43f5e" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            {/* Garis 3: Ulasan Baru (Kuning/Oranye #f59e0b) */}
            <Line 
              type="monotone" 
              dataKey="ulasan" 
              name="Ulasan Baru"
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
