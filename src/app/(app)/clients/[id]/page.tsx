"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
    Mail,
    Phone,
    Calendar,
    Wallet,
    ArrowLeft,
    Settings,
    ShieldCheck,
    FileText,
    Loader2
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TiptapEditor } from "@/components/editor"

type ClientWithFinancials = {
    id: string
    client_name: string
    company_name: string | null
    contact_email: string | null
    phone: string | null
    industry: string | null
    lead_source: string | null
    contract_start_date: string | null
    contract_end_date: string | null
    renewal_date: string | null
    payment_structure: string | null
    status: string
    total_revenue: number
    total_cost: number
    total_profit: number
    margin_percent: number
}

export default function ClientDetailsPage() {
    const params = useParams()
    const id = params.id as string

    const [client, setClient] = useState<ClientWithFinancials | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadClient() {
            try {
                const res = await fetch(`/api/clients/${id}`)
                if (!res.ok) {
                    if (res.status === 404) setError("Client not found")
                    else setError("Failed to load client")
                    return
                }
                const data = await res.json()
                setClient(data)
            } catch {
                setError("Failed to load client")
            } finally {
                setLoading(false)
            }
        }
        loadClient()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading client...
            </div>
        )
    }

    if (error || !client) {
        return (
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error ?? "Client not found"}
                </div>
            </div>
        )
    }

    const renewalDays = client.renewal_date
        ? Math.round((new Date(client.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{client.company_name ?? client.client_name}</h1>
                        <Badge
                            className={
                                client.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            }
                        >
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{client.client_name} • {client.industry ?? "—"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-zinc-800">
                        <Settings className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90">Create Project</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Contact Info
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">{client.contact_email ?? "—"}</div>
                        <div className="text-xs text-zinc-500 mt-1">{client.phone ?? "—"}</div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Contract Period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {client.contract_start_date ?? "—"} → {client.contract_end_date ?? "—"}
                        </div>
                        {renewalDays !== null && (
                            <div className={`text-xs mt-1 ${renewalDays < 30 ? "text-red-400" : "text-amber-500"}`}>
                                {renewalDays > 0 ? `Renewal in ${renewalDays} days` : "Contract expired"}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                            <Wallet className="h-3 w-3" /> Financial Summary
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">${client.total_revenue.toLocaleString()} Revenue</div>
                        <div className="text-xs text-emerald-500 mt-1">
                            ${client.total_profit.toLocaleString()} Profit • {client.margin_percent.toFixed(1)}% Margin
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> Payment Terms
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">{client.payment_structure ?? "40/60"} Split</div>
                        <div className="text-xs text-zinc-500 mt-1">Auto-calculated invoices</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="notes" className="w-full">
                <TabsList className="bg-zinc-950 border border-zinc-900 p-1">
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="notes">Rich Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Client Internal Notes
                            </h2>
                        </div>
                        <TiptapEditor content="" />
                    </div>
                </TabsContent>
                <TabsContent value="projects" className="mt-6">
                    <Card className="bg-transparent border-zinc-800 border-dashed">
                        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                            Projects for this client will appear here.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
