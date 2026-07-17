import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Artwork,
  formatTime,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";
import { useUserLibraryStore } from "../../store/user-library.store";

type MetadataForm = {
  albumTitle: string;
  artist: string;
  genre: string;
  title: string;
};

function MetadataInput({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: theme.secondary, fontSize: 11, fontWeight: "900" }}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="words"
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.muted}
        selectionColor={theme.accent}
        style={{
          backgroundColor: theme.cardSoft,
          borderColor: theme.border,
          borderRadius: 14,
          borderWidth: 1,
          color: theme.primary,
          fontSize: 14,
          fontWeight: "800",
          minHeight: 46,
          paddingHorizontal: 14,
        }}
        value={value}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
        gap: 4,
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: theme.secondary, fontSize: 11, fontWeight: "900" }}>
        {label}
      </Text>
      <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}

export default function SongDetailsScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const songs = useLibraryStore((state) => state.songs);
  const updateSongMetadata = useLibraryStore(
    (state) => state.updateSongMetadata,
  );
  const playSong = usePlayerStore((state) => state.playSong);
  const favoriteSongIds = useUserLibraryStore((state) => state.favoriteSongIds);
  const playlists = useUserLibraryStore((state) => state.playlists);
  const setPlaylistSongs = useUserLibraryStore(
    (state) => state.setPlaylistSongs,
  );
  const toggleFavorite = useUserLibraryStore((state) => state.toggleFavorite);
  const songIndex = songs.findIndex((item) => item.id === id);
  const song = songs[songIndex];
  const isFavorite = favoriteSongIds.includes(id ?? "");
  const [editorVisible, setEditorVisible] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState<MetadataForm>({
    albumTitle: "",
    artist: "",
    genre: "",
    title: "",
  });

  useEffect(() => {
    if (!song) {
      return;
    }

    setMetadataForm({
      albumTitle: song.albumTitle ?? "",
      artist: song.artist ?? "",
      genre: song.genre ?? "",
      title: song.title ?? getTrackTitle(song),
    });
  }, [song?.albumTitle, song?.artist, song?.genre, song?.id, song?.title]);

  const setMetadataField =
    (field: keyof MetadataForm) => (value: string) => {
      setMetadataForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));
    };

  const saveMetadata = async () => {
    if (!song || savingMetadata) {
      return;
    }

    setSavingMetadata(true);

    try {
      const result = await updateSongMetadata(song.id, metadataForm);

      setEditorVisible(false);

      if (!result.deviceUpdated) {
        Alert.alert(
          "Saved in WaveTune",
          "Android did not allow updating the system music record, so these edits are saved inside WaveTune.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Unable to save metadata",
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the metadata.",
      );
    } finally {
      setSavingMetadata(false);
    }
  };

  const togglePlaylist = (playlistId: string) => {
    const playlist = playlists.find((item) => item.id === playlistId);

    if (!playlist || !song) {
      return;
    }

    const nextSongIds = playlist.songIds.includes(song.id)
      ? playlist.songIds.filter((songId) => songId !== song.id)
      : [...playlist.songIds, song.id];

    setPlaylistSongs(playlist.id, nextSongIds);
  };

  if (!song) {
    return (
      <View
        style={{
          backgroundColor: theme.background,
          flex: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ left: 16, padding: 8, position: "absolute", top: 18 }}
        >
          <Ionicons name="chevron-back" size={28} color={theme.icon} />
        </Pressable>
        <Text style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}>
          Song not found
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 14, marginTop: 8 }}>
          This song may need to be scanned again.
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: theme.background, flex: 1 }}
        contentContainerStyle={{
          gap: 18,
          paddingBottom: 152,
          paddingHorizontal: 22,
          paddingTop: 14,
        }}
      >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
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
          Song Details
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditorVisible(true)}
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
            <Ionicons name="create-outline" color={theme.icon} size={19} />
          </Pressable>
          <Pressable
            onPress={() => toggleFavorite(song.id)}
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
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              color={isFavorite ? "#EF476F" : theme.icon}
              size={20}
            />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 26,
            borderWidth: 1,
            padding: 22,
          },
          softShadow(theme.isDark, "high"),
        ]}
      >
        <Artwork size={180} index={songIndex} source={song} />
        <Text
          numberOfLines={2}
          style={{
            color: theme.primary,
            fontSize: 24,
            fontWeight: "900",
            lineHeight: 29,
            marginTop: 18,
            textAlign: "center",
          }}
        >
          {getTrackTitle(song)}
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 13, marginTop: 6 }}>
          {getTrackArtist(song)}
        </Text>

        <Pressable
          onPress={() => {
            void playSong(song, songs);
          }}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.accent,
              borderRadius: 24,
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              marginTop: 22,
              minHeight: 46,
              paddingHorizontal: 24,
            },
            softShadow(theme.isDark, "high"),
          ]}
        >
          <Ionicons name="play" color="#FFFFFF" size={17} />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>
            Play Song
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 20,
            borderWidth: 1,
            paddingHorizontal: 16,
          },
          softShadow(theme.isDark, "low"),
        ]}
      >
        <DetailRow label="Title" value={getTrackTitle(song)} />
        <DetailRow label="Duration" value={formatTime(song.duration ?? 0)} />
        <DetailRow label="Artist" value={song.artist ?? "Unknown Artist"} />
        <DetailRow label="Album" value={song.albumTitle ?? "Unknown Album"} />
        <DetailRow label="Genre" value={song.genre ?? "Unknown Genre"} />
        <DetailRow label="File Name" value={song.filename} />
        <DetailRow label="Media ID" value={song.id} />
        <DetailRow
          label="Created"
          value={
            song.creationTime
              ? new Date(song.creationTime).toLocaleDateString()
              : "Unknown"
          }
        />
        <DetailRow
          label="Modified"
          value={
            song.modificationTime
              ? new Date(song.modificationTime).toLocaleDateString()
              : "Unknown"
          }
        />
      </View>

      <View>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text
            style={{ color: theme.primary, fontSize: 16, fontWeight: "900" }}
          >
            Playlists
          </Text>
          <Pressable onPress={() => router.push("/playlist/new")}>
            <Text
              style={{ color: theme.accent, fontSize: 12, fontWeight: "900" }}
            >
              New Playlist
            </Text>
          </Pressable>
        </View>

        {playlists.length ? (
          <View style={{ gap: 10 }}>
            {playlists.map((playlist, index) => {
              const selected = playlist.songIds.includes(song.id);

              return (
                <Pressable
                  key={playlist.id}
                  onPress={() => togglePlaylist(playlist.id)}
                  style={[
                    {
                      alignItems: "center",
                      backgroundColor: selected
                        ? `${theme.accent}18`
                        : theme.card,
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
                  <Artwork icon="list" size={44} index={index} />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: theme.primary,
                        fontSize: 13,
                        fontWeight: "900",
                      }}
                    >
                      {playlist.name}
                    </Text>
                    <Text style={{ color: theme.secondary, fontSize: 11 }}>
                      {playlist.songIds.length} songs
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? "checkmark-circle" : "add-circle-outline"}
                    color={selected ? theme.accent : theme.secondary}
                    size={22}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderRadius: 16,
                borderWidth: 1,
                padding: 16,
              },
              softShadow(theme.isDark, "low"),
            ]}
          >
            <Text
              style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
            >
              No playlists yet
            </Text>
            <Text
              style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}
            >
              Create a playlist, then add this song from here.
            </Text>
          </View>
        )}
      </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!savingMetadata) {
            setEditorVisible(false);
          }
        }}
        transparent
        visible={editorVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            backgroundColor: theme.isDark
              ? "rgba(4, 8, 14, 0.78)"
              : "rgba(18, 22, 42, 0.28)",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              gap: 18,
              maxHeight: "88%",
              paddingBottom: 28,
              paddingHorizontal: 22,
              paddingTop: 20,
            }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: "900",
                }}
              >
                Edit Metadata
              </Text>
              <Pressable
                disabled={savingMetadata}
                onPress={() => setEditorVisible(false)}
                style={{
                  alignItems: "center",
                  height: 36,
                  justifyContent: "center",
                  opacity: savingMetadata ? 0.5 : 1,
                  width: 36,
                }}
              >
                <Ionicons name="close" color={theme.icon} size={22} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 360 }}
              contentContainerStyle={{ gap: 14 }}
            >
              <MetadataInput
                label="Title"
                onChangeText={setMetadataField("title")}
                value={metadataForm.title}
              />
              <MetadataInput
                label="Artist"
                onChangeText={setMetadataField("artist")}
                value={metadataForm.artist}
              />
              <MetadataInput
                label="Album"
                onChangeText={setMetadataField("albumTitle")}
                value={metadataForm.albumTitle}
              />
              <MetadataInput
                label="Genre"
                onChangeText={setMetadataField("genre")}
                value={metadataForm.genre}
              />
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                disabled={savingMetadata}
                onPress={() => setEditorVisible(false)}
                style={{
                  alignItems: "center",
                  backgroundColor: theme.cardSoft,
                  borderColor: theme.border,
                  borderRadius: 16,
                  borderWidth: 1,
                  flex: 1,
                  justifyContent: "center",
                  minHeight: 46,
                  opacity: savingMetadata ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                disabled={savingMetadata}
                onPress={() => {
                  void saveMetadata();
                }}
                style={{
                  alignItems: "center",
                  backgroundColor: theme.accent,
                  borderRadius: 16,
                  flex: 1,
                  justifyContent: "center",
                  minHeight: 46,
                  opacity: savingMetadata ? 0.72 : 1,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  {savingMetadata ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
