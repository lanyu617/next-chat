'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Form } from 'antd';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryMessage = searchParams.get('message');
    if (queryMessage === 'expired') {
      setMessage('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/;
    if (!passwordRegex.test(pwd)) {
      setPasswordError('Password format: 6-20 characters, letters, numbers, and underscores only.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    setMessage('');
    setPasswordError('');
    setLoading(true);

    if (!validatePassword(password)) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 重要：包含 cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Login successful!');
        // 不再需要手动存储 token，Cookie 会自动管理
        router.push('/chat');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Login to NextChat</h1>
      <Form onFinish={handleLogin} className="flex flex-col gap-4 mt-8 w-80">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
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
            disabled={loading}
          />
        </Form.Item>
        {message && (
          <p className={`mt-4 text-center ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form.Item>
      </Form>
      <p className="mt-4">
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Register here
        </a>
      </p>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading login page...</div>}>
      <LoginContent />
    </Suspense>
  );
}
