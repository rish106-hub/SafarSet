import { connection } from "next/server";

import { DemoWorkspace } from "@/features/demo/demo-workspace";

export default async function Home() {
  await connection();
  const providerMode = process.env.PROVIDER_MODE === "live" ? "live" : "demo";
  return <DemoWorkspace providerMode={providerMode} />;
}
