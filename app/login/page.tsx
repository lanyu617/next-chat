'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState(''); // New state for password error
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/;
    if (!passwordRegex.test(pwd)) {
      setPasswordError('Password format: 6-20 characters, letters, numbers, and underscores only.'); // More concise for login
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setPasswordError('');

    if (!validatePassword(password)) {
      return; // Stop if password format is invalid
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Store JWT
        setMessage(data.message || 'Login successful!');
        router.push('/chat'); // Redirect to chat page after successful login
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">欢迎回来！</h1>
        <p className="text-center text-gray-600 mb-8">登录 NextChat 继续对话</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="用户名"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out text-lg"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value); // Real-time validation
            }}
            required
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>} {/* Error message */}
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-md hover:from-blue-600 hover:to-blue-700 transition duration-300 ease-in-out shadow-lg text-lg"
          >
            登录
          </button>
        </form>
        {message && <p className="mt-6 text-center text-red-500 font-medium">{message}</p>}
        <p className="mt-6 text-center text-gray-700 text-base">
          还没有账户？ <a href="/register" className="text-blue-600 hover:underline font-semibold">立即注册</a>
        </p>
      </div>
    </div>
  );
}
