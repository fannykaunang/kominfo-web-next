// app/backend/users/[id]/page.tsx

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  FileText,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  Mail,
  Shield,
  TrendingUp,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { getUserById } from "@/lib/models/user.model";
import { query, queryOne } from "@/lib/db-helpers";
import Link from "next/link";
import EditButtonClient from "./user-edit-button";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Get user statistics
async function getUserStatistics(userId: string) {
  // Total berita created by user
  const beritaStats = await queryOne<any>(
    `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN is_highlight = 1 THEN 1 ELSE 0 END) as highlighted,
      SUM(views) as total_views
    FROM berita
    WHERE author_id = ?
  `,
    [userId]
  );

  // Today's activities (berita created today)
  const todayActivity = await queryOne<any>(
    `
    SELECT COUNT(*) as count
    FROM berita
    WHERE author_id = ? AND DATE(created_at) = CURDATE()
  `,
    [userId]
  );

  // This week activities
  const weekActivity = await queryOne<any>(
    `
    SELECT COUNT(*) as count
    FROM berita
    WHERE author_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
  `,
    [userId]
  );

  // This month activities
  const monthActivity = await queryOne<any>(
    `
    SELECT COUNT(*) as count
    FROM berita
    WHERE author_id = ? 
    AND YEAR(created_at) = YEAR(CURDATE()) 
    AND MONTH(created_at) = MONTH(CURDATE())
  `,
    [userId]
  );

  // Recent berita
  const recentBerita = await query<any>(
    `
    SELECT 
      b.id,
      b.judul,
      b.slug,
      b.is_published,
      b.views,
      b.created_at,
      k.nama as kategori_nama,
      k.color as kategori_color
    FROM berita b
    LEFT JOIN kategori k ON b.kategori_id = k.id
    WHERE b.author_id = ?
    ORDER BY b.created_at DESC
    LIMIT 5
  `,
    [userId]
  );

  // Activity logs (last 10)
  const activityLogs = await query<any>(
    `
    SELECT 
      aksi,
      modul,
      detail_aksi,
      created_at
    FROM log_aktivitas
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `,
    [userId]
  );

  // Most viewed berita by this user
  const topBerita = await query<any>(
    `
    SELECT 
      b.judul,
      b.slug,
      b.views,
      k.nama as kategori_nama
    FROM berita b
    LEFT JOIN kategori k ON b.kategori_id = k.id
    WHERE b.author_id = ? AND b.is_published = 1
    ORDER BY b.views DESC
    LIMIT 5
  `,
    [userId]
  );

  // Categories distribution
  const kategoriesDistribution = await query<any>(
    `
    SELECT 
      k.nama,
      k.color,
      COUNT(b.id) as count
    FROM berita b
    LEFT JOIN kategori k ON b.kategori_id = k.id
    WHERE b.author_id = ?
    GROUP BY k.id, k.nama, k.color
    ORDER BY count DESC
    LIMIT 5
  `,
    [userId]
  );

  return {
    berita: {
      total: Number(beritaStats?.total || 0),
      published: Number(beritaStats?.published || 0),
      draft: Number(beritaStats?.draft || 0),
      highlighted: Number(beritaStats?.highlighted || 0),
      total_views: Number(beritaStats?.total_views || 0),
    },
    activity: {
      today: Number(todayActivity?.count || 0),
      week: Number(weekActivity?.count || 0),
      month: Number(monthActivity?.count || 0),
    },
    recent: recentBerita,
    logs: activityLogs,
    topBerita,
    categories: kategoriesDistribution,
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Only ADMIN can view other users' details
  if (session.user.role !== "ADMIN" && session.user.id !== resolvedParams.id) {
    redirect("/backend/dashboard");
  }

  const user = await getUserById(resolvedParams.id);

  if (!user) {
    notFound();
  }

  const stats = await getUserStatistics(resolvedParams.id);

  // Format dates
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate average views per berita
  const avgViews =
    stats.berita.total > 0
      ? Math.round(stats.berita.total_views / stats.berita.total)
      : 0;

  // Check if viewing own profile
  const isOwnProfile = session.user.id === resolvedParams.id;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/backend/users"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Users
        </Link>
      </div>

      {/* Header with User Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-blue-100 mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                <Shield className="w-4 h-4" />
                {user.role}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  user.is_active === 1
                    ? "bg-green-500/20 text-green-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {user.is_active === 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Aktif
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Nonaktif
                  </>
                )}
              </span>
              {user.email_verified === 1 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4" /> Email Verified
                </span>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <div>
            {/* 👇 GANTI BAGIAN INI 👇 */}
            <EditButtonClient user={user} />

            {/* 👆 SELESAI GANTI 👆 */}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Berita */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Berita
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.berita.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.berita.published} Published
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.berita.total_views.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Avg {avgViews} per berita
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aktivitas Hari Ini
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.activity.today}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.activity.week} minggu ini
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highlighted Berita */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Berita Highlight
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.berita.highlighted}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.berita.draft} draft
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Berita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Berita Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.map((berita: any) => (
                  <div
                    key={berita.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/berita/${berita.slug}`}
                        target="_blank"
                        className="font-medium text-sm hover:text-blue-600 line-clamp-2"
                      >
                        {berita.judul}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: berita.kategori_color
                              ? `${berita.kategori_color}20`
                              : "#3b82f620",
                            color: berita.kategori_color || "#3b82f6",
                          }}
                        >
                          {berita.kategori_nama}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {berita.views} views
                        </span>
                        <span
                          className={`text-xs ${
                            berita.is_published === 1
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {berita.is_published === 1 ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                      {formatDate(berita.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Belum ada berita
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Berita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Berita Terpopuler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topBerita.length > 0 ? (
              <div className="space-y-3">
                {stats.topBerita.map((berita: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/berita/${berita.slug}`}
                        target="_blank"
                        className="font-medium text-sm hover:text-blue-600 line-clamp-2"
                      >
                        {berita.judul}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {berita.kategori_nama}
                        </span>
                        <span className="text-xs font-medium text-orange-600">
                          {berita.views.toLocaleString("id-ID")} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Belum ada berita published
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribusi Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categories.length > 0 ? (
              <div className="space-y-3">
                {stats.categories.map((cat: any) => {
                  const percentage =
                    stats.berita.total > 0
                      ? (cat.count / stats.berita.total) * 100
                      : 0;
                  return (
                    <div key={cat.nama} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className="font-medium"
                          style={{ color: cat.color || "#6b7280" }}
                        >
                          {cat.nama}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {cat.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color || "#3b82f6",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Belum ada data kategori
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aktivitas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.logs.length > 0 ? (
              <div className="space-y-3">
                {stats.logs.map((log: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        log.aksi === "Create"
                          ? "bg-green-500"
                          : log.aksi === "Update"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.detail_aksi || `${log.aksi} ${log.modul}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Belum ada aktivitas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Shield className="w-4 h-4" />
                Role
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.role}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                Bergabung
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(user.created_at)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                Login Terakhir
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.last_login_at
                  ? formatDateTime(user.last_login_at)
                  : "Belum pernah login"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
