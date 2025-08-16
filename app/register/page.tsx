'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState(''); // New state for password error
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/;
    if (!passwordRegex.test(pwd)) {
      setPasswordError('Password must be 6-20 characters long and contain only letters, numbers, and underscores.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setPasswordError('');

    if (!validatePassword(password)) {
      return; // Stop if password format is invalid
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        router.push('/login'); // Redirect to login page after successful registration
      } else {
        setMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">加入 NextChat</h1>
        <p className="text-center text-gray-600 mb-8">创建你的新账户</p>
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="选择一个用户名"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out text-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="设置你的密码"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out text-lg"
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
            className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-md hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out shadow-lg text-lg"
          >
            注册
          </button>
        </form>
        {message && <p className="mt-6 text-center text-red-500 font-medium">{message}</p>}
        <p className="mt-6 text-center text-gray-700 text-base">
          已经有账户？ <a href="/login" className="text-green-600 hover:underline font-semibold">立即登录</a>
        </p>
      </div>
    </div>
  );
}
