import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BackendLayoutClient } from "@/components/backend/layout-client";

export default async function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <BackendLayoutClient user={session.user}>{children}</BackendLayoutClient>
  );
}
