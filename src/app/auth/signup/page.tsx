import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account — ZECB",
  description: "Join ZECB and start building SaaS products in 72 hours.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the platform that ships SaaS in 72 hours."
    >
      <SignupForm />
    </AuthLayout>
  );
}
