"use client";

import { useEffect } from "react";
import { restoreUserData } from "@/lib/sync/restore";
import { createClient } from "@/lib/supabase/client";
import { flushSyncQueue } from "@/lib/sync/progressQueue";

export function RestoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      await restoreUserData();
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        await flushSyncQueue(data.session.access_token);
      }
    })();

    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session) {
        await restoreUserData();
        await flushSyncQueue(session.access_token);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
