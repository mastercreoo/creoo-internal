"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Calendar,
    FileCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/format"

type Template = {
    id: string
    name: string
    type: "proposal" | "invoice" | "contract" | "sow"
    content: string
    created_at: string
}

const TEMPLATE_TYPES: Record<string, { label: string; color: string }> = {
    proposal: { label: "Proposal", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    invoice: { label: "Invoice", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    contract: { label: "Contract", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    sow: { label: "Scope of Work", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        name: "",
        type: "proposal" as const,
        content: "",
    })

    const [editForm, setEditForm] = useState({
        name: "",
        type: "proposal" as const,
        content: "",
    })

    useEffect(() => {
        loadTemplates()
    }, [])

    async function loadTemplates() {
        try {
            const res = await fetch("/api/templates")
            if (!res.ok) throw new Error("Failed to load templates")
            setTemplates(await res.json())
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading templates")
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate() {
        if (!form.name.trim() || !form.content.trim()) return

        setSaving(true)
        try {
            const res = await fetch("/api/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to create template")

            setForm({ name: "", type: "proposal", content: "" })
            setDialogOpen(false)
            await loadTemplates()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating template")
        } finally {
            setSaving(false)
        }
    }

    async function handleEdit() {
        if (!editingTemplate || !editForm.name.trim() || !editForm.content.trim()) return

        setSaving(true)
        try {
            const res = await fetch(`/api/templates/${editingTemplate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editForm.name,
                    type: editForm.type,
                    content: editForm.content,
                }),
            })
            if (!res.ok) throw new Error("Failed to update template")

            setEditDialogOpen(false)
            setEditingTemplate(null)
            await loadTemplates()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating template")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this template?")) return

        try {
            const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete template")
            await loadTemplates()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting template")
        }
    }

    function openEditDialog(template: Template) {
        setEditingTemplate(template)
        setEditForm({
            name: template.name,
            type: template.type,
            content: template.content,
        })
        setEditDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading templates...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage proposal, invoice, contract, and document templates.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Template</DialogTitle>
                            <DialogDescription>Create a new template that can be reused.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Template Name *</Label>
                                <Input
                                    placeholder="Q1 2026 Project Proposal"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Template Type *</Label>
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="invoice">Invoice</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="sow">Scope of Work</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Content *</Label>
                                <textarea
                                    placeholder="Enter template content here..."
                                    className="w-full h-40 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={saving || !form.name.trim() || !form.content.trim()}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Template"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {templates.length === 0 ? (
                <Card className="border-none bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-500">
                        <FileCode className="h-8 w-8" />
                        <div className="text-sm">No templates yet. Create your first template to get started.</div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Templates</CardTitle>
                        <CardDescription>{templates.length} template{templates.length !== 1 ? "s" : ""} available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template) => (
                                    <TableRow key={template.id} className="border-zinc-800">
                                        <TableCell className="font-medium text-sm">{template.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={TEMPLATE_TYPES[template.type]?.color || ""}
                                            >
                                                {TEMPLATE_TYPES[template.type]?.label || template.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-400">
                                            {formatDate(template.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(template)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(template.id)}
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                        <DialogDescription>Update template details and content.</DialogDescription>
                    </DialogHeader>
                    {editingTemplate && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Template Name *</Label>
                                <Input
                                    placeholder="Q1 2026 Project Proposal"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Template Type *</Label>
                                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v as any })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="invoice">Invoice</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="sow">Scope of Work</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Content *</Label>
                                <textarea
                                    placeholder="Enter template content here..."
                                    className="w-full h-40 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleEdit} disabled={saving || !editForm.name.trim() || !editForm.content.trim()}>
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
