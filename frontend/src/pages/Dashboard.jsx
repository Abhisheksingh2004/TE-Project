import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, Scatter, ScatterChart
} from 'recharts';

const Dashboard = () => {
  const [indiaData, setIndiaData] = useState([]);
  const [worldData, setWorldData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2000');
  const [selectedView, setSelectedView] = useState('india');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchIndia = fetch('/data/india.csv').then(res => res.text());
        const fetchWorld = fetch('/data/world.csv').then(res => res.text());
        const [indiaText, worldText] = await Promise.all([fetchIndia, fetchWorld]);

        const parseCSV = (csvText) => {
          const [headers, ...rows] = csvText.trim().split('\n');
          const keys = headers.split(',');
          return rows.map(row => {
            const values = row.split(',');
            return keys.reduce((obj, key, i) => {
              let value = values[i].replace(/["\n\r]/g, '');
              if (!isNaN(value)) value = parseFloat(value);
              obj[key.trim()] = value;
              return obj;
            }, {});
          });
        };

        setIndiaData(parseCSV(indiaText));
        setWorldData(parseCSV(worldText));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const getYearData = (data, year) => data.filter(item => item.Year === parseInt(year));

  const getConsumptionTrend = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const year = item.Year;
      if (!acc[year]) acc[year] = { Year: year, total: 0 };
      acc[year].total += selectedView === 'india'
        ? parseFloat(item['Energy Consumption (MU)']) * 0.001 // Convert MU to TWh
        : parseFloat(item['Electricity Consumption (TWh)']);
      return acc;
    }, {});
    return Object.values(groupedData).sort((a, b) => a.Year - b.Year);
  };

  return (
    <div className="max-w-[90rem] mx-auto p-6 space-y-6">
      {/* Controls */}
      <div className="bg-gray-900 p-4 rounded-2xl flex gap-4">
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-md"
        >
          <option value="india">India</option>
          <option value="world">World</option>
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded-md"
        >
          {[...new Set((selectedView === 'india' ? indiaData : worldData)
            .map(item => item.Year))]
            .sort()
            .map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
        </select>
      </div>

      {/* Energy Consumption Trend */}
      <div className="bg-gray-900 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-white">
          Energy Consumption Trend Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getConsumptionTrend(selectedView === 'india' ? indiaData : worldData)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Year" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Energy Consumption (TWh)"
              stroke="#8884d8"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Comparison */}
      <div className="bg-gray-900 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-white">
          {selectedView === 'india' ? 'State-wise' : 'Country-wise'} Energy Consumption ({selectedYear})
        </h2>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={getYearData(selectedView === 'india' ? indiaData : worldData, selectedYear)}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" stroke="#ccc" />
            <YAxis
              type="category"
              dataKey={selectedView === 'india' ? 'State' : 'Country'}
              width={150}
              stroke="#ccc"
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={selectedView === 'india' ? 'Energy Consumption (MU)' : 'Electricity Consumption (TWh)'}
              fill="#82ca9d"
              name="Energy Consumption (TWh)"
              tickFormatter={value => selectedView === 'india' ? (value * 0.001).toFixed(2) : value.toFixed(2)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Population vs Energy Consumption */}
      <div className="bg-gray-900 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-white">
          Population vs Energy Consumption ({selectedYear})
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={getYearData(selectedView === 'india' ? indiaData : worldData, selectedYear)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Population" stroke="#ccc" />
            <YAxis
              dataKey={selectedView === 'india' ? 'Energy Consumption (MU)' : 'Electricity Consumption (TWh)'}
              stroke="#ccc"
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedView === 'india' ? 'Energy Consumption (MU)' : 'Electricity Consumption (TWh)'}
              stroke="#8884d8"
              dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
