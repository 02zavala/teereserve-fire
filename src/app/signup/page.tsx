import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold text-primary">Create an Account</h1>
                <p className="mt-2 text-muted-foreground">Join TeeTime Concierge to book your perfect round.</p>
            </div>
            <SignUpForm />
             <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    </div>
  );
}
