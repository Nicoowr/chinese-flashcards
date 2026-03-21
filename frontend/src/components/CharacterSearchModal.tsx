"use client";

import dayjs from "dayjs";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { toast } from "sonner";
import { authenticatedApiFetch } from "../lib/supabaseClient";
import {
  Body,
  Box,
  Button,
  Card,
  HStack,
  Loader,
  VStack,
} from "../design-system/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../design-system/components/dialog";
import { ChineseCharacter } from "./types";

type CharacterListResponse = Omit<ChineseCharacter, "addedAt" | "lastSeenAt"> & {
  addedAt: string | null;
  lastSeenAt: string | null;
};

const toCharacter = (response: CharacterListResponse): ChineseCharacter => ({
  ...response,
  addedAt: response.addedAt ? new Date(`${response.addedAt}T00:00:00.000Z`) : null,
  lastSeenAt: response.lastSeenAt ? new Date(`${response.lastSeenAt}T00:00:00.000Z`) : null,
});

const fetchAdminCharacters = async (): Promise<ChineseCharacter[]> => {
  const response = await authenticatedApiFetch("/api/admin/characters?limit=1000");
  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Failed to fetch characters");
  }

  const payload = (await response.json()) as CharacterListResponse[];
  return payload.map(toCharacter);
};

const formatLastSeenLabel = (lastSeenAt: Date | null) => {
  if (!lastSeenAt) {
    return "Never";
  }

  return dayjs(lastSeenAt).format("YYYY-MM-DD");
};

const getTypeBadgeClassName = (type: ChineseCharacter["type"]) => {
  const baseClassName =
    "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize";

  if (type === "verb") {
    return `${baseClassName} border-cyan-400/20 bg-cyan-400/10 text-cyan-200`;
  }

  if (type === "noun") {
    return `${baseClassName} border-violet-400/20 bg-violet-400/10 text-violet-200`;
  }

  if (type === "adjective") {
    return `${baseClassName} border-emerald-400/20 bg-emerald-400/10 text-emerald-200`;
  }

  if (type === "adverb") {
    return `${baseClassName} border-amber-400/20 bg-amber-400/10 text-amber-200`;
  }

  if (type === "link") {
    return `${baseClassName} border-pink-400/20 bg-pink-400/10 text-pink-200`;
  }

  return `${baseClassName} border-white/10 bg-white/5 text-slate-300`;
};

const getImportanceBadgeClassName = (importance: ChineseCharacter["importance"]) => {
  const baseClassName =
    "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize";

  if (importance === "high") {
    return `${baseClassName} border-rose-400/20 bg-rose-400/10 text-rose-200`;
  }

  if (importance === "medium") {
    return `${baseClassName} border-amber-400/20 bg-amber-400/10 text-amber-200`;
  }

  if (importance === "low") {
    return `${baseClassName} border-emerald-400/20 bg-emerald-400/10 text-emerald-200`;
  }

  return `${baseClassName} border-white/10 bg-white/5 text-slate-300`;
};

type ResultsSummaryParams = {
  query: string;
  filteredCount: number;
  totalCount: number;
};


const normalizeForSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

const getResultsSummary = ({
  query,
  filteredCount,
  totalCount,
}: ResultsSummaryParams) => {
  const hasQuery = query.trim().length > 0;

  if (!hasQuery) {
    return `Showing all ${totalCount} characters`;
  }

  return `${filteredCount} match${filteredCount === 1 ? "" : "es"} for "${query.trim()}"`;
};

export const CharacterSearchModal = ({
  isOpen,
  onClose,
  onEditCharacter,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEditCharacter: (character: ChineseCharacter) => void;
}) => {
  const [query, setQuery] = useState("");
  const { data, isLoading, isFetching } = useQuery(
    ["adminCharacters"],
    fetchAdminCharacters,
    {
      enabled: isOpen,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch character list"
        );
      },
    }
  );

  const filtered = useMemo(() => {
    const allCharacters = data ?? [];
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return allCharacters;
    }

    const normalizedQuery = normalizeForSearch(trimmedQuery);

    return allCharacters.filter((character) =>
      [
        character.character,
        character.translation,
        character.example,
        character.type,
        character.importance,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => {
          const lowerValue = value.toLowerCase();
          return (
            lowerValue.includes(trimmedQuery.toLowerCase()) ||
            normalizeForSearch(value).includes(normalizedQuery)
          );
        })
    );
  }, [data, query]);

  const allCharacters = data ?? [];
  const filteredCount = filtered.length;
  const totalCount = allCharacters.length;
  const isInitialLoading = (isLoading || isFetching) && !data;
  const resultsSummary = getResultsSummary({
    query,
    filteredCount,
    totalCount,
  });

  const closeModal = () => {
    setQuery("");
    onClose();
  };

  const handleEdit = (character: ChineseCharacter) => {
    onEditCharacter(character);
    closeModal();
  };

  const renderResults = () => {
    if (isInitialLoading) {
      return (
        <VStack
          className="px-6 py-14"
          alignItems="center"
          justifyContent="center"
          gap={10}
        >
          <Loader />
          <Body className="text-sm text-slate-400">Loading characters...</Body>
        </VStack>
      );
    }

    if (filteredCount === 0) {
      return (
        <VStack
          className="px-6 py-14 text-center"
          alignItems="center"
          justifyContent="center"
          gap={10}
        >
          <Body className="text-base font-medium text-slate-200">
            No characters match this search yet.
          </Body>
          <Body className="max-w-md text-sm text-slate-400">
            Try a character, pinyin, translation, example, type, or importance keyword.
          </Body>
        </VStack>
      );
    }

    return (
      <table className="w-full min-w-[760px] text-sm">
        <thead className="sticky top-0 z-10 bg-slate-950/95 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur-sm">
          <tr>
            <th className="px-5 py-4 text-left">Character</th>
            <th className="px-5 py-4 text-left">Translation</th>
            <th className="px-5 py-4 text-left">Type</th>
            <th className="px-5 py-4 text-left">Importance</th>
            <th className="px-5 py-4 text-left">Seen</th>
            <th className="px-5 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((character) => (
            <tr
              key={character.id}
              className="border-t border-white/5 text-slate-200 transition hover:bg-white/[0.045]"
            >
              <td className="px-5 py-4 align-middle text-2xl font-semibold tracking-wide text-white">
                {character.character}
              </td>
              <td className="max-w-[280px] px-5 py-4 align-middle text-slate-300">
                <Body as="div" className="truncate">
                  {character.translation || "—"}
                </Body>
                <Body as="div" className="mt-1 truncate text-xs text-slate-500">
                  {character.example || "No example yet"}
                </Body>
              </td>
              <td className="px-5 py-4 align-middle">
                <Body className={getTypeBadgeClassName(character.type)}>
                  {character.type ?? "Unspecified"}
                </Body>
              </td>
              <td className="px-5 py-4 align-middle">
                <Body className={getImportanceBadgeClassName(character.importance)}>
                  {character.importance ?? "Unspecified"}
                </Body>
              </td>
              <td className="px-5 py-4 align-middle text-slate-300">
                {formatLastSeenLabel(character.lastSeenAt)}
              </td>
              <td className="px-5 py-4 text-right align-middle">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20 hover:text-white"
                  onClick={() => handleEdit(character)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeModal() : null)}>
      <DialogContent className="max-w-5xl overflow-hidden border-white/10 bg-slate-900/95 p-0 text-slate-100">
        <Card className="relative w-full overflow-hidden border-0 bg-transparent text-slate-100 shadow-none">
          <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_38%)]" />

          <Box className="relative border-b border-white/10 px-8 py-7">
            <DialogHeader className="max-w-3xl pr-12">
              <Body className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Character Library
              </Body>
              <DialogTitle>Find and edit any character</DialogTitle>
              <DialogDescription className="mt-2">
                Search by character, pinyin, translation, type, example, or importance and
                jump directly into the editor.
              </DialogDescription>
            </DialogHeader>

            <HStack
              className="mt-5 flex-wrap text-sm text-slate-400"
              alignItems="center"
              gap={12}
            >
              <Body className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                {totalCount} total
              </Body>
              <Body className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {resultsSummary}
              </Body>
            </HStack>
          </Box>

          <VStack className="relative px-8 py-6" gap={18}>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search character, pinyin, translation, example, type, or importance"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm text-slate-100 outline-hidden transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <Box className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/55 shadow-inner shadow-black/20">
              <Box className="max-h-[56vh] overflow-auto">{renderResults()}</Box>
            </Box>
          </VStack>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
