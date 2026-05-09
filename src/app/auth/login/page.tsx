import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — ZECB",
  description: "Sign in to your ZECB account and continue building.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue building your SaaS products."
    >
      <LoginForm />
    </AuthLayout>
  );
}
