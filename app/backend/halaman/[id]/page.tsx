import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getHalamanById } from "@/lib/models/halaman.model";
import { getAllMenu } from "@/lib/models/menu.model";
import { HalamanFormStandalone } from "../form-dialog";

export const metadata = {
  title: "Edit Halaman | Admin",
  description: "Perbarui konten halaman website",
};

export default async function EditHalamanPage({
  params,
}: {
  params: { id: string };
}) {
  const [halaman, menuOptions] = await Promise.all([
    getHalamanById(params.id),
    getAllMenu(),
  ]);

  if (!halaman) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Kelola Halaman</p>
          <h1 className="text-2xl font-bold tracking-tight">Edit Halaman</h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi dan konten halaman
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/backend/halaman" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Halaman</CardTitle>
        </CardHeader>
        <CardContent>
          <HalamanFormStandalone
            editingHalaman={halaman}
            menuOptions={menuOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
