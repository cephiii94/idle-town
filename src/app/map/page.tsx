import { getStageById } from '@/lib/stages';
import PlayClient from './PlayClient';

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string | string[] }>;
}) {
  const params = await searchParams;
  const stageId = Array.isArray(params.stage) ? params.stage[0] : params.stage ?? null;

  return <PlayClient selectedStage={getStageById(stageId)} />;
}
