'use client';
import React, { useState, useRef, useEffect } from 'react';

const QueryPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [queries, setQueries] = useState([]);
  const [isGuest, setIsGuest] = useState(true); // Track if the user is a guest
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetching queries
  const fileInputRef = useRef(null);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsGuest(false); // User is logged in
      fetchQueriesFromMongoDB(token); // Fetch queries from MongoDB
    } else {
      setIsGuest(true); // Guest mode
      // Load queries from localStorage for guest users
      const storedQueries = localStorage.getItem('queryLogs');
      if (storedQueries) {
        setQueries(JSON.parse(storedQueries));
      }
    }
  }, []);

  const fetchQueriesFromMongoDB = async (token) => {
    setIsLoading(true); // Start loading
    try {
      const response = await fetch('/api/data/queries', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setQueries(data); // Set queries from MongoDB
      } else {
        console.error('Failed to fetch queries:', data.message);
      }
    } catch (error) {
      console.error('Error fetching queries from MongoDB:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleClearAll = async () => {
    if (isGuest) {
      // Clear queries from localStorage for guest users
      localStorage.removeItem('queryLogs');
      setQueries([]);
    } else {
      // Clear queries from MongoDB for logged-in users
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/data/queries', {
          method: 'DELETE', // Use DELETE method to clear all queries
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setQueries([]); // Clear queries from state
        } else {
          console.error('Failed to clear queries:', data.message);
        }
      } catch (error) {
        console.error('Error clearing queries from MongoDB:', error);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileExt = file.name.split('.').pop().toLowerCase();

      if (fileExt === 'txt' || fileExt === 'csv') {
        handleFiles(file);
      } else {
        alert('Please upload only .txt or .csv files');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFiles(file);
    }
  };

  const handleFiles = (file) => {
    setFileName(file.name);

    // Read file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      const lines = content.split('\n').filter((line) => line.trim());

      // Create query objects
      const newQueries = lines.map((query, index) => ({
        id: `${Date.now()}-${index}`, // Ensure unique key
        query: query.trim(),
        timestamp: new Date().toISOString(),
        fileName: file.name,
      }));

      // Handle data based on user mode
      if (isGuest) {
        // Guest Mode: Save to localStorage
        const updatedQueries = [...queries, ...newQueries];
        setQueries(updatedQueries);
        localStorage.setItem('queryLogs', JSON.stringify(updatedQueries));
      } else {
        // Logged-In Mode: Save to MongoDB
        for (const query of newQueries) {
          await saveQueryToMongoDB(query);
        }
        setQueries((prev) => [...prev, ...newQueries]);
      }

      simulateUpload(file);
    };
    reader.readAsText(file);
  };

  const saveQueryToMongoDB = async (query) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/data/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(query),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to save query to MongoDB:', data.message);
      }
    } catch (error) {
      console.error('Error saving query to MongoDB:', error);
    }
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload with progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-5/6 flex flex-col h-[98%] mt-0.5">
      {/* Fixed height upload section */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm mb-2 w-[98%] m-auto">
        <h2 className="text-lg font-semibold mb-4">Upload Query Logs</h2>
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors hover:border-purple-500 ${
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.csv"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mb-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="text-lg font-medium mb-1">
              {fileName ? `Selected: ${fileName}` : 'Drag and drop query log files'}
            </p>
            <p className="text-gray-500 mb-4">Only .txt and .csv files are supported</p>
            <button
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              Select Query Log
            </button>
          </div>
        </div>

        {isUploading && (
          <div className="w-[98%] m-auto">
            <div className="flex items-center ">
              <div className="w-full bg-gray-200 rounded-full h-2 ">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300 "
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable query table section */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col w-[98%] m-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Query Logs</h2>
          {queries.length > 0 && (
            <button
              className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading queries...</p>
          </div>
        ) : queries.length > 0 ? (
          <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queries.map((item, index) => (
                  <tr key={item.id || `${item.timestamp}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.query}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No query logs available. Upload a file to see the queries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;