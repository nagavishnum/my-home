'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { isLoggedIn, setLoginData } from '@/lib/auth';
import { useGlobalApiLoading } from '@/lib/hooks';

export default function LoginPage() {
  const router = useRouter();

  const [u, setU] = useState('');
  const [p, setP] = useState('');

  const [error, setError] = useState('');
  const isApiLoading = useGlobalApiLoading();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function onSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');

    const username = u.trim();
    const password = p.trim();

    if (!username || !password) {
      setError(
        'Username and password are required'
      );

      return;
    }

    try {
      const res = await api.post(
        '/auth/login',
        {
          u: username,
          p: password
        }
      );

      const token = res?.data?.token;
      const user = res?.data?.username;

      if (!token) {
        setError('Invalid server response');

        return;
      }

      setLoginData(token,user);

      router.replace('/dashboard');
    } catch (e: unknown) {
      let msg = 'Login failed';

      if (
        typeof e === 'object' &&
        e &&
        'response' in e
      ) {
        const err = e as {
          response?: {
            data?: {
              error?: string;
            };
          };
        };

        msg =
          err.response?.data?.error || msg;
      }

      setError(msg);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <form
        className='form'
        onSubmit={onSubmit}
        style={{
          width: 340,
          flexDirection: 'column',
          alignItems: 'stretch',
          border: '1px solid #e5e5e5',
          padding: 24,
          borderRadius: 12
        }}
      >
        <h2 style={{ marginBottom: 10 }}>
          Login
        </h2>

        <div className='field'>
          <label>Username</label>

          <input
            value={u}
            onChange={(e) =>
              setU(e.target.value)
            }
            placeholder='Enter username'
            autoComplete='username'
          />
        </div>

        <div className='field'>
          <label>Password</label>

          <input
            type='password'
            value={p}
            onChange={(e) =>
              setP(e.target.value)
            }
            placeholder='Enter password'
            autoComplete='current-password'
          />
        </div>

        {error ? (
          <p className='error'>
            {error}
          </p>
        ) : null}

        <button
          className='btn-primary'
          disabled={isApiLoading}
        >
          {isApiLoading
            ? 'Loading...'
            : 'Login'}
        </button>
      </form>
    </div>
  );
}