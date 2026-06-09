'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (session?.user?.id) router.push(`/profile/${session.user.id}`);
  }, [session, status, router]);
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>Redirecting...</div>;
}
