import { connection } from "next/server";

import { requireUser } from "@/application/dal/auth";
import { ProductShell } from "@/components/layout/product-shell";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const user = await requireUser();
  return <ProductShell user={user}>{children}</ProductShell>;
}
