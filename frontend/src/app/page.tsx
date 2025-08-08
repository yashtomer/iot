'use client';
import React, { useState, useEffect } from 'react';

interface HexDataRow {
  id: number;
  data: string;
  createdAt: string;
  device_identifier: string | null;
  data_type: string | null;
  function_type: string | null;
  number_of_bytes: number | null;
  '1byte_1st_sensor': number | null;
  '1byte_2nd_sensor': number | null;
  '1byte_3rd_sensor': number | null;
  '1byte_4th_sensor': number | null;
  '2byte_crc': number | null;
}

const DeviceDataTable = () => {
  const [rows, setRows] = useState<HexDataRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10; // Number of items per page

  useEffect(() => {
    console.log('useEffect is running');
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hex-data?page=${currentPage}&limit=${limit}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setRows(result.data as HexDataRow[]);
        setTotalPages(Math.ceil(result.total / limit));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
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
      <header className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Device Data Table
          </h1>
          <p className="text-gray-500 mt-2">
            Professional, responsive view of device payload fields and values.
          </p>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-white rounded-xl shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Device Data
            </h2>
            <p className="text-sm text-gray-500 mb-4">Decoded fields and sensor bytes</p>

            {error && <p className="text-red-500">Error: {error}</p>}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Identifier</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Bytes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor Data 1</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor Data 2</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor Data 3</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor Data 4</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRC</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.length > 0 ? (
                    rows.map((row: HexDataRow) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.device_identifier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.data_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.function_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.number_of_bytes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row['1byte_1st_sensor']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row['1byte_2nd_sensor']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row['1byte_3rd_sensor']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row['1byte_4th_sensor']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row['2byte_crc']}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">Loading data...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default DeviceDataTable;
