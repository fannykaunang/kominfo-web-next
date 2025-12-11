import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod"; // Import Zod
import {
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  verifyUserEmail,
  emailExists,
} from "@/lib/models/user.model";
import { UserUpdateInput } from "@/lib/types";

// ==========================================
// 1. Definisikan Skema Validasi dengan Zod
// ==========================================

// Skema untuk Update User (PUT)
const updateUserSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong").trim().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .trim()
    .toLowerCase()
    .optional(),

  // Password: minimal 6 karakter jika diisi.
  // Jika frontend mengirim string kosong "", kita anggap undefined (tidak diupdate)
  password: z
    .string()
    .optional() // Boleh tidak dikirim key-nya dari frontend
    .transform((val) => (val === "" ? undefined : val)) // Ubah string kosong jadi undefined
    .pipe(z.string().min(6, "Password minimal 6 karakter").optional()),

  role: z
    .enum(["ADMIN", "EDITOR", "AUTHOR"], {
      errorMap: () => ({ message: "Role harus ADMIN, EDITOR, atau AUTHOR" }),
    })
    .optional(),

  avatar: z.string().nullable().optional(),

  // Menerima boolean atau number (0/1), dikonversi jadi number untuk DB
  is_active: z
    .union([z.boolean(), z.number()])
    .transform((val) => (val === true || val === 1 ? 1 : 0))
    .optional(),
});

// Skema untuk Patch Action (PATCH)
const patchActionSchema = z.object({
  action: z.enum(["toggle_active", "verify_email"], {
    errorMap: () => ({
      message: "Action harus 'toggle_active' atau 'verify_email'",
    }),
  }),
});

type Props = {
  params: Promise<{ id: string }>;
};

// Helper: Get Client Info
function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// ==========================================
// 2. Route Handlers
// ==========================================

// GET - Get single user
export async function GET(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // SECURITY: Hapus password hash sebelum dikirim ke client
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    // 1. Auth Check
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Permission Check
    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Parse & Validate Body dengan Zod
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      // Mengambil pesan error pertama dari Zod
      const errorMessage = validation.error.errors[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const data = validation.data; // Data yang sudah bersih dan valid

    // 4. Logic Validation (Business Logic)

    // Cek User Existence
    const existingUser = await getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cek Email Duplikat (Hanya jika email berubah)
    if (data.email && data.email !== existingUser.email) {
      const exists = await emailExists(data.email, params.id);
      if (exists) {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Cek Hak Akses Admin untuk field Sensitif (Role & Is Active)
    if (
      (data.role !== undefined || data.is_active !== undefined) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Hanya Admin yang dapat mengubah Role atau Status Aktif" },
        { status: 403 }
      );
    }

    // 5. Siapkan data untuk update
    // Kita hapus properti undefined agar tidak menimpa data lama dengan NULL/Undefined
    const updateData: UserUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = data.password;
    if (data.role) updateData.role = data.role;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    // 6. Eksekusi Update
    const { ipAddress, userAgent } = getClientInfo(request);

    await updateUser(
      params.id,
      updateData,
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    await deleteUser(params.id, session.user.id, ipAddress, userAgent);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle actions
export async function PATCH(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Validasi Body dengan Zod
    const body = await request.json();
    const validation = patchActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { action } = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);

    // Cek User
    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Handle Actions
    if (action === "toggle_active") {
      if (params.id === session.user.id) {
        return NextResponse.json(
          { error: "Tidak dapat menonaktifkan akun sendiri" },
          { status: 400 }
        );
      }
      await toggleUserActive(params.id, session.user.id, ipAddress, userAgent);
      return NextResponse.json({ message: "Status user berhasil diubah" });
    }

    if (action === "verify_email") {
      await verifyUserEmail(params.id, session.user.id, ipAddress, userAgent);
      return NextResponse.json({ message: "Email berhasil diverifikasi" });
    }
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
