import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold text-primary">Welcome Back</h1>
                <p className="mt-2 text-muted-foreground">Log in to manage your bookings and reviews.</p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    </div>
  );
}
