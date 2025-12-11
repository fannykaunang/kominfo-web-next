"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit } from "lucide-react";

interface EditUserButtonProps {
  userName: string;
}

export function EditUserButton({ userName }: EditUserButtonProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    router.push("/backend/users");
  };

  return (
    <>
      <Button
        onClick={handleEditClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit User
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Untuk mengedit user <strong>{userName}</strong>, silakan kembali
                ke halaman Users.
              </span>
              <span className="block text-sm">
                Anda akan diarahkan ke halaman Users untuk melakukan pengeditan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Kembali ke Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
