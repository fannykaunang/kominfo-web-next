import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  FolderOpen,
  Users,
  Eye,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { BeritaRepository } from "@/lib/models/berita.model";
import { getKategoriStats } from "@/lib/models/kategori.model";
import { getUserStats } from "@/lib/models/user.model";
import { getVisitorStats } from "@/lib/models/visitor.model";
import { DashboardCharts } from "@/components/backend/dashboard-charts";
import { NewsImageSimple } from "@/components/berita/news-img-simple";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch real stats from database
  const [beritaStats, kategoriStats, userStats, visitorStats] =
    await Promise.all([
      BeritaRepository.getStats(),
      getKategoriStats(),
      getUserStats(),
      getVisitorStats(),
    ]);

  // Calculate percentage change (today vs yesterday for visitors)
  const visitorChange =
    visitorStats.yesterday > 0
      ? ((visitorStats.today - visitorStats.yesterday) /
          visitorStats.yesterday) *
        100
      : 0;

  const stats = [
    {
      title: "Total Berita",
      value: beritaStats.total.toLocaleString("id-ID"),
      subtitle: `${beritaStats.published} Published`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      change: null,
    },
    {
      title: "Kategori",
      value: kategoriStats.total.toString(),
      subtitle: `${kategoriStats.used} Terpakai`,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      change: null,
    },
    {
      title: "Total Users",
      value: userStats.total.toString(),
      subtitle: `${userStats.active} Aktif`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      change: null,
    },
    {
      title: "Visitors Hari Ini",
      value: visitorStats.today.toLocaleString("id-ID"),
      subtitle: `${visitorStats.unique_ips.toLocaleString("id-ID")} Unique IPs`,
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      change: visitorChange,
    },
  ];

  // Get recent berita
  const recentBerita = await BeritaRepository.findAll({
    page: 1,
    limit: 5,
    is_published: true,
  });

  // Format date helper
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Selamat datang kembali, {session?.user?.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change !== null && stat.change >= 0;
          const isNegative = stat.change !== null && stat.change < 0;

          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.subtitle}
                      </p>
                      {stat.change !== null && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {Math.abs(stat.change).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Berita Terbaru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Berita Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBerita.data.length > 0 ? (
              <div className="space-y-4">
                {recentBerita.data.map((berita) => (
                  <div
                    key={berita.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {berita.featured_image && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
                        <NewsImageSimple
                          src={berita.featured_image}
                          alt={berita.judul}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                        {berita.judul}
                      </h4>
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
                          {formatDate(berita.published_at || berita.created_at)}
                        </span>
                      </div>
                    </div>
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

        {/* Visitor Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Statistik Pengunjung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Today vs Yesterday */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {visitorStats.today.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kemarin
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {visitorStats.yesterday.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Week vs Month */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Minggu Ini
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {visitorStats.this_week.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Bulan Ini
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {visitorStats.this_month.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Device Breakdown */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  By Device
                </p>
                <div className="space-y-2">
                  {Object.entries(visitorStats.by_device).map(
                    ([device, count]) => {
                      const total = Object.values(
                        visitorStats.by_device
                      ).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;

                      return (
                        <div key={device} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400 w-16 capitalize">
                            {device}
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/backend/berita"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium text-sm">Buat Berita</div>
            </a>
            <a
              href="/backend/kategori"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium text-sm">Kelola Kategori</div>
            </a>
            <a
              href="/backend/users"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-medium text-sm">Kelola Users</div>
            </a>
            <a
              href="/"
              target="_blank"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-medium text-sm">Lihat Website</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
