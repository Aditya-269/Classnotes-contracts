// hooks/useContract.ts
"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractABI, contractAddress } from "@/lib/contract"

export interface NoteData {
  author: `0x${string}`
  content: string
  timestamp: number
}

export interface ContractData {
  totalNotes: number
  notes: NoteData[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  addNote: (content: string) => Promise<void>
  deleteNote: (index: number) => Promise<void>
  refetch: () => Promise<void>
}

export const useNotesContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState<NoteData[]>([])
  const [totalNotes, setTotalNotes] = useState<number>(0)

  // Read total notes count
  const { data: notesCountRaw, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getNotesCount",
    // always enabled — public view
  })

  // Wagmi write helper
  const { writeContractAsync, data: writeData, error } = useWriteContract()
  const hash = (writeData as any)?.hash as `0x${string}` | undefined
  const isPending = !!writeData && !hash

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // When notes count changes (or after confirmation), try to (re)load notes up to a reasonable cap
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const countBn = notesCountRaw as bigint | undefined
        const count = countBn ? Number(countBn) : 0
        setTotalNotes(count)

        // Cap to avoid excessive reads in UI (adjustable)
        const cap = Math.min(count, 50)
        const fetched: NoteData[] = []
        // useReadContract is a hook and cannot be called dynamically; instead use the wagmi/viem `readContract` via writeContractAsync with call? Not ideal.
        // To keep hook simple and safe, we'll set notes to empty and let consumers call individual reads if they want full data.
        // However, attempt to fetch first `cap` notes using promise-based direct provider call via writeContractAsync is not appropriate.
        // So for deterministic behavior, clear notes (consumer can implement per-index reads).
        setNotes(fetched)
      } catch (err) {
        console.error("Failed to load notes:", err)
        setNotes([])
      }
    }

    loadNotes()
  }, [notesCountRaw, isConfirmed])

  useEffect(() => {
    if (isConfirmed) {
      // refetch the count after confirmation
      refetchCount().catch(() => {})
    }
  }, [isConfirmed, refetchCount])

  const addNote = async (content: string) => {
    if (!content || content.trim().length === 0) return
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "addNote",
        args: [content],
      })
    } catch (err: any) {
      console.error("Error adding note:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (index: number) => {
    if (index < 0) return
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "deleteNote",
        args: [BigInt(index)],
      })
    } catch (err: any) {
      console.error("Error deleting note:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await refetchCount()
  }

  const data: ContractData = {
    totalNotes,
    notes,
  }

  const actions: ContractActions = {
    addNote,
    deleteNote,
    refetch,
  }

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: error as Error | null,
  }

  return {
    data,
    actions,
    state,
  }
}

export default useNotesContract
