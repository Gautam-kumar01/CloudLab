'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col h-screen w-full justify-center items-center" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--accent-orange)', boxShadow: '0 10px 40px rgba(255, 106, 0, 0.2)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-orange)', marginBottom: '16px', fontWeight: 'bold' }}>SYSTEM_FAILURE</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
          A fatal exception has occurred at module load. <br/>
          Error: {error.message}
        </p>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 20px', background: 'var(--accent-orange)', color: '#000', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
        >
          [ REBOOT_SYSTEM ]
        </button>
      </div>
    </div>
  );
}
