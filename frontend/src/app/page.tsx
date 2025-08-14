'use client';
import React, { PureComponent, useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const COLORS = ['#0088FE', '#FF8042'];
  const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

  if (totalValue === 0) {
    return (
      <div className="w-full h-64 flex flex-col">
        {/* Title on top */}
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 text-center">
          {title}
        </h3>

        {/* Center "No Data Found" */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">No data found for this time period</p>
        </div>
      </div>

    );
  }

  return (
    <div className="w-full h-64">
      <h3 className="text-center text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h3>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent, value }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
            style={{ outline: 'none' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
  const limit = 10; // Number of items per page
  const [isDark, setIsDark] = useState<boolean>(false);
  const [sensorData, setSensorData] = useState<SensorData[][]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hex-data?page=${currentPage}&limit=${limit}`;
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

    fetchData();
  }, [currentPage, reloadToggle]);

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
      console.log('Sensor Data:', result);
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
    fetchSensorData();
  }, [reloadToggle]);

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
    // sync toggle state with current DOM theme
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
  }, []);

  const handleToggleTheme = () => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const next = !root.classList.contains('dark');
    root.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
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
      return 'On';
    }
    if (status === '00') {
      return 'Off';
    }
    return 'Off';
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Device Data Table',
    description: 'Structured device data for identifier CA0000000023 including sensor bytes and CRC.',
    identifier: 'CA0000000023',
    keywords: ['Device Data Table', 'IoT', 'Sensors', 'CRC'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Device Data
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Live IoT payloads with typed fields, sensor bytes, and CRC.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search device, type, or function"
                  className="w-72 rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 shadow-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-slate-800"
                />
              </div>
              <button
                onClick={handleToggleTheme}
                aria-label="Toggle theme"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {isDark ? (
                  // Sun icon
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  // Moon icon
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:bg-slate-900/90 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 15.5-6.5L21 7" />
                  <path d="M21 7v-4h-4" />
                  <path d="M21 12a9 9 0 0 1-15.5 6.5L3 17" />
                  <path d="M3 17v4h4" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 mb-8">
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Sensor Status Overview</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">On/Off status for each sensor over the selected period.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">From</label>
                  <DatePicker selected={startDate} onChange={(date) => date && setStartDate(date)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 shadow-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-slate-800 cursor-pointer" dateFormat={"dd/MM/yyyy"} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">To</label>
                  <DatePicker selected={endDate} onChange={(date) => date && setEndDate(date)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 shadow-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-slate-800 cursor-pointer" dateFormat={"dd/MM/yyyy"} />
                </div>
                <button
                  onClick={fetchSensorData}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 active:bg-slate-900/90 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
                >
                  Submit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {sensorData && sensorData.length > 0 ? (
                  sensorData.map((data, index) => (
                    <SensorPieChart key={index} data={data} title={`Sensor ${index + 1}`} />
                  ))
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">No data to display.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Decoded fields and sensor bytes</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Search, sort, and browse payloads confidently.</p>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200">
                Error: {error}
              </div>
            )}

            <div className="overflow-x-auto p-6">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-800">
                    <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-800">Device Identifier</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Data Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Function Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Bytes</th>
                    <th className="px-4 py-3 text-left font-semibold">Sensor 1</th>
                    <th className="px-4 py-3 text-left font-semibold">Sensor 2</th>
                    <th className="px-4 py-3 text-left font-semibold">Sensor 3</th>
                    <th className="px-4 py-3 text-left font-semibold">Sensor 4</th>
                    <th className="px-4 py-3 text-left font-semibold">CRC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoading && (
                    Array.from({ length: 10 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`} className="animate-pulse">
                        {Array.from({ length: 10 }).map((__, i) => (
                          <td key={i} className="px-4 py-3">
                            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}

                  {!isLoading && filteredRows.length > 0 && (
                    filteredRows.map((row: HexDataRow, index) => (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50 dark:bg-slate-900/20'} hover:bg-slate-50/80 dark:hover:bg-slate-800/40`}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.device_identifier ?? '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{formatDateTime(row.createdAt)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/30">{row.data_type ?? '-'}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30">{row.function_type ?? '-'}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">{row.number_of_bytes ?? '-'}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800 dark:text-slate-200">{formatSensorStatus(row['1byte_1st_sensor'])}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800 dark:text-slate-200">{formatSensorStatus(row['1byte_2nd_sensor'])}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800 dark:text-slate-200">{formatSensorStatus(row['1byte_3rd_sensor'])}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800 dark:text-slate-200">{formatSensorStatus(row['1byte_4th_sensor'])}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-800 dark:text-slate-200">{row['2byte_crc'] ?? '-'}</td>
                      </tr>
                    ))
                  )}

                  {!isLoading && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
                {totalItems > 0 && (
                  <span className="ml-2">• {totalItems} total</span>
                )}
              </div>
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Next
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
