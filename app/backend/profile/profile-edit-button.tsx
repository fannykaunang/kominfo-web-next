"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import { UserFormDialog } from "@/app/backend/users/form-dialog"; // Import dari lokasi yang sudah ada
import { useRouter } from "next/navigation";
import { User, SafeUser } from "@/lib/types";

interface ProfileEditButtonProps {
  user: User | SafeUser; // Sesuaikan tipe dengan data user Anda
}

export function ProfileEditButton({ user }: ProfileEditButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClose = (refresh?: boolean) => {
    setOpen(false);
    if (refresh) {
      router.refresh(); // Refresh data server component setelah update sukses
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <UserIcon className="w-4 h-4 mr-2" />
        Edit Profile
      </Button>

      {open && (
        <UserFormDialog
          open={open}
          onClose={handleClose}
          user={user}
          isProfileMode={true} // Aktifkan mode profil agar role hidden
        />
      )}
    </>
  );
}
