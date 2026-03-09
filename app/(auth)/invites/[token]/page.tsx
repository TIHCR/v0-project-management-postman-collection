"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/src/lib/api-client" // ajusta o caminho

export default function AcceptInvitePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError("Token inválido.")
            return
        }

        apiClient
            .get<{ workspaceId: string }>(`/invites/accept?token=${token}`)
            .then(({ workspaceId }) => {
                router.push(`/workspaces/${workspaceId}`)
            })
            .catch((err) => {
                setError(err.message)
            })
    }, [token])

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <p className="text-red-500">{error}</p>
                <button onClick={() => router.push("/dashboard")} className="text-blue-600 underline">
                    Ir para o dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Aceitando convite...</p>
        </div>
    )
}