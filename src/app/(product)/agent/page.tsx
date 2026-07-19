import { PageHeader } from "@/components/layout/page-header";
import { AgentConsole } from "@/features/agent/agent-console";

export const metadata = { title: "Travel agent" };

export default function AgentPage() { return <div><PageHeader eyebrow="Family travel agent" title="What do you need?" description="Type or speak. SafarSet uses your trips and rules, then drafts the next step for review." /><div className="mx-auto max-w-6xl p-5 sm:p-8 lg:p-10"><AgentConsole /></div></div>; }
