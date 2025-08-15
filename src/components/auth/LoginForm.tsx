
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { FirebaseError } from "firebase/app"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const { login, googleSignIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const lang = pathname.split('/')[1] || 'en'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.email, values.password)
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      })
      router.push(`/${lang}/profile`)
      router.refresh(); // Forces a refresh to update user state across the app
    } catch (error) {
       console.error("Login failed:", error)
       let description = "An unexpected error occurred. Please try again."
       if (error instanceof FirebaseError) {
         switch (error.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                description = "Invalid email or password. Please try again.";
                break;
            default:
                description = "Failed to log in. Please check your credentials.";
         }
       }
       toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      })
    }
  }

  async function handleGoogleSignIn() {
    try {
      await googleSignIn();
      toast({
        title: "¡Bienvenido a TeeReserve!",
        description: "Has iniciado sesión correctamente.",
      });
      router.push(`/${lang}/profile`);
      router.refresh();
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      toast({
        title: "Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  }


  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="relative w-full">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR CONTINUE WITH</span>
        </div>
        <div className="grid grid-cols-1 gap-4 w-full">
            <Button variant="outline" onClick={handleGoogleSignIn}>Google</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
