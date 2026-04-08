"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import { LoginForm } from "@/feature/auth/components/forms/login";

export default function TenantLoginPage() {
  const router = useRouter();
  const { tenant } = useParams<{ tenant: string }>();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  return <LoginForm tenant={tenant} />;
}
