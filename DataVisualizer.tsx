import React from 'react';
import { LocationData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface Props {
  data: LocationData[];
  comparisonData?: LocationData[]; // For counterfactuals
  title: string;
}

export const DataVisualizer: React.FC<Props> = ({ data, comparisonData, title }) => {
  // Merge data if comparison exists
  const chartData = data.map(d => {
    const comp = comparisonData?.find(c => c.id === d.id);
    return {
      name: d.name,
      Population: d.population,
      Wages: d.wages,
      Rents: d.rents,
      // Add comparison fields if they exist
      ...(comp ? {
        'Pop (CF)': comp.population,
        'Wages (CF)': comp.wages,
        'Rents (CF)': comp.rents
      } : {})
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Population Chart */}
        <div className="h-64">
          <p className="text-sm font-medium text-slate-500 text-center mb-2">Population Distribution (L)</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="Population" fill="#6366f1" radius={[4, 4, 0, 0]} />
              {comparisonData && <Bar dataKey="Pop (CF)" fill="#94a3b8" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wage vs Rent Gradient */}
        <div className="h-64">
           <p className="text-sm font-medium text-slate-500 text-center mb-2">Wages (w) vs Rents (r)</p>
           <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="Rents" name="Rent" unit="$" label={{ value: 'Rent', position: 'bottom', offset: 0 }} />
              <YAxis type="number" dataKey="Wages" name="Wage" unit="$" label={{ value: 'Wage', angle: -90, position: 'left' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Baseline" data={chartData} fill="#8884d8" shape="circle" />
              {comparisonData && <Scatter name="Counterfactual" data={chartData} fill="#82ca9d" shape="cross" line />}
            </ScatterChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Productivity (A)</th>
              <th className="px-4 py-2">Amenity (u)</th>
              <th className="px-4 py-2">Population</th>
              <th className="px-4 py-2">Wages</th>
              <th className="px-4 py-2">Rents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 font-medium">{row.name}</td>
                <td className="px-4 py-2">{row.productivity.toFixed(2)}</td>
                <td className="px-4 py-2">{row.amenity.toFixed(2)}</td>
                <td className="px-4 py-2">{Math.round(row.population)}</td>
                <td className="px-4 py-2">${row.wages.toFixed(2)}</td>
                <td className="px-4 py-2">${row.rents.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
