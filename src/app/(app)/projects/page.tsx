"use client"

import { useState, useEffect } from "react"
import {
    Briefcase,
    Search,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Building2,
    Calendar,
    DollarSign,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { formatCurrency } from "@/lib/format"

type ProjectWithClient = {
    id: string
    client_id: string
    client_name: string
    company_name: string
    title: string
    service_type: string
    price: number
    advance_percentage: number
    status: string
    start_date: string | null
    deadline: string | null
    payments?: { type: string; status: string; amount: number }[]
}

type Client = { id: string; client_name: string; company_name: string | null }

const SERVICE_LABELS: Record<string, string> = {
    website: "Website",
    ai_workflow: "AI Workflow",
    automation: "Automation",
    management: "Management",
}

export default function ProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<ProjectWithClient[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editProject, setEditProject] = useState<ProjectWithClient | null>(null)
    const [form, setForm] = useState({
        client_id: "",
        title: "",
        service_type: "website",
        price: "",
        advance_percentage: "40",
        status: "active",
        start_date: "",
        deadline: "",
    })
    const [editForm, setEditForm] = useState({
        title: "",
        service_type: "website",
        price: "",
        advance_percentage: "40",
        status: "active",
        start_date: "",
        deadline: "",
    })

    useEffect(() => {
        Promise.all([loadProjects(), loadClients()]).finally(() => setLoading(false))
    }, [])

    async function loadProjects() {
        try {
            const res = await fetch("/api/projects")
            if (!res.ok) throw new Error("Failed")
            setProjects(await res.json())
        } catch (err) {
            console.error(err)
        }
    }

    async function loadClients() {
        try {
            const res = await fetch("/api/clients")
            if (!res.ok) throw new Error("Failed")
            setClients(await res.json())
        } catch (err) {
            console.error(err)
        }
    }

    async function handleSave() {
        if (!form.client_id || !form.title || !form.price) return
        setSaving(true)
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    advance_percentage: parseFloat(form.advance_percentage),
                    start_date: form.start_date || null,
                    deadline: form.deadline || null,
                }),
            })
            if (!res.ok) throw new Error("Failed to create project")
            setDialogOpen(false)
            setForm({ client_id: "", title: "", service_type: "website", price: "", advance_percentage: "40", status: "active", start_date: "", deadline: "" })
            await loadProjects()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this project?")) return
        try {
            await fetch(`/api/projects/${id}`, { method: "DELETE" })
            setProjects((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    async function handleEdit() {
        if (!editProject || !editForm.title || !editForm.price) return
        setSaving(true)
        try {
            const res = await fetch(`/api/projects/${editProject.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editForm.title,
                    service_type: editForm.service_type,
                    price: parseFloat(editForm.price),
                    advance_percentage: parseFloat(editForm.advance_percentage),
                    status: editForm.status,
                    start_date: editForm.start_date || null,
                    deadline: editForm.deadline || null,
                }),
            })
            if (!res.ok) throw new Error("Failed to update project")
            setEditDialogOpen(false)
            setEditProject(null)
            await loadProjects()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    function openEditDialog(project: ProjectWithClient) {
        setEditProject(project)
        setEditForm({
            title: project.title,
            service_type: project.service_type,
            price: project.price.toString(),
            advance_percentage: (project as any).advance_percentage?.toString() || "40",
            status: project.status,
            start_date: project.start_date || "",
            deadline: project.deadline || "",
        })
        setEditDialogOpen(true)
    }

    const filtered = projects.filter((p) => {
        const q = search.toLowerCase()
        return (
            p.title.toLowerCase().includes(q) ||
            p.client_name.toLowerCase().includes(q) ||
            p.service_type.toLowerCase().includes(q)
        )
    })

    const getPaymentStatus = (project: ProjectWithClient) => {
        const adv = project.payments?.find((p) => p.type === "advance")
        const fin = project.payments?.find((p) => p.type === "final")
        return {
            advancePaid: adv?.status === "paid",
            finalPaid: fin?.status === "paid",
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Track build progress, payment splits, and delivery deadlines.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>New Project</DialogTitle>
                            <DialogDescription>Create a new project with configurable payment terms.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Client *</Label>
                                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.client_name} {c.company_name ? `(${c.company_name})` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Project Title *</Label>
                                <Input
                                    placeholder="AI Strategy Roadmap"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Service Type</Label>
                                    <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="website">Website</SelectItem>
                                            <SelectItem value="ai_workflow">AI Workflow</SelectItem>
                                            <SelectItem value="automation">Automation</SelectItem>
                                            <SelectItem value="management">Management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quoted Price ($) *</Label>
                                    <Input
                                        type="number"
                                        placeholder="8500"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Advance %</Label>
                                    <Select value={form.advance_percentage} onValueChange={(v) => setForm({ ...form, advance_percentage: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10%</SelectItem>
                                            <SelectItem value="20">20%</SelectItem>
                                            <SelectItem value="25">25%</SelectItem>
                                            <SelectItem value="30">30%</SelectItem>
                                            <SelectItem value="40">40%</SelectItem>
                                            <SelectItem value="50">50%</SelectItem>
                                            <SelectItem value="60">60%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deadline</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={saving || !form.client_id || !form.title || !form.price}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Project"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>Update project details. Client cannot be changed.</DialogDescription>
                        </DialogHeader>
                        {editProject && (
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Client</Label>
                                    <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm">
                                        {editProject.client_name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Title *</Label>
                                    <Input
                                        placeholder="AI Strategy Roadmap"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Service Type</Label>
                                        <Select value={editForm.service_type} onValueChange={(v) => setEditForm({ ...editForm, service_type: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="website">Website</SelectItem>
                                                <SelectItem value="ai_workflow">AI Workflow</SelectItem>
                                                <SelectItem value="automation">Automation</SelectItem>
                                                <SelectItem value="management">Management</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quoted Price ($) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="8500"
                                            className="bg-zinc-900 border-zinc-800"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Advance %</Label>
                                        <Select value={editForm.advance_percentage} onValueChange={(v) => setEditForm({ ...editForm, advance_percentage: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10%</SelectItem>
                                                <SelectItem value="20">20%</SelectItem>
                                                <SelectItem value="25">25%</SelectItem>
                                                <SelectItem value="30">30%</SelectItem>
                                                <SelectItem value="40">40%</SelectItem>
                                                <SelectItem value="50">50%</SelectItem>
                                                <SelectItem value="60">60%</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                            <SelectItem value="lead">Lead</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            className="bg-zinc-900 border-zinc-800"
                                            value={editForm.start_date}
                                            onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Input
                                            type="date"
                                            className="bg-zinc-900 border-zinc-800"
                                            value={editForm.deadline}
                                            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={handleEdit} disabled={saving || !editForm.title || !editForm.price}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Project"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search projects..."
                    className="pl-8 bg-zinc-900/50 border-zinc-800"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40 gap-2 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading projects...
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
                    {search ? "No projects match your search." : "No projects yet. Create your first project."}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((project) => {
                        const { advancePaid, finalPaid } = getPaymentStatus(project)
                        const adv = project.payments?.find((p) => p.type === "advance")
                        const fin = project.payments?.find((p) => p.type === "final")
                        const advanceAmt = adv?.amount ?? 0
                        const finalAmt = fin?.amount ?? 0
                        const progress = finalPaid ? 100 : advancePaid ? 50 : 0
                        const advPct = project.advance_percentage || 40
                        const finPct = 100 - advPct

                        return (
                            <Card
                                key={project.id}
                                className="border-none bg-zinc-900/50 backdrop-blur-sm overflow-hidden group hover:ring-1 hover:ring-zinc-700 transition-all shadow-lg"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <Badge
                                            variant="outline"
                                            className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider"
                                        >
                                            {SERVICE_LABELS[project.service_type] ?? project.service_type}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
                                                <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                                                    View Project Space
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400"
                                                    onClick={() => handleDelete(project.id)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardTitle className="text-xl mt-2 line-clamp-1">{project.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 text-zinc-400">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {project.client_name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Advance ({advPct}%)</div>
                                            <div className="flex items-center gap-2">
                                                {advancePaid ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                )}
                                                <span className="text-sm font-semibold">{formatCurrency(advanceAmt)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Final ({finPct}%)</div>
                                            <div className="flex items-center gap-2">
                                                {finalPaid ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                                )}
                                                <span className="text-sm font-semibold">{formatCurrency(finalAmt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Payment Progress</span>
                                            <span className="font-medium text-zinc-300">{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 bg-zinc-800" />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {project.deadline ? `Due ${project.deadline}` : "No deadline set"}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-zinc-300">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            {formatCurrency(project.price)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
