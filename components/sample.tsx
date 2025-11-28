// components/sample.tsx
"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import useNotesContract from "@/hooks/useContract"

const SampleIntregation = () => {
  const { isConnected } = useAccount()
  const [noteContent, setNoteContent] = useState("")
  const [deleteIndex, setDeleteIndex] = useState("")

  const { data, actions, state } = useNotesContract()

  const handleAddNote = async () => {
    if (!noteContent || noteContent.trim().length === 0) return
    try {
      await actions.addNote(noteContent.trim())
      setNoteContent("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleDelete = async () => {
    try {
      const idx = Number(deleteIndex)
      if (Number.isNaN(idx) || idx < 0) return
      await actions.deleteNote(idx)
      setDeleteIndex("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">ClassNotes Contract</h2>
          <p className="text-muted-foreground">Please connect your wallet to interact with the contract.</p>
        </div>
      </div>
    )
  }

  const canAdd = noteContent.trim().length > 0
  const canDelete = deleteIndex === "" ? false : (!Number.isNaN(Number(deleteIndex)) && Number(deleteIndex) >= 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">ClassNotes</h1>
          <p className="text-muted-foreground text-sm mt-1">Simple on-chain notes storage</p>
        </div>

        {/* Contract Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Total Notes</p>
            <p className="text-2xl font-semibold text-foreground">{data.totalNotes}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Notes Fetched</p>
            <p className="text-2xl font-semibold text-foreground">{data.notes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Note: UI fetch for individual notes is not automatic; use index reads if needed.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Add Note */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <label className="block text-sm font-medium text-foreground">Add Note</label>
            </div>
            <textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              rows={4}
            />
          </div>

          {/* Add Note Button */}
          <button
            onClick={handleAddNote}
            disabled={state.isLoading || state.isPending || !canAdd}
            className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {state.isLoading || state.isPending ? "Adding Note..." : "Add Note"}
          </button>

          {/* Delete Note */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </span>
              <label className="block text-sm font-medium text-foreground">Delete Note (by index)</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Note index (0-based)"
                value={deleteIndex}
                onChange={(e) => setDeleteIndex(e.target.value)}
                min="0"
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={state.isLoading || state.isPending || !canDelete}
              className="w-full px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Deleting..." : "Delete Note"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {state.hash && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Transaction Hash</p>
            <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
            {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
            {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
          </div>
        )}

        {state.error && (
          <div className="mt-6 p-4 bg-card border border-destructive rounded-lg">
            <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleIntregation
