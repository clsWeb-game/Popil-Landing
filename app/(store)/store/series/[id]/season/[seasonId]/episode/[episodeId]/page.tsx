import SeriesEpisodeClient from "./SeriesEpisodeClient";

export default async function SeriesEpisodePage({
  params,
}: {
  params: Promise<{ id: string; seasonId: string; episodeId: string }>;
}) {
  const { id, seasonId, episodeId } = await params;
  return (
    <SeriesEpisodeClient
      seriesId={id}
      seasonId={seasonId}
      episodeId={episodeId}
    />
  );
}
