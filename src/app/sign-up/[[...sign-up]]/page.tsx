import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

/**
 * Sign-up (Clerk catch-all). PUBLIC by design — see the sign-in route note.
 * Open enrollment (v1 scope: no cohorts/billing), so anyone may register.
 */
export const metadata: Metadata = {
  title: "Create account — Vyrra Academy",
};

export default function SignUpPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 py-16">
      <SignUp />
    </div>
  );
}
