import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as any

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">
                  M
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Portal Berita Merauke</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <form action={async () => {
                "use server"
                const { signOut } = await import("@/lib/auth")
                await signOut({ redirectTo: "/login" })
              }}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.name}!</h2>
          <p className="text-muted-foreground">
            Kelola konten dan pengaturan portal berita dari dashboard ini
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Berita</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Belum ada berita</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">User terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengunjung Hari Ini</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Pengunjung</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button className="h-20" variant="outline" asChild>
              <Link href="/admin/berita/new">
                <div className="flex flex-col items-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Buat Berita Baru</span>
                </div>
              </Link>
            </Button>

            {user.role === "ADMIN" && (
              <Button className="h-20" variant="outline" asChild>
                <Link href="/register">
                  <div className="flex flex-col items-center">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Tambah User</span>
                  </div>
                </Link>
              </Button>
            )}

            <Button className="h-20" variant="outline" asChild>
              <Link href="/admin/settings">
                <div className="flex flex-col items-center">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Pengaturan</span>
                </div>
              </Link>
            </Button>

            <Button className="h-20" variant="outline" asChild>
              <Link href="/">
                <div className="flex flex-col items-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Lihat Website</span>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
