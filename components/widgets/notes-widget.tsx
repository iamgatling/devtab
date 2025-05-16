"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Save, Trash } from "lucide-react"
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
  id: string
  content: string
  date: Date
  userId: string
}

export function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const notesRef = collection(db, "notes")
    const q = query(notesRef, where("userId", "==", user.uid), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData: Note[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        notesData.push({
          id: doc.id,
          content: data.content,
          date: data.date.toDate(),
          userId: data.userId,
        })
      })
      setNotes(notesData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addNote = async () => {
    if (!newNote.trim() || !user) return

    try {
      await addDoc(collection(db, "notes"), {
        content: newNote,
        date: new Date(),
        userId: user.uid,
      })
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = async () => {
    if (!editingId) return

    try {
      const noteRef = doc(db, "notes", editingId)
      await updateDoc(noteRef, {
        content: editContent,
      })
      setEditingId(null)
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id))
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  return (
    <Card className="col-span-1 row-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Notes</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setNewNote("")}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add note</span>
        </Button>
      </CardHeader>
      <CardContent className="px-2">
        <Textarea
          placeholder="Add a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="mb-2 min-h-[80px] resize-none"
        />
        <Button onClick={addNote} size="sm" className="mb-4 w-full">
          Save Note
        </Button>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="rounded-md border p-3">
                  {editingId === note.id ? (
                    <>
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="mb-2 min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">{note.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{note.date.toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(note)}>
                            <Edit className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit note</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(note.id)}>
                            <Trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete note</span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
