import * as MediaLibrary from "expo-media-library";

export function sanitizeQueue(queue: MediaLibrary.Asset[]) {
  return queue.filter((track) => Boolean(track?.uri));
}

export function findQueueIndex(
  queue: MediaLibrary.Asset[],
  trackId: string | null | undefined,
) {
  if (!trackId) {
    return -1;
  }

  return queue.findIndex((track) => track.id === trackId);
}

export function getNextQueueIndex(
  queue: MediaLibrary.Asset[],
  currentIndex: number,
) {
  if (queue.length === 0) {
    return -1;
  }

  const nextIndex = currentIndex + 1;
  return nextIndex < queue.length ? nextIndex : -1;
}

export function getPreviousQueueIndex(currentIndex: number) {
  const previousIndex = currentIndex - 1;
  return previousIndex >= 0 ? previousIndex : -1;
}
