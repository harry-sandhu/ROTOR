import { BuildDetailClient } from "../../../features/builds/BuildDetailClient";

export default async function BuildDetailPage({ params }: { params: Promise<{ buildId: string }> }) {
  const { buildId } = await params;
  return <BuildDetailClient buildId={buildId} />;
}
