
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/data";
import { User } from "firebase/auth";
import type { UserProfile } from "@/types";
import { updateProfile } from "firebase/auth";
import { Loader2 } from "lucide-react";


interface ProfileEditorProps {
  user: User;
  userProfile: UserProfile;
  children: React.ReactNode;
  onProfileUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

const formSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  handicap: z.coerce.number().min(0).max(54).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export function ProfileEditor({ user, userProfile, children, onProfileUpdate }: ProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: userProfile.displayName || "",
      handicap: userProfile.handicap || undefined,
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updates: Partial<UserProfile> = {};
      if (values.displayName !== userProfile.displayName) {
        updates.displayName = values.displayName;
        await updateProfile(user, { displayName: values.displayName });
      }
      if (values.handicap !== userProfile.handicap) {
        updates.handicap = values.handicap;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.uid, updates);
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      onProfileUpdate(updates);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
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
                  <FormLabel>Handicap Index</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 12.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
