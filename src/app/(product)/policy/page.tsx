import { listPolicies } from "@/application/dal/customer-data";
import { PageHeader } from "@/components/layout/page-header";
import { ProductionPolicyForm } from "@/features/policy/policy-form";

export default async function PolicyPage() {
  const policies = await listPolicies();
  const selected = policies.find((policy) => policy.isDefault) ?? policies[0];
  return <div><PageHeader eyebrow="Customer-controlled constraints" title="Recovery rules" description="These controls decide which live alternatives are eligible and when your approval is required." /><div className="mx-auto max-w-5xl p-5 sm:p-8 lg:p-10"><ProductionPolicyForm policy={selected} /></div></div>;
}
