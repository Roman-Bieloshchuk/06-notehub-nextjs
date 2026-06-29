import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { getQueryClient } from "@/lib/queryClient";
import { fetchNotes } from "@/lib/api";

interface NotesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const { page = "1", search = "" } = await searchParams;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", page, search],
    queryFn: () => fetchNotes(Number(page), 12, search),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient />
    </HydrationBoundary>
  );
}
