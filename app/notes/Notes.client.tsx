"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";

import { fetchNotes } from "@/lib/api";
import css from "./NotesPage.module.css";

export default function NotesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const [inputValue, setInputValue] = useState(search);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const perPage = 12;

  const updateParams = (newPage: number, newSearch: string) => {
    const params = new URLSearchParams();

    if (newPage > 1) params.set("page", String(newPage));
    if (newSearch) params.set("search", newSearch);

    router.push(`/notes?${params.toString()}`);
  };

  const debouncedHandler = useDebouncedCallback((value: string) => {
    updateParams(1, value);
  }, 500);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedHandler(value);
  };

  const handlePageChange = (newPage: number) => {
    updateParams(newPage, search);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", String(page), search],
    queryFn: () => fetchNotes(page, perPage, search),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleSearchChange} />

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}

        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      <main className={css.container}>
        {isLoading && <Loader />}
        {isError && <ErrorMessage />}
        {notes.length > 0 && !isLoading && <NoteList notes={notes} />}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
