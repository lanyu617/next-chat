'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form } from 'antd'; // Import Ant Design components

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  const handleLogin = async () => {
    setMessage('');
    setPasswordError('');

    if (!validatePassword(password)) {
      return;
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
        localStorage.setItem('token', data.token);
        setMessage(data.message || 'Login successful!');
        router.push('/chat');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Login to NextChat</h1>
      <Form onFinish={handleLogin} className="flex flex-col gap-4 mt-8 w-80">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your Password!' },
            () => ({
              validator(_, value) {
                if (!value || validatePassword(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(passwordError || 'Password format is invalid.'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
          />
        </Form.Item>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Login
          </Button>
        </Form.Item>
      </Form>
      <p className="mt-4">
        Don&apos;t have an account? <a href="/register" className="text-blue-500 hover:underline">Register here</a>
      </p>
    </div>
  );
}
