import { getProfile } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { AccountForm } from "@/features/account/account-form";

export default async function AccountPage() {
  const profile = await getProfile();
  return <div><PageHeader eyebrow="Customer identity" title="Account" description="These details support trip defaults. SafarSet does not collect passport, card, or PNR data in this beta." /><div className="mx-auto max-w-4xl p-5 sm:p-8 lg:p-10"><AccountForm profile={profile} /></div></div>;
}
