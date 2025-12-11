// app/backend/users/form-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User, SafeUser } from "@/lib/types";

interface UserFormDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  user: User | SafeUser | null;
  isProfileMode?: boolean;
}

export function UserFormDialog({
  open,
  onClose,
  user,
  isProfileMode = false,
}: UserFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "AUTHOR" as "ADMIN" | "EDITOR" | "AUTHOR",
    avatar: "",
    is_active: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          avatar: user.avatar || "",
          is_active: user.is_active,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "AUTHOR",
          avatar: "",
          is_active: 1,
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [open, user]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password wajib diisi untuk user baru";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        avatar: formData.avatar || null,
      };

      // Only send password if it's filled
      if (formData.password) {
        payload.password = formData.password;
      }

      // Only send is_active for edit
      if (user) {
        payload.is_active = formData.is_active;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save user");
      }

      toast.success(
        user ? "User berhasil diupdate" : "User berhasil ditambahkan"
      );
      onClose(true);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Tambah User Baru"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update informasi user. Kosongkan password jika tidak ingin mengubah."
              : "Isi form di bawah untuk menambahkan user baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!user && <span className="text-red-500">*</span>}
              {user && (
                <span className="text-sm text-gray-500">
                  (Kosongkan jika tidak diubah)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={user ? "••••••••" : "Minimal 6 karakter"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          {!isProfileMode && (
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => handleChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHOR">
                    Author - Dapat menulis berita
                  </SelectItem>
                  <SelectItem value="EDITOR">
                    Editor - Dapat mengedit semua berita
                  </SelectItem>
                  <SelectItem value="ADMIN">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Avatar URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="avatar">
              Avatar URL{" "}
              <span className="text-sm text-gray-500">(Opsional)</span>
            </Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar}
              onChange={(e) => handleChange("avatar", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              URL gambar avatar. Kosongkan untuk menggunakan inisial nama.
            </p>
          </div>

          {/* Active Status (Edit only) */}
          {user && !isProfileMode && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Status Aktif</Label>
                <p className="text-sm text-gray-500">
                  User yang nonaktif tidak dapat login
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active === 1}
                onCheckedChange={(checked) =>
                  handleChange("is_active", checked ? 1 : 0)
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
