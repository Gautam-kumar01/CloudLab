'use client';

export default function Loading() {
  return (
    <div className="flex flex-col h-screen w-full justify-center items-center" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-green)', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', letterSpacing: '1px' }}>
          LOADING_MODULE...
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
