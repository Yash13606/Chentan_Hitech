import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { CartMerger } from "@/components/cart/cart-merger";

// Layout guard for /portal/* — defence in depth after proxy.ts
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return (
    <>
      {/* Silently merges guest cart into DB on first authenticated load */}
      <CartMerger />
      {children}
    </>
  );
}
