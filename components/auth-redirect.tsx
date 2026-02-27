"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Wraps children and redirects authenticated (non-anonymous) users
 * to /program. Shows nothing while checking auth to avoid flash.
 */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isAnonymous, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && !isAnonymous) {
      router.replace("/program");
    } else {
      setChecked(true);
    }
  }, [user, isAnonymous, loading, router]);

  if (!checked) return null;
  return <>{children}</>;
}
