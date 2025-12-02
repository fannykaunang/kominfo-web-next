import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Support both single and multiple files
    const files = formData.getAll("files") as File[]; // Multiple files
    const singleFile = formData.get("file") as File; // Single file (backward compatible)
    const type = formData.get("type") as string; // 'galeri', 'thumbnail', 'berita', or 'images'

    // Get files array
    let filesToUpload: File[] = [];
    if (files.length > 0) {
      filesToUpload = files;
    } else if (singleFile) {
      filesToUpload = [singleFile];
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate max 5 files for galeri
    if (type === "galeri" && filesToUpload.length > 5) {
      return NextResponse.json(
        { error: "Maksimal 5 file untuk galeri" },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Determine upload directory based on type
    let uploadSubDir = "images"; // default
    if (type === "galeri") {
      uploadSubDir = "galeri";
    } else if (type === "thumbnail") {
      uploadSubDir = "thumbnails";
    } else if (type === "berita") {
      uploadSubDir = "berita";
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      uploadSubDir
    );

    // Create directory if not exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const uploadedFiles: { url: string; filename: string }[] = [];

    // Process each file
    for (const file of filesToUpload) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File ${file.name}: Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP`,
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name}: Ukuran terlalu besar. Maksimal 5MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/\s+/g, "-").toLowerCase();
      const fileName = `${timestamp}-${originalName}`;
      const filePath = path.join(uploadDir, fileName);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Store public URL
      const publicUrl = `/uploads/${uploadSubDir}/${fileName}`;
      uploadedFiles.push({ url: publicUrl, filename: fileName });

      // Small delay to ensure unique timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Return single format for backward compatibility
    if (uploadedFiles.length === 1) {
      return NextResponse.json({
        success: true,
        url: uploadedFiles[0].url,
        filename: uploadedFiles[0].filename,
      });
    }

    // Return multiple format
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
