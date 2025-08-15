
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
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  handicap: z.coerce.number().min(0).max(54).optional(),
})

export function SignUpForm() {
    const { toast } = useToast()
    const { signup, googleSignIn } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const lang = pathname.split('/')[1] || 'en'

    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      handicap: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signup(values.email, values.password, values.name, values.handicap)
      toast({
        title: "¡Bienvenido a TeeReserve!",
        description: "Tu cuenta ha sido creada exitosamente.",
      })
      router.push(`/${lang}/profile`)
      router.refresh();
    } catch (error) {
        console.error("Signup failed:", error)
        let description = "An unexpected error occurred. Please try again."
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/email-already-in-use":
              description = "This email is already in use. Please log in or use a different email.";
              break;
            case "auth/weak-password":
              description = "The password is too weak. Please choose a stronger password.";
              break;
            default:
              description = "Failed to create an account. Please try again.";
          }
        }
        toast({
            title: "Sign Up Failed",
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="handicap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handicap Index (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 12.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="flex flex-col gap-4">
        <div className="relative w-full">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR SIGN UP WITH</span>
        </div>
        <div className="grid grid-cols-1 gap-4 w-full">
            <Button variant="outline" onClick={handleGoogleSignIn}>Google</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
