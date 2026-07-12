import { create } from "zustand";
import * as MediaLibrary from "expo-media-library";
import type { AudioStatus } from "expo-audio";
import type { EventSubscription } from "expo-modules-core";

import {
  deactivatePlayback,
  pauseTrack,
  playTrack,
  resetAbandonedPlayback,
  resumeTrack,
  seekTrack,
  subscribeToPlaybackStatus,
} from "../services/player";
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
  subscription: EventSubscription | null;
  cleanupPlayer: () => Promise<void>;
  initializePlayer: () => Promise<void>;
  setQueue: (queue: MediaLibrary.Asset[]) => void;
  playSong: (
    track: MediaLibrary.Asset,
    queue?: MediaLibrary.Asset[],
  ) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (positionSeconds: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
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
  subscription: null,

  cleanupPlayer: async () => {
    get().subscription?.remove();
    await deactivatePlayback();

    set({
      currentTrack: null,
      currentIndex: -1,
      isLoaded: false,
      isPlaying: false,
      position: 0,
      duration: 0,
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

  playSong: async (track, queue) => {
    const nextQueue = sanitizeQueue(queue ?? get().queue);
    const currentIndex = findQueueIndex(nextQueue, track.id);

    try {
      const { status } = await playTrack(track);

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
        error: error instanceof Error ? error.message : "Failed to resume track",
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

  playNext: async () => {
    const { queue, currentIndex } = get();
    const nextIndex = getNextQueueIndex(queue, currentIndex);

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
    const { queue, currentIndex } = get();
    const previousIndex = getPreviousQueueIndex(currentIndex);

    if (previousIndex < 0) {
      return;
    }

    await get().playSong(queue[previousIndex], queue);
  },

  syncStatus: (status) => {
    set({
      isLoaded: status.isLoaded,
      isPlaying: status.playing,
      position: status.currentTime,
      duration: status.duration,
    });

    if (status.didJustFinish) {
      void get().playNext();
    }
  },
}));
