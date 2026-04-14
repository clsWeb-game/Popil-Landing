import SeriesDetailClient from "./SeriesDetailClient";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SeriesDetailClient key={id} seriesId={id} />;
}
