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
import { useLibraryStore } from "../../store/library.store";
import { useUserLibraryStore } from "../../store/user-library.store";

export default function PlaylistDetailsScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const songs = useLibraryStore((state) => state.songs);
  const playlists = useUserLibraryStore((state) => state.playlists);
  const createPlaylist = useUserLibraryStore((state) => state.createPlaylist);
  const deletePlaylist = useUserLibraryStore((state) => state.deletePlaylist);
  const updatePlaylist = useUserLibraryStore((state) => state.updatePlaylist);
  const isNewPlaylist = id === "new";
  const playlist = playlists.find((item) => item.id === id);
  const [name, setName] = useState(playlist?.name ?? "");
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(
    playlist?.songIds ?? [],
  );

  const selectedSongSet = useMemo(
    () => new Set(selectedSongIds),
    [selectedSongIds],
  );

  const toggleSong = (songId: string) => {
    setSelectedSongIds((current) =>
      current.includes(songId)
        ? current.filter((item) => item !== songId)
        : [...current, songId],
    );
  };

  const handleSave = () => {
    if (isNewPlaylist) {
      const playlistId = createPlaylist(name, selectedSongIds);
      router.replace(`/playlist/${playlistId}`);
      return;
    }

    if (playlist) {
      updatePlaylist(playlist.id, { name, songIds: selectedSongIds });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!playlist) {
      router.back();
      return;
    }

    deletePlaylist(playlist.id);
    router.back();
  };

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
        <Pressable
          onPress={() => router.back()}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 18,
              borderWidth: 1,
              height: 38,
              justifyContent: "center",
              width: 38,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Ionicons name="chevron-back" color={theme.icon} size={21} />
        </Pressable>
        <Text style={{ color: theme.primary, fontSize: 18, fontWeight: "900" }}>
          {isNewPlaylist ? "Create Playlist" : "Edit Playlist"}
        </Text>
        {!isNewPlaylist ? (
          <Pressable
            onPress={handleDelete}
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderRadius: 18,
                borderWidth: 1,
                height: 38,
                justifyContent: "center",
                width: 38,
              },
              softShadow(theme.isDark, "low"),
            ]}
          >
            <Ionicons name="trash-outline" color="#EF476F" size={19} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ gap: 20, paddingBottom: 18 }}>
            <View
              style={[
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 22,
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
                  <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 8 }}>
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
              <Text style={{ color: theme.primary, fontSize: 16, fontWeight: "900" }}>
                Add Songs
              </Text>
              <Pressable
                onPress={handleSave}
                style={{
                  alignItems: "center",
                  backgroundColor: theme.accent,
                  borderRadius: 18,
                  flexDirection: "row",
                  gap: 6,
                  minHeight: 36,
                  paddingHorizontal: 14,
                }}
              >
                <Ionicons name="checkmark" color="#FFFFFF" size={16} />
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderRadius: 18,
                borderWidth: 1,
                padding: 22,
              },
              softShadow(theme.isDark, "low"),
            ]}
          >
            <Ionicons name="musical-notes-outline" color={theme.accent} size={28} />
            <Text
              style={{
                color: theme.primary,
                fontSize: 14,
                fontWeight: "900",
                marginTop: 8,
              }}
            >
              No songs available
            </Text>
            <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}>
              Rescan your library from Settings to add music.
            </Text>
          </View>
        }
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 150,
          paddingHorizontal: 22,
          paddingTop: 22,
        }}
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
                  borderRadius: 16,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 12,
                  padding: 10,
                },
                softShadow(theme.isDark, "low"),
              ]}
            >
              <Artwork size={46} index={index} />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
                >
                  {getTrackTitle(item.filename)}
                </Text>
                <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 11 }}>
                  {getTrackArtist(index)}
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
