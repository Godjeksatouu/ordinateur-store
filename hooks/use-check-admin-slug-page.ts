"use client";

import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { useEffect, useState } from "react";

export function useCheckAdminSlugPage() {
  const params = useParams();
  const { pageSlug } = params;
  const [res, setRes] = useState({ loading: true, isValid: false, pageSlug });
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/settings/admin-page?page=${pageSlug}`,
      );

      setRes((p) => ({ ...p, loading: false, isValid: response.ok }));

      !response.ok && router.replace("/");

      return response.ok;
    })();
  }, []);

  return res;
}
