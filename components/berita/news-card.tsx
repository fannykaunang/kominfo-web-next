import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NewsCardProps {
  id: string
  judul: string
  slug: string
  excerpt: string
  featuredImage: string
  kategori: {
    nama: string
    slug: string
    color: string
  }
  author: {
    name: string
  }
  publishedAt: string
  views: number
}

export function NewsCard({
  judul,
  slug,
  excerpt,
  featuredImage,
  kategori,
  author,
  publishedAt,
  views,
}: NewsCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover-lift">
      <Link href={`/berita/${slug}`}>
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={featuredImage || "/placeholder.jpg"}
            alt={judul}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              style={{ backgroundColor: kategori.color }}
              className="text-white shadow-lg"
            >
              {kategori.nama}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Title */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {judul}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {author.name}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{views}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Compact version for sidebar or related news
export function NewsCardCompact({
  judul,
  slug,
  featuredImage,
  kategori,
  publishedAt,
}: Omit<NewsCardProps, "excerpt" | "author" | "views" | "id">) {
  return (
    <Link href={`/berita/${slug}`} className="group">
      <div className="flex gap-3 hover:bg-accent/50 rounded-lg p-2 transition-colors">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={featuredImage || "/placeholder.jpg"}
            alt={judul}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="flex-1 min-w-0">
          <Badge
            className="mb-1 text-xs"
            variant="secondary"
            style={{
              backgroundColor: `${kategori.color}20`,
              color: kategori.color,
            }}
          >
            {kategori.nama}
          </Badge>
          
          <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {judul}
          </h4>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Horizontal Card for List View
export function NewsCardHorizontal({
  judul,
  slug,
  excerpt,
  featuredImage,
  kategori,
  author,
  publishedAt,
  views,
}: NewsCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover-lift">
      <Link href={`/berita/${slug}`}>
        <div className="flex flex-col md:flex-row gap-4 p-4">
          {/* Image */}
          <div className="relative w-full md:w-64 aspect-video md:aspect-[4/3] flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={featuredImage || "/placeholder.jpg"}
              alt={judul}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-3 left-3">
              <Badge style={{ backgroundColor: kategori.color }}>
                {kategori.nama}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {judul}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{author.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}

// Loading Skeleton
export function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="aspect-[16/9] skeleton" />
      <CardContent className="p-5 space-y-3">
        <div className="h-6 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-5/6 skeleton" />
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full skeleton" />
            <div className="h-3 w-20 skeleton" />
          </div>
          <div className="h-3 w-24 skeleton" />
        </div>
      </CardContent>
    </Card>
  )
}
