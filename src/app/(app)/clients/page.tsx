"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Plus,
    MoreHorizontal,
    Calendar,
    Filter,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ClientWithFinancials = {
    id: string
    client_name: string
    company_name: string | null
    contact_email: string | null
    industry: string | null
    status: string
    total_revenue: number
    total_profit: number
    margin_percent: number
    renewal_date: string | null
}

export default function ClientsPage() {
    const router = useRouter()
    const [clients, setClients] = useState<ClientWithFinancials[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        client_name: "",
        company_name: "",
        contact_email: "",
        phone: "",
        industry: "",
        lead_source: "",
        status: "active" as const,
    })

    useEffect(() => {
        loadClients()
    }, [])

    async function loadClients() {
        try {
            const res = await fetch("/api/clients")
            if (!res.ok) throw new Error("Failed to load clients")
            const data = await res.json()
            setClients(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveClient() {
        if (!form.client_name) return
        setSaving(true)
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to create client")
            setDialogOpen(false)
            setForm({ client_name: "", company_name: "", contact_email: "", phone: "", industry: "", lead_source: "", status: "active" })
            await loadClients()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this client? This cannot be undone.")) return
        try {
            await fetch(`/api/clients/${id}`, { method: "DELETE" })
            setClients((prev) => prev.filter((c) => c.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    const filtered = clients.filter((c) => {
        const q = search.toLowerCase()
        return (
            c.client_name.toLowerCase().includes(q) ||
            (c.company_name ?? "").toLowerCase().includes(q) ||
            (c.industry ?? "").toLowerCase().includes(q)
        )
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Maintain relationships and track profitability across your client base.
                    </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add New Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px] bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                            <DialogDescription>Enter the details for the new client.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Client Name *</Label>
                                    <Input
                                        placeholder="John Doe"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.client_name}
                                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        placeholder="Acme Inc."
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.company_name}
                                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.contact_email}
                                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        placeholder="+1 (555) 000-0000"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Input
                                        placeholder="Technology"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.industry}
                                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lead Source</Label>
                                    <Select
                                        value={form.lead_source}
                                        onValueChange={(v) => setForm({ ...form, lead_source: v })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clutch">Clutch</SelectItem>
                                            <SelectItem value="referral">Referral</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveClient} disabled={saving || !form.client_name}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Client"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search clients..."
                        className="pl-8 bg-zinc-900/50 border-zinc-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 gap-2 text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading clients...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
                            {search ? "No clients match your search." : "No clients yet. Add your first client."}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-zinc-900/50">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="font-semibold text-zinc-300">Client / Company</TableHead>
                                    <TableHead className="font-semibold text-zinc-300">Industry</TableHead>
                                    <TableHead className="font-semibold text-zinc-300">Status</TableHead>
                                    <TableHead className="font-semibold text-zinc-300">Total Revenue</TableHead>
                                    <TableHead className="font-semibold text-zinc-300">Profit / Margin</TableHead>
                                    <TableHead className="font-semibold text-zinc-300">Renewal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((client) => (
                                    <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-100">{client.client_name}</span>
                                                <span className="text-xs text-zinc-500">{client.company_name ?? "—"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-zinc-400">{client.industry ?? "—"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    client.status === "active"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : client.status === "paused"
                                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                                }
                                            >
                                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-zinc-200">
                                                ${client.total_revenue.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-400">
                                                    ${client.total_profit.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">
                                                    {client.margin_percent.toFixed(1)}% Margin
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-zinc-400 text-nowrap">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {client.renewal_date ?? "—"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => router.push(`/clients/${client.id}`)}
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-red-400"
                                                        onClick={() => handleDelete(client.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
