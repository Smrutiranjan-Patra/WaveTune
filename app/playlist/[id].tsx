import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import {
  Artwork,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { SongListRow } from "../../components/SongListRow";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";
import { useUserLibraryStore } from "../../store/user-library.store";
import type { MusicAsset } from "../../types/music";
import {
  generatePlaylistName,
  isPlaylistNameTaken,
} from "../../utils/playlist";

function HeaderButton({
  color,
  icon,
  label,
  onPress,
}: {
  color?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: 19,
          borderWidth: 1,
          height: 38,
          justifyContent: "center",
          width: 38,
        },
        softShadow(theme.isDark, "low"),
      ]}
    >
      <Ionicons name={icon} color={color ?? theme.icon} size={20} />
    </Pressable>
  );
}

export default function PlaylistDetailsScreen() {
  const theme = useAppTheme();
  const { id, mode } = useLocalSearchParams<{
    id: string;
    mode?: string;
  }>();
  const songs = useLibraryStore((state) => state.songs);
  const playlists = useUserLibraryStore((state) => state.playlists);
  const createPlaylist = useUserLibraryStore((state) => state.createPlaylist);
  const deletePlaylist = useUserLibraryStore((state) => state.deletePlaylist);
  const updatePlaylist = useUserLibraryStore((state) => state.updatePlaylist);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playSong = usePlayerStore((state) => state.playSong);
  const isNewPlaylist = id === "new";
  const isEditing = isNewPlaylist || mode === "edit";
  const playlist = playlists.find((item) => item.id === id);
  const existingPlaylistNames = useMemo(
    () => [
      "Favorites",
      ...playlists
        .filter((item) => item.id !== playlist?.id)
        .map((item) => item.name),
    ],
    [playlist?.id, playlists],
  );
  const [name, setName] = useState(
    () => playlist?.name ?? generatePlaylistName(existingPlaylistNames),
  );
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(
    playlist?.songIds ?? [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedSongSet = useMemo(
    () => new Set(selectedSongIds),
    [selectedSongIds],
  );
  const songsById = useMemo(
    () => new Map(songs.map((song) => [song.id, song])),
    [songs],
  );
  const playlistSongs = useMemo(
    () =>
      (playlist?.songIds ?? [])
        .map((songId) => songsById.get(songId))
        .filter((song): song is MusicAsset => Boolean(song)),
    [playlist?.songIds, songsById],
  );
  const filteredSongs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const matchingSongs = normalizedQuery
      ? songs.filter((song) =>
          `${getTrackTitle(song)} ${getTrackArtist(song)}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        )
      : [...songs];

    return matchingSongs.sort((first, second) => {
      const firstSelected = selectedSongSet.has(first.id);
      const secondSelected = selectedSongSet.has(second.id);

      if (firstSelected !== secondSelected) {
        return firstSelected ? -1 : 1;
      }

      return getTrackTitle(first).localeCompare(getTrackTitle(second), undefined, {
        sensitivity: "base",
      });
    });
  }, [searchQuery, selectedSongSet, songs]);
  const trimmedName = name.trim();
  const duplicateName = isPlaylistNameTaken(trimmedName, existingPlaylistNames);
  const nameError = !trimmedName
    ? "Playlist name is required."
    : duplicateName
      ? "A playlist with this name already exists."
      : null;

  const toggleSong = (songId: string) => {
    setSelectedSongIds((current) =>
      current.includes(songId)
        ? current.filter((item) => item !== songId)
        : [...current, songId],
    );
  };

  const handleSave = () => {
    if (nameError || saving) return;
    setSaving(true);

    if (isNewPlaylist) {
      const playlistId = createPlaylist(name, selectedSongIds);
      if (playlistId) {
        router.replace({ pathname: "/playlist/[id]", params: { id: playlistId } });
        return;
      }

      setSaving(false);
      return;
    }

    if (playlist) {
      updatePlaylist(playlist.id, { name, songIds: selectedSongIds });
      router.back();
      return;
    }

    setSaving(false);
  };

  const handleDelete = () => {
    if (!playlist) return;
    deletePlaylist(playlist.id);
    router.dismissTo("/(tabs)/playlist");
  };

  if (!isEditing) {
    if (!playlist) {
      return (
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.background,
            flex: 1,
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Ionicons name="list-outline" color={theme.accent} size={34} />
          <Text
            style={{
              color: theme.primary,
              fontSize: 19,
              fontWeight: "900",
              marginTop: 12,
            }}
          >
            Playlist not found
          </Text>
          <Pressable onPress={() => router.dismissTo("/(tabs)/playlist")}>
            <Text
              style={{
                color: theme.accent,
                fontSize: 13,
                fontWeight: "900",
                marginTop: 14,
              }}
            >
              Back to Playlists
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: theme.background, flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingTop: 14,
          }}
        >
          <HeaderButton
            icon="chevron-back"
            label="Back"
            onPress={() => router.back()}
          />
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              flex: 1,
              fontSize: 18,
              fontWeight: "900",
              marginHorizontal: 12,
              textAlign: "center",
            }}
          >
            Playlist
          </Text>
          <HeaderButton
            color={theme.accent}
            icon="create-outline"
            label="Edit playlist"
            onPress={() =>
              router.push({
                pathname: "/playlist/[id]",
                params: { id: playlist.id, mode: "edit" },
              })
            }
          />
        </View>

        <FlatList
          contentContainerStyle={{
            gap: 10,
            paddingBottom: 150,
            paddingHorizontal: 22,
            paddingTop: 22,
          }}
          data={playlistSongs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View
              style={[
                {
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 18,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 16,
                  marginBottom: 12,
                  padding: 16,
                },
                softShadow(theme.isDark, "medium"),
              ]}
            >
              <Artwork
                icon="list"
                index={playlistSongs.length}
                size={96}
                source={playlistSongs[0]}
              />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    color: theme.primary,
                    fontSize: 22,
                    fontWeight: "900",
                  }}
                >
                  {playlist.name}
                </Text>
                <Text
                  style={{ color: theme.secondary, fontSize: 12, marginTop: 5 }}
                >
                  {playlistSongs.length} songs
                </Text>
                <Pressable
                  disabled={playlistSongs.length === 0}
                  onPress={() => {
                    const firstSong = playlistSongs[0];
                    if (firstSong) void playSong(firstSong, playlistSongs);
                  }}
                  style={{
                    alignItems: "center",
                    alignSelf: "flex-start",
                    backgroundColor: theme.accent,
                    borderRadius: 18,
                    flexDirection: "row",
                    gap: 6,
                    marginTop: 13,
                    minHeight: 36,
                    opacity: playlistSongs.length ? 1 : 0.4,
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="play" color="#FFFFFF" size={15} />
                  <Text
                    style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}
                  >
                    Play All
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 34 }}>
              <Ionicons
                name="musical-notes-outline"
                color={theme.accent}
                size={30}
              />
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: "900",
                  marginTop: 10,
                }}
              >
                This playlist is empty
              </Text>
              <Text
                style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}
              >
                Use Edit to add songs.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <SongListRow
              artworkSource={item}
              artist={getTrackArtist(item)}
              duration={item.duration}
              index={index}
              isCurrentTrack={currentTrack?.id === item.id}
              isPlaying={isPlaying}
              onDetailPress={() => router.push(`/song/${item.id}`)}
              onPress={() => void playSong(item, playlistSongs)}
              title={getTrackTitle(item)}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 22,
          paddingTop: 14,
        }}
      >
        <HeaderButton
          icon="chevron-back"
          label="Cancel"
          onPress={() => router.back()}
        />
        <Text style={{ color: theme.primary, fontSize: 18, fontWeight: "900" }}>
          {isNewPlaylist ? "Create Playlist" : "Edit Playlist"}
        </Text>
        {!isNewPlaylist ? (
          <HeaderButton
            color="#EF476F"
            icon="trash-outline"
            label="Delete playlist"
            onPress={handleDelete}
          />
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 70,
          paddingHorizontal: 22,
          paddingTop: 22,
        }}
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 12 }}>
            <View
              style={[
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 18,
                  borderWidth: 1,
                  padding: 16,
                },
                softShadow(theme.isDark, "medium"),
              ]}
            >
              <View style={{ flexDirection: "row", gap: 14 }}>
                <Artwork
                  icon="list"
                  index={selectedSongIds.length}
                  size={96}
                  source={songsById.get(selectedSongIds[0])}
                />
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    style={{
                      color: theme.secondary,
                      fontSize: 11,
                      fontWeight: "900",
                      marginBottom: 8,
                    }}
                  >
                    PLAYLIST NAME
                  </Text>
                  <TextInput
                    maxLength={40}
                    onChangeText={setName}
                    placeholder="Playlist name"
                    placeholderTextColor={theme.muted}
                    style={{
                      color: theme.primary,
                      fontSize: 20,
                      fontWeight: "900",
                      padding: 0,
                    }}
                    value={name}
                  />
                  {nameError ? (
                    <Text
                      style={{ color: "#EF476F", fontSize: 11, marginTop: 6 }}
                    >
                      {nameError}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      color: theme.secondary,
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
                    {selectedSongIds.length} selected songs
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 16,
                    fontWeight: "900",
                  }}
                >
                  Add Songs
                </Text>
                <Text style={{ color: theme.secondary, fontSize: 11 }}>
                  Selected songs appear first
                </Text>
              </View>
              <Pressable
                disabled={Boolean(nameError) || saving}
                onPress={handleSave}
                style={{
                  alignItems: "center",
                  backgroundColor: theme.accent,
                  borderRadius: 18,
                  flexDirection: "row",
                  gap: 6,
                  minHeight: 36,
                  opacity: nameError || saving ? 0.45 : 1,
                  paddingHorizontal: 14,
                }}
              >
                <Ionicons name="checkmark" color="#FFFFFF" size={16} />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}
                >
                  Save
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                {
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 18,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 10,
                  minHeight: 44,
                  paddingHorizontal: 14,
                },
                softShadow(theme.isDark, "low"),
              ]}
            >
              <Ionicons
                name="search-outline"
                color={theme.secondary}
                size={18}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setSearchQuery}
                placeholder="Search songs"
                placeholderTextColor={theme.muted}
                returnKeyType="search"
                style={{
                  color: theme.primary,
                  flex: 1,
                  fontSize: 13,
                  paddingVertical: 10,
                }}
                value={searchQuery}
              />
              {searchQuery ? (
                <Pressable
                  accessibilityLabel="Clear song search"
                  hitSlop={8}
                  onPress={() => setSearchQuery("")}
                >
                  <Ionicons
                    name="close-circle"
                    color={theme.secondary}
                    size={18}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 22 }}>
            <Ionicons
              name="musical-notes-outline"
              color={theme.accent}
              size={28}
            />
            <Text
              style={{
                color: theme.primary,
                fontSize: 14,
                fontWeight: "900",
                marginTop: 8,
              }}
            >
              {songs.length ? "No matching songs" : "No songs available"}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const selected = selectedSongSet.has(item.id);

          return (
            <Pressable
              onPress={() => toggleSong(item.id)}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: selected ? `${theme.accent}18` : theme.card,
                  borderColor: selected ? theme.accent : theme.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 12,
                  padding: 10,
                },
                softShadow(theme.isDark, "low"),
              ]}
            >
              <Artwork size={46} index={index} source={item} />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.primary,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  {getTrackTitle(item)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: theme.secondary, fontSize: 11 }}
                >
                  {getTrackArtist(item)}
                </Text>
              </View>
              <Ionicons
                name={selected ? "checkmark-circle" : "add-circle-outline"}
                color={selected ? theme.accent : theme.secondary}
                size={22}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}
