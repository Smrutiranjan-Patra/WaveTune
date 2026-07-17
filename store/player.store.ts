import { create } from "zustand";
import * as MediaLibrary from "expo-media-library";
import type { AudioStatus } from "expo-audio";
import type { EventSubscription } from "expo-modules-core";

import type { SongMetadataUpdate } from "../services/database/songs.repository";
import type { MusicAsset } from "../types/music";
import {
  deactivatePlayback,
  pauseTrack,
  playTrack,
  resetAbandonedPlayback,
  resumeTrack,
  seekTrack,
  setPlaybackVolume,
  subscribeToPlaybackStatus,
} from "../services/player";

export type RepeatMode = "off" | "all" | "one";
import { useUserLibraryStore } from "./user-library.store";
import {
  findQueueIndex,
  getNextQueueIndex,
  getPreviousQueueIndex,
  sanitizeQueue,
} from "../services/player";

type PlayerState = {
  queue: MediaLibrary.Asset[];
  currentTrack: MediaLibrary.Asset | null;
  currentIndex: number;
  isReady: boolean;
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  error: string | null;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  volume: number;
  subscription: EventSubscription | null;
  cleanupPlayer: () => Promise<void>;
  initializePlayer: () => Promise<void>;
  setQueue: (queue: MediaLibrary.Asset[]) => void;
  updateTrackMetadata: (
    trackId: string,
    metadata: SongMetadataUpdate,
  ) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  removeQueueItem: (trackId: string) => void;
  playSong: (
    track: MediaLibrary.Asset,
    queue?: MediaLibrary.Asset[],
  ) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (positionSeconds: number) => Promise<void>;
  playNext: (options?: { fromCompletion?: boolean }) => Promise<void>;
  playPrevious: () => Promise<void>;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  syncStatus: (status: AudioStatus) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentTrack: null,
  currentIndex: -1,
  isReady: false,
  isLoaded: false,
  isPlaying: false,
  position: 0,
  duration: 0,
  error: null,
  repeatMode: "off",
  shuffleEnabled: false,
  volume: 1,
  subscription: null,

  cleanupPlayer: async () => {
    get().subscription?.remove();
    await deactivatePlayback();

    set({
      currentTrack: null,
      currentIndex: -1,
      duration: 0,
      error: null,
      isLoaded: false,
      isPlaying: false,
      position: 0,
      queue: [],
      subscription: null,
    });
  },

  initializePlayer: async () => {
    await resetAbandonedPlayback();

    set({
      isReady: true,
      isLoaded: false,
      isPlaying: false,
      position: 0,
      duration: 0,
      currentTrack: null,
      currentIndex: -1,
      subscription: null,
    });
  },

  setQueue: (queue) => {
    set({ queue: sanitizeQueue(queue) });
  },

  updateTrackMetadata: (trackId, metadata) => {
    const applyMetadata = (track: MediaLibrary.Asset) => {
      if (track.id !== trackId) {
        return track;
      }

      return {
        ...track,
        albumTitle: metadata.albumTitle ?? undefined,
        artist: metadata.artist ?? undefined,
        genre: metadata.genre ?? undefined,
        title: metadata.title ?? undefined,
      } as MusicAsset;
    };
    const { currentTrack, queue } = get();

    set({
      currentTrack: currentTrack ? applyMetadata(currentTrack) : null,
      queue: queue.map(applyMetadata),
    });
  },

  moveQueueItem: (fromIndex, toIndex) => {
    const { currentTrack, queue } = get();
    if (
      fromIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex < 0 ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const nextQueue = [...queue];
    const [movedTrack] = nextQueue.splice(fromIndex, 1);
    nextQueue.splice(toIndex, 0, movedTrack);
    set({
      currentIndex: currentTrack
        ? findQueueIndex(nextQueue, currentTrack.id)
        : -1,
      queue: nextQueue,
    });
  },

  removeQueueItem: (trackId) => {
    const { currentIndex, currentTrack, queue } = get();
    const index = findQueueIndex(queue, trackId);
    if (index < 0 || index >= queue.length || index === currentIndex) {
      return;
    }

    const nextQueue = queue.filter((_, queueIndex) => queueIndex !== index);
    set({
      currentIndex: currentTrack
        ? findQueueIndex(nextQueue, currentTrack.id)
        : -1,
      queue: nextQueue,
    });
  },

  playSong: async (track, queue) => {
    const nextQueue = sanitizeQueue(queue ?? get().queue);
    const currentIndex = findQueueIndex(nextQueue, track.id);

    try {
      const { status } = await playTrack(track, get().volume);

      if (!get().subscription) {
        const subscription = await subscribeToPlaybackStatus((status) => {
          get().syncStatus(status);
        });

        set({ subscription });
      }

      set({
        queue: nextQueue,
        currentTrack: track,
        currentIndex,
        error: null,
      });

      useUserLibraryStore.getState().recordPlay(track.id);

      get().syncStatus(status);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to play track",
        isPlaying: false,
      });
    }
  },

  pause: async () => {
    try {
      const status = await pauseTrack();
      get().syncStatus(status);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to pause track",
        isPlaying: false,
      });
    }
  },

  resume: async () => {
    try {
      const status = await resumeTrack();
      get().syncStatus(status);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to resume track",
        isPlaying: false,
      });
    }
  },

  togglePlayback: async () => {
    if (get().isPlaying) {
      await get().pause();
      return;
    }

    if (get().currentTrack) {
      await get().resume();
    }
  },

  seekTo: async (positionSeconds) => {
    const status = await seekTrack(positionSeconds);
    get().syncStatus(status);
  },

  playNext: async (options) => {
    const { queue, currentIndex, repeatMode, shuffleEnabled } = get();

    if (options?.fromCompletion && repeatMode === "one") {
      await get().seekTo(0);
      await get().resume();
      return;
    }

    let nextIndex = getNextQueueIndex(queue, currentIndex);

    if (shuffleEnabled && queue.length > 1) {
      const candidates = queue
        .map((_, index) => index)
        .filter((index) => index !== currentIndex);
      nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
    } else if (nextIndex < 0 && repeatMode === "all" && queue.length > 0) {
      nextIndex = 0;
    }

    if (nextIndex < 0) {
      set({
        isPlaying: false,
        position: 0,
      });
      return;
    }

    await get().playSong(queue[nextIndex], queue);
  },

  playPrevious: async () => {
    const { currentIndex, position, queue, repeatMode, shuffleEnabled } = get();

    if (position > 3) {
      await get().seekTo(0);
      return;
    }

    let previousIndex = getPreviousQueueIndex(currentIndex);

    if (shuffleEnabled && queue.length > 1) {
      const candidates = queue
        .map((_, index) => index)
        .filter((index) => index !== currentIndex);
      previousIndex =
        candidates[Math.floor(Math.random() * candidates.length)];
    } else if (previousIndex < 0 && repeatMode === "all" && queue.length > 0) {
      previousIndex = queue.length - 1;
    }

    if (previousIndex < 0) {
      return;
    }

    await get().playSong(queue[previousIndex], queue);
  },

  cycleRepeatMode: () => {
    set(({ repeatMode }) => ({
      repeatMode:
        repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off",
    }));
  },

  toggleShuffle: () => {
    set(({ shuffleEnabled }) => ({ shuffleEnabled: !shuffleEnabled }));
  },

  setVolume: (volume) => {
    const nextVolume = Math.min(Math.max(volume, 0), 1);
    set({ volume: nextVolume });
    void setPlaybackVolume(nextVolume).catch((error) => {
      set({
        error:
          error instanceof Error ? error.message : "Failed to change volume",
      });
    });
  },

  syncStatus: (status) => {
    set({
      isLoaded: status.isLoaded,
      isPlaying: status.playing,
      position: status.currentTime,
      duration: status.duration,
    });

    if (status.didJustFinish) {
      void get().playNext({ fromCompletion: true });
    }
  },
}));
