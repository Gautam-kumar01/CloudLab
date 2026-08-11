import { auth, signOut } from "@/auth";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { deleteUserAccount } from "@/app/actions/user";

export default async function Settings() {
  const session = await auth();
  
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <nav className="flex justify-between items-center" style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <Link href="/dashboard" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff' }}>CL</Link>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</span>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ display: 'flex', flex: 1, padding: '48px 32px', maxWidth: '800px', margin: '0 auto', width: '100%', flexDirection: 'column', gap: '32px' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Profile & Account</h1>
        
        <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Profile Information</h2>
          <div className="flex items-center" style={{ gap: '24px', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%' }} />
              ) : (
                session.user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{session.user?.name || 'Developer'}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{session.user?.email}</p>
            </div>
          </div>
          
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }} className="hover:bg-[var(--border-color)]">
              Sign out of CloudLab
            </button>
          </form>
        </div>

        <div style={{ padding: '24px', background: 'rgba(255, 95, 86, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 95, 86, 0.3)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ff5f56', marginBottom: '8px' }}>Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <form action={deleteUserAccount}>
            <button type="submit" style={{ padding: '8px 16px', background: '#ff5f56', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }} className="hover:opacity-80">
              Delete Account
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
