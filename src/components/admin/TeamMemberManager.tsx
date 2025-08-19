
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TeamMember } from '@/types';
import {
    addOrUpdateTeamMember,
    deleteTeamMember,
    uploadTeamMemberAvatar,
} from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Edit, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TeamMemberManagerProps {
  initialTeamMembers: TeamMember[];
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name is required.'),
  role_en: z.string().min(3, 'English role is required.'),
  role_es: z.string().min(3, 'Spanish role is required.'),
  order: z.coerce.number().int().min(0),
});

type TeamMemberFormValues = z.infer<typeof formSchema>;

export function TeamMemberManager({ initialTeamMembers }: TeamMemberManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(formSchema),
  });

  const resetFormAndState = () => {
    form.reset({
      name: '',
      role_en: '',
      role_es: '',
      order: teamMembers.length,
    });
    setEditingMember(null);
    setAvatarFile(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    form.reset({
      id: member.id,
      name: member.name,
      role_en: member.role_en,
      role_es: member.role_es,
      order: member.order,
    });
  };

  const onSubmit = async (values: TeamMemberFormValues) => {
    setIsLoading(true);
    try {
      let avatarUrl = editingMember?.avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadTeamMemberAvatar(
          avatarFile,
          editingMember?.id
        );
      }

      const memberData = { ...values, avatarUrl: avatarUrl || '' };
      const savedMember = await addOrUpdateTeamMember(memberData);

      if (editingMember) {
        setTeamMembers(
          teamMembers.map((m) => (m.id === savedMember.id ? savedMember : m))
        );
      } else {
        setTeamMembers([...teamMembers, savedMember]);
      }

      toast({ title: 'Success', description: 'Team member saved.' });
      resetFormAndState();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save team member.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTeamMember(id);
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
      toast({ title: 'Success', description: 'Team member deleted.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team member.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingMember ? <Edit /> : <PlusCircle />}
              {editingMember ? 'Edit Team Member' : 'Add New Member'}
            </CardTitle>
            {editingMember && (
                <Button variant="ghost" size="sm" className="w-fit" onClick={resetFormAndState}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Edit
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        avatarFile
                          ? URL.createObjectURL(avatarFile)
                          : editingMember?.avatarUrl
                      }
                    />
                    <AvatarFallback>
                      {form.getValues('name')?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setAvatarFile(e.target.files[0])
                    }
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (English)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="role_es"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (Spanish)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Team</CardTitle>
            <CardDescription>
              This is the team that will be displayed on the "About Us" page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers
                .sort((a, b) => a.order - b.order)
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role_en} / {member.role_es}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the team member. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(member.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
