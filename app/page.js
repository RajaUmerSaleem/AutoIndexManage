'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    toast.info('Logging in... Please wait.', { autoClose: 2000 });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);

      // Notify user about data syncing
      toast.info('Syncing your data to the server...', { autoClose: false });

      // Sync query logs from localStorage to MongoDB
      const storedLogs = localStorage.getItem('queryLogs');
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
        for (const log of logs) {
          await fetch('/api/data/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify(log),
          });
        }
        localStorage.removeItem('queryLogs'); // Clear localStorage after syncing
      }

      // Sync recommended indexes from localStorage to MongoDB
      localStorage.removeItem('appliedIndexes'); // Clear localStorage after syncing
    

      // Notify user that syncing is complete
      toast.success('Data synced successfully! Redirecting to dashboard...', { autoClose: 2000 });

      router.push('/dashboard');
    } else {
      toast.error(data.message, { autoClose: 3000 });
    }
  };

  const handleSkip = () => {
    router.push('/dashboard'); // Redirect to the dashboard without login
    toast.info("You are logged in as a guest. All Features are same but your data will be in your localStorage.");
  };

  const handleRegister = () => {
    router.push('/register'); 
    toast.info("You are redirected to the registration page.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Skip Login
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleRegister}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}