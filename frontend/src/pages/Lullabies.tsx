import { useEffect, useState } from "react";
import { Card, Title, Text, Stack, TextInput, UnstyledButton, Group, Avatar, List, Loader, Anchor } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { getIdentityToken } from "../identity";
import { apiGet, apiPost, apiUrl } from "../api";
import { icons } from "../assets/icons";
import { resolveThemed, useTheme } from "../assets/themed";

interface SearchResult {
  uri: string;
  title: string;
  artist: string;
  albumArt: string | null;
}

interface LullabyTally {
  uri: string;
  title: string;
  artist: string;
  count: number;
}

export default function Lullabies() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<LullabyTally[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const theme = useTheme();

  // Subscribes to the live playlist: the backend pushes the full list
  // whenever anyone adds a track, same as Baby Names' live tallies.
  useEffect(() => {
    const source = new EventSource(apiUrl("/lullabies/stream"));
    source.onmessage = (event) => setPlaylist(JSON.parse(event.data));
    return () => source.close();
  }, []);

  useEffect(() => {
    apiGet<{ url: string | null }>("/lullabies/playlist").then(({ url }) => setPlaylistUrl(url));
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    apiGet<SearchResult[]>("/lullabies/search", { q: debouncedQuery })
      .then((found) => {
        if (!cancelled) setResults(found);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  async function addTrack(track: SearchResult) {
    if (!getIdentityToken()) return;
    setAdding(track.uri);
    try {
      // The playlist list itself updates via the /lullabies/stream
      // subscription above, not from this response — same as Baby Names.
      await apiPost("/lullabies", track);
      setQuery("");
      setResults([]);
    } finally {
      setAdding(null);
    }
  }

  return (
    <Stack maw={480}>
      <Card>
        <Stack>
          <Title order={2}>{resolveThemed(icons.lullabies, theme)} Lulubies Playlist</Title>
          <Text c="dimmed">Search for a song to add it to the sleep-time playlist!</Text>
          <TextInput
            placeholder="Search Spotify..."
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            rightSection={searching ? <Loader size="xs" /> : null}
          />
          {results.length > 0 && (
            <Stack gap={4}>
              {results.map((track) => (
                <UnstyledButton
                  key={track.uri}
                  onClick={() => addTrack(track)}
                  disabled={adding !== null}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={track.albumArt} radius="sm" />
                    <div>
                      <Text size="sm" fw={500}>
                        {track.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {track.artist}
                      </Text>
                    </div>
                    {adding === track.uri && <Loader size="xs" ml="auto" />}
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {playlistUrl && (
        <Anchor href={playlistUrl} target="_blank" rel="noreferrer">
          🎧 Listen & follow on Spotify
        </Anchor>
      )}

      <List>
        {playlist.map((entry) => (
          <List.Item key={entry.uri}>
            {entry.title} — {entry.artist}
            {entry.count > 1 ? ` (${entry.count})` : ""}
          </List.Item>
        ))}
      </List>
    </Stack>
  );
}
