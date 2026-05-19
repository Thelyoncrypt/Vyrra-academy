import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

/**
 * Sign-in (Clerk catch-all). PUBLIC by design: `getCurrentPrincipal()` is
 * never called here, so an unauthenticated visitor lands cleanly instead of
 * redirect-looping. Centered on the brand canvas; Clerk renders its own
 * accessible form inside.
 */
export const metadata: Metadata = {
  title: "Sign in — Vyrra Academy",
};

export default function SignInPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 py-16">
      <SignIn />
    </div>
  );
}
