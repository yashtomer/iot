'use client';
import React, { PureComponent, useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subMonths } from 'date-fns';

interface HexDataRow {
  id: number;
  data: string;
  createdAt: string;
  device_identifier: string | null;
  data_type: string | null;
  function_type: string | null;
  number_of_bytes: number | null;
  '1byte_1st_sensor': string | null;
  '1byte_2nd_sensor': string | null;
  '1byte_3rd_sensor': string | null;
  '1byte_4th_sensor': string | null;
  '2byte_crc': number | null;
}

interface SensorData {
  name: string;
  value: number;
}

const SensorPieChart = ({ data, title }: { data: SensorData[], title: string }) => {
  const COLORS = ['#3b82f6', '#ef4444'];
  const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

  if (totalValue === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">No Data Found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent, value }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
            style={{ outline: 'none' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardPage = () => {
  const [rows, setRows] = useState<HexDataRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reloadToggle, setReloadToggle] = useState<boolean>(false);
  const limit = 10;
  const [isDark, setIsDark] = useState<boolean>(false);
  const [sensorData, setSensorData] = useState<SensorData[][]>([]);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 2));
  const [endDate, setEndDate] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0);

      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hex-data?page=${currentPage}&limit=${limit}&startDate=${formattedStartDate.toISOString()}&endDate=${formattedEndDate.toISOString()}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setRows(result.data as HexDataRow[]);
      setTotalItems(result.total ?? 0);
      setTotalPages(Math.max(1, Math.ceil((result.total ?? 0) / limit)));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSensorData = async () => {
    try {
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0);

      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hex-data/status-counts?startDate=${formattedStartDate.toISOString()}&endDate=${formattedEndDate.toISOString()}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSensorData(result);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchSensorData();
  }, [currentPage, reloadToggle]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleRefresh = () => {
    setReloadToggle((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      setIsDark(root.classList.contains('dark'));
    }
  }, []);

  const handleToggleTheme = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const next = !root.classList.contains('dark');
      root.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      setIsDark(next);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const query = searchTerm.toLowerCase();
    return rows.filter((row) =>
      (row.device_identifier ?? '').toLowerCase().includes(query) ||
      (row.data_type ?? '').toLowerCase().includes(query) ||
      (row.function_type ?? '').toLowerCase().includes(query)
    );
  }, [rows, searchTerm]);

  const formatDateTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    } catch {
      return '-';
    }
  };

  const formatSensorStatus = (status: string | null) => {
    if (status === '01') {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">On</span>;
    }
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Off</span>;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/aeologo.png" alt="Aeologic Logo" className="h-8 dark:invert" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Aeologic IOT Sensor Dashboard </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isDark ? (
                  <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM12 18a.75.75 0 00.75.75v2.25a.75.75 0 00-1.5 0v-2.25A.75.75 0 0012 18zM5.25 7.5a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V7.5zM18 12a.75.75 0 00.75.75h2.25a.75.75 0 000-1.5H18.75A.75.75 0 0018 12zM5.25 16.5a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0v-2.25zM18 7.5a.75.75 0 00.75-.75V4.5a.75.75 0 00-1.5 0v2.25a.75.75 0 00.75.75z" /></svg>
                ) : (
                  <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.472-.69a.75.75 0 11.582 1.365A10.47 10.47 0 0118 18a10.5 10.5 0 01-10.5-10.5c0-4.308 2.54-8.024 6.2-9.672a.75.75 0 01.819.162z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Device data = Sensor logs </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse and filter live IoT payloads.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-grow">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by device, type, or function..."
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:ring-blue-500/50"
                    />
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.204 2.452l-.334.333a.75.75 0 11-1.06-1.06l.333-.334a5.5 5.5 0 018.467-3.428V8.75a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h.396zM4.688 8.576a5.5 5.5 0 019.204-2.452l.334-.333a.75.75 0 111.06 1.06l-.333.334a5.5 5.5 0 01-8.467 3.428V11.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H4.688z" clipRule="evenodd" /></svg>
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Device Identifier</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Created At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Data Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Function</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Bytes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Sensor 1</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Sensor 2</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Sensor 3</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Sensor 4</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">CRC</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                      {isLoading ? (
                        Array.from({ length: limit }).map((_, idx) => (
                          <tr key={`skeleton-${idx}`} className="animate-pulse">
                            {Array.from({ length: 10 }).map((__, i) => (
                              <td key={i} className="px-6 py-4 whitespace-nowrap">
                                <div className="h-4 bg-slate-200 rounded dark:bg-slate-700"></div>
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : error ? (
                        <tr>
                          <td colSpan={10} className="text-center py-10">
                            <div className="text-red-500">Error: {error}</div>
                          </td>
                        </tr>
                      ) : filteredRows.length > 0 ? (
                        filteredRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-medium">{row.device_identifier ?? '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDateTime(row.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">{row.data_type ?? '-'}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">{row.function_type ?? '-'}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{row.number_of_bytes ?? '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatSensorStatus(row['1byte_1st_sensor'])}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatSensorStatus(row['1byte_2nd_sensor'])}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatSensorStatus(row['1byte_3rd_sensor'])}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatSensorStatus(row['1byte_4th_sensor'])}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">{row['2byte_crc'] ?? '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="text-center py-10 text-slate-500 dark:text-slate-400">No data found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Page {currentPage} of {totalPages} ({totalItems} items)</p>
                  <div className="inline-flex items-center gap-2">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Previous</button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Filters</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <DatePicker id="startDate" selected={startDate} onChange={(date) => date && setStartDate(date)} dateFormat="dd/MM/yyyy" className="px-2 cursor-pointer w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <DatePicker id="endDate" selected={endDate} onChange={(date) => date && setEndDate(date)} dateFormat="dd/MM/yyyy" className="px-2 cursor-pointer w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {sensorData.map((data, index) => (
                <SensorPieChart key={index} data={data} title={`Sensor ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
