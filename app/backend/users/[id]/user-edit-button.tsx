"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { UserFormDialog } from "@/app/backend/users/form-dialog";
import { useRouter } from "next/navigation";
import { User, SafeUser } from "@/lib/types";

interface EditButtonClientProps {
  user: User | SafeUser; // Sesuaikan dengan tipe user Anda
}

export default function EditButtonClient({ user }: EditButtonClientProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClose = (refresh?: boolean) => {
    setOpen(false);
    if (refresh) {
      router.refresh(); // Refresh data server component setelah update
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit User
      </Button>

      {open && (
        <UserFormDialog
          open={open}
          onClose={handleClose}
          user={user}
          // isProfileMode={false} // Default false, karena ini halaman admin edit user lain
        />
      )}
    </>
  );
}
