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
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Register for NextChat</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-8">
        <input
          type="text"
          placeholder="Username"
          className="p-2 border border-gray-300 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value); // Real-time validation
          }}
          required
        />
        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>} {/* Error message */}
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded"
        >
          Register
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      <p className="mt-4">
        Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
      </p>
    </div>
  );
}
