"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Mail,
    Phone,
    Calendar,
    Wallet,
    ArrowLeft,
    Settings,
    ShieldCheck,
    FileText,
    Loader2,
    Edit
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TiptapEditor } from "@/components/editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

type Project = {
    id: string
    title: string
    service_type: string
    price: number
    status: string
    start_date: string | null
    deadline: string | null
}

export default function ClientDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [client, setClient] = useState<ClientWithFinancials | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSaving, setEditingSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        client_name: "",
        company_name: "",
        contact_email: "",
        phone: "",
        industry: "",
        lead_source: "",
        contract_start_date: "",
        contract_end_date: "",
        renewal_date: "",
        payment_structure: "",
        status: "",
    })

    useEffect(() => {
        loadClient()
        loadProjects()
    }, [id])

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

    async function loadProjects() {
        setProjectsLoading(true)
        try {
            const res = await fetch(`/api/projects`)
            if (!res.ok) throw new Error("Failed to load projects")
            const allProjects = await res.json()
            // Filter projects for this client
            setProjects(allProjects.filter((p: any) => p.client_id === id))
        } catch {
            setProjects([])
        } finally {
            setProjectsLoading(false)
        }
    }

    function openEditDialog() {
        if (!client) return
        setEditForm({
            client_name: client.client_name,
            company_name: client.company_name || "",
            contact_email: client.contact_email || "",
            phone: client.phone || "",
            industry: client.industry || "",
            lead_source: client.lead_source || "",
            contract_start_date: client.contract_start_date || "",
            contract_end_date: client.contract_end_date || "",
            renewal_date: client.renewal_date || "",
            payment_structure: client.payment_structure || "",
            status: client.status || "",
        })
        setEditDialogOpen(true)
    }

    async function handleEditClient() {
        if (!editForm.client_name) return
        setEditingSaving(true)
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            })
            if (!res.ok) throw new Error("Failed to update client")
            setEditDialogOpen(false)
            await loadClient()
        } catch (err) {
            console.error(err)
        } finally {
            setEditingSaving(false)
        }
    }

    function handleCreateProject() {
        router.push(`/projects?client_id=${id}`)
    }

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
                    <Button variant="outline" className="border-zinc-800" onClick={openEditDialog}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Client
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateProject}>
                        + Create Project
                    </Button>
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
                    <Card className="border-none bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle>Client Projects</CardTitle>
                            <CardDescription>All projects associated with this client.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {projectsLoading ? (
                                <div className="flex items-center justify-center py-8 text-zinc-500">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading projects...
                                </div>
                            ) : projects.length === 0 ? (
                                <p className="text-sm text-zinc-500 py-8">No projects for this client yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800">
                                            <TableHead>Project Title</TableHead>
                                            <TableHead>Service Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.map((project) => (
                                            <TableRow key={project.id} className="border-zinc-800">
                                                <TableCell className="font-medium">{project.title}</TableCell>
                                                <TableCell>{project.service_type}</TableCell>
                                                <TableCell>${project.price.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            project.status === "active"
                                                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                                : project.status === "completed"
                                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                    : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                                        }
                                                    >
                                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/projects/${project.id}`}>
                                                        <Button size="sm" variant="outline" className="border-zinc-800">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Client Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogDescription>Update client details and contract information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Client Name *</Label>
                                <Input
                                    placeholder="John Doe"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.client_name}
                                    onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    placeholder="Acme Inc."
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.company_name}
                                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
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
                                    value={editForm.contact_email}
                                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Input
                                    placeholder="Technology"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.industry}
                                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lead Source</Label>
                                <Input
                                    placeholder="Referral"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.lead_source}
                                    onChange={(e) => setEditForm({ ...editForm, lead_source: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t border-zinc-800 pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3">Contract Details</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Contract Start</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={editForm.contract_start_date}
                                        onChange={(e) => setEditForm({ ...editForm, contract_start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contract End</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={editForm.contract_end_date}
                                        onChange={(e) => setEditForm({ ...editForm, contract_end_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Renewal Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={editForm.renewal_date}
                                        onChange={(e) => setEditForm({ ...editForm, renewal_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Structure</Label>
                            <Input
                                placeholder="e.g., 40/60 or custom terms"
                                className="bg-zinc-900 border-zinc-800"
                                value={editForm.payment_structure}
                                onChange={(e) => setEditForm({ ...editForm, payment_structure: e.target.value })}
                            />
                            <p className="text-xs text-zinc-500">Leave empty to use per-project advance percentage.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={editingSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditClient}
                            disabled={editingSaving || !editForm.client_name}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {editingSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
