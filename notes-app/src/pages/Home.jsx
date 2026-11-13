import { useCallback, useEffect, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { MdDelete, MdEdit } from "react-icons/md"
import Hero from "../components/Hero";
import { get_categories } from "../services/categoryservice"
import { addNote, deleteNote, getNotes, updateNote } from "../services/notesService"

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again."

function Home() {
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: "", content: "", category: "" })

  const loadNotes = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await getNotes()
      setNotes(response.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
    get_categories()
      .then((response) => {
        setCategories(response.Cat_list || [])
        setCategoriesError("")
      })
      .catch((requestError) => {
        setCategoriesError(getErrorMessage(requestError))
      })
  }, [loadNotes])

  const openCreateForm = () => {
    setEditingNote(null)
    setForm({ title: "", content: "", category: "" })
    setFormError("")
    setIsFormOpen(true)
  }

  const openEditForm = (note) => {
    setEditingNote(note)
    setForm({
      title: note.title,
      content: note.content,
      category: note.category ?? "",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError("")
    setIsSaving(true)

    const noteData = {
      title: form.title.trim(),
      content: form.content,
      ...(editingNote
        ? { category: form.category === "" ? null : Number(form.category) }
        : form.category !== ""
          ? { category: Number(form.category) }
          : {}),
    }

    try {
      if (editingNote) {
        await updateNote(editingNote._id, noteData)
      } else {
        await addNote(noteData)
      }
      setIsFormOpen(false)
      await loadNotes()
    } catch (requestError) {
      setFormError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (noteId) => {
    setError("")
    try {
      await deleteNote(noteId)
      setNotes((currentNotes) => currentNotes.filter((note) => note._id !== noteId))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <>
      <Hero onCreateNote={openCreateForm} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Your notes</h1>
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <FaPlus /> New note
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="py-10 text-slate-600" role="status">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="py-10 text-slate-600">No notes yet. Create one to get started.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <article key={note._id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="break-words text-lg font-semibold text-slate-900">{note.title}</h2>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(note)}
                      aria-label={`Edit ${note.title}`}
                      className="text-green-700 hover:text-green-900"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note._id)}
                      aria-label={`Delete ${note.title}`}
                      className="text-red-700 hover:text-red-900"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{note.content}</p>
                {note.category != null && (
                  <p className="mt-4 text-xs text-slate-500">
                    {categories.find((category) => category._id === note.category)?.category_name || "Category"}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false)
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            aria-labelledby="note-form-title"
          >
            <h2 id="note-form-title" className="text-xl font-bold text-slate-900">
              {editingNote ? "Edit note" : "Create a note"}
            </h2>
            {formError && <p role="alert" className="mt-4 text-sm text-red-700">{formError}</p>}
            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="note-title">
              Title
            </label>
            <input
              id="note-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="note-content">
              Content
            </label>
            <textarea
              id="note-content"
              required
              rows={6}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="note-category">
              Category (optional)
            </label>
            {categoriesError && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                Categories could not be loaded: {categoriesError}
              </p>
            )}
            <select
              id="note-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.category_name}</option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSaving ? "Saving…" : editingNote ? "Save changes" : "Create note"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Home;
