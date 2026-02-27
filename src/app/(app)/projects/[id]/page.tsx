"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    Calculator,
    Clock,
    FileText,
    DollarSign,
    Loader2,
    Edit
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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
import { TiptapEditor } from "@/components/editor"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { formatCurrency } from "@/lib/format"

type Payment = {
    id: string
    type: "advance" | "final"
    amount: number
    status: "paid" | "pending"
    paid_date: string | null
}

type Cost = {
    id: string
    labor_cost: number
    tool_cost: number
    hosting_cost: number
    other_cost: number
}

type ProjectDetail = {
    id: string
    title: string
    client_name?: string
    service_type: string
    price: number
    status: string
    start_date: string | null
    deadline: string | null
    payments: Payment[]
    costs: Cost[]
}

export default function ProjectDetailsPage() {
    const params = useParams()
    const id = params.id as string

    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingCost, setAddingCost] = useState(false)
    const [costForm, setCostForm] = useState({ labor_cost: "", tool_cost: "", hosting_cost: "", other_cost: "" })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSaving, setEditingSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        title: "",
        service_type: "",
        price: "",
        status: "",
        start_date: "",
        deadline: "",
    })

    useEffect(() => {
        loadProject()
    }, [id])

    async function loadProject() {
        try {
            const res = await fetch(`/api/projects/${id}`)
            if (!res.ok) {
                setError(res.status === 404 ? "Project not found" : "Failed to load project")
                return
            }
            setProject(await res.json())
        } catch {
            setError("Failed to load project")
        } finally {
            setLoading(false)
        }
    }

    async function handleMarkPaid(paymentId: string) {
        try {
            await fetch(`/api/payments/${paymentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "paid", paid_date: new Date().toISOString() }),
            })
            await loadProject()
        } catch (err) {
            console.error(err)
        }
    }

    async function handleAddCost() {
        setAddingCost(true)
        try {
            await fetch("/api/costs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_id: id,
                    labor_cost: parseFloat(costForm.labor_cost) || 0,
                    tool_cost: parseFloat(costForm.tool_cost) || 0,
                    hosting_cost: parseFloat(costForm.hosting_cost) || 0,
                    other_cost: parseFloat(costForm.other_cost) || 0,
                }),
            })
            setCostForm({ labor_cost: "", tool_cost: "", hosting_cost: "", other_cost: "" })
            await loadProject()
        } catch (err) {
            console.error(err)
        } finally {
            setAddingCost(false)
        }
    }

    function openEditDialog() {
        if (!project) return
        setEditForm({
            title: project.title,
            service_type: project.service_type,
            price: project.price.toString(),
            status: project.status,
            start_date: project.start_date || "",
            deadline: project.deadline || "",
        })
        setEditDialogOpen(true)
    }

    async function handleProjectEdit() {
        if (!editForm.title || !editForm.price) return
        setEditingSaving(true)
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editForm.title,
                    service_type: editForm.service_type,
                    price: parseFloat(editForm.price),
                    status: editForm.status,
                    start_date: editForm.start_date || null,
                    deadline: editForm.deadline || null,
                }),
            })
            if (!res.ok) throw new Error("Failed to update project")
            setEditDialogOpen(false)
            await loadProject()
        } catch (err) {
            console.error(err)
        } finally {
            setEditingSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading project...
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error ?? "Project not found"}
                </div>
            </div>
        )
    }

    const totalCost = project.costs.reduce(
        (acc, c) => acc + (c.labor_cost || 0) + (c.tool_cost || 0) + (c.hosting_cost || 0) + (c.other_cost || 0),
        0
    )
    const profit = project.price - totalCost
    const margin = project.price > 0 ? ((profit / project.price) * 100).toFixed(1) : "0.0"

    const advPayment = project.payments.find((p) => p.type === "advance")
    const finPayment = project.payments.find((p) => p.type === "final")

    const daysElapsed = project.start_date
        ? Math.round((Date.now() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{project.client_name ?? "—"} • {project.service_type}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="bg-zinc-900 border-zinc-800"
                        onClick={openEditDialog}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                    </Button>
                    {finPayment && (
                        <Button
                            variant="outline"
                            className="bg-zinc-900 border-zinc-800"
                            onClick={() => generateInvoicePDF({
                                invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
                                clientName: project.client_name ?? "Client",
                                companyName: project.client_name ?? "Client",
                                service: project.title,
                                amount: finPayment.amount,
                                dueDate: project.deadline ?? "",
                                isAdvance: false,
                            })}
                        >
                            <FileText className="mr-2 h-4 w-4" /> Generate Final Invoice
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest">Total Price</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(project.price)}</div>
                        <div className="text-xs text-zinc-500 mt-1">40/60 Split Applied</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-emerald-500">Current Profit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(profit)}</div>
                        <div className="text-xs text-emerald-500/70 mt-1">{margin}% Margin</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-red-400">Total Expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">{formatCurrency(totalCost)}</div>
                        <div className="text-xs text-zinc-500 mt-1">{project.costs.length} Cost Entries</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Costs */}
                    <Card className="border-none bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Cost Breakdown</CardTitle>
                                <CardDescription>Track every dollar spent on this build.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.costs.length === 0 ? (
                                <p className="text-sm text-zinc-500">No cost entries yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800">
                                            <TableHead>Labor</TableHead>
                                            <TableHead>Tools</TableHead>
                                            <TableHead>Hosting</TableHead>
                                            <TableHead>Other</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.costs.map((cost) => {
                                            const rowTotal = (cost.labor_cost || 0) + (cost.tool_cost || 0) + (cost.hosting_cost || 0) + (cost.other_cost || 0)
                                            return (
                                                <TableRow key={cost.id} className="border-zinc-800">
                                                    <TableCell>{formatCurrency(cost.labor_cost || 0)}</TableCell>
                                                    <TableCell>{formatCurrency(cost.tool_cost || 0)}</TableCell>
                                                    <TableCell>{formatCurrency(cost.hosting_cost || 0)}</TableCell>
                                                    <TableCell>{formatCurrency(cost.other_cost || 0)}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(rowTotal)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}

                            {/* Add Cost Form */}
                            <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-medium text-zinc-300">Add Cost Entry</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Labor ($)</Label>
                                        <Input className="bg-zinc-900 border-zinc-800 h-8" placeholder="0" value={costForm.labor_cost} onChange={(e) => setCostForm({...costForm, labor_cost: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tools ($)</Label>
                                        <Input className="bg-zinc-900 border-zinc-800 h-8" placeholder="0" value={costForm.tool_cost} onChange={(e) => setCostForm({...costForm, tool_cost: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Hosting ($)</Label>
                                        <Input className="bg-zinc-900 border-zinc-800 h-8" placeholder="0" value={costForm.hosting_cost} onChange={(e) => setCostForm({...costForm, hosting_cost: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Other ($)</Label>
                                        <Input className="bg-zinc-900 border-zinc-800 h-8" placeholder="0" value={costForm.other_cost} onChange={(e) => setCostForm({...costForm, other_cost: e.target.value})} />
                                    </div>
                                </div>
                                <Button size="sm" onClick={handleAddCost} disabled={addingCost}>
                                    {addingCost ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                                    Add Entry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Project Requirements & Scope
                        </h2>
                        <TiptapEditor content="" />
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {advPayment && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Advance (40%)</span>
                                        <Badge
                                            className={advPayment.status === "paid"
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "border-amber-500/20 text-amber-500"}
                                            variant="outline"
                                        >
                                            {advPayment.status === "paid" ? "Paid" : "Pending"}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-bold">{formatCurrency(advPayment.amount)}</div>
                                    <Progress value={advPayment.status === "paid" ? 100 : 0} className="h-1.5 bg-zinc-800" />
                                    {advPayment.status !== "paid" && (
                                        <Button size="sm" variant="outline" className="w-full border-zinc-800" onClick={() => handleMarkPaid(advPayment.id)}>
                                            Mark as Paid
                                        </Button>
                                    )}
                                </div>
                            )}
                            {finPayment && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Final (60%)</span>
                                        <Badge
                                            className={finPayment.status === "paid"
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "border-zinc-500/20 text-zinc-400"}
                                            variant="outline"
                                        >
                                            {finPayment.status === "paid" ? "Paid" : "Pending"}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-bold">{formatCurrency(finPayment.amount)}</div>
                                    <Progress value={finPayment.status === "paid" ? 100 : 0} className="h-1.5 bg-zinc-800" />
                                    {finPayment.status !== "paid" && (
                                        <Button size="sm" variant="outline" className="w-full border-zinc-800" onClick={() => handleMarkPaid(finPayment.id)}>
                                            Mark as Paid
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400 flex items-center gap-2"><Clock className="h-4 w-4" /> Days Elapsed</span>
                                <span className="font-medium">{daysElapsed !== null ? `${daysElapsed} Days` : "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400 flex items-center gap-2"><Calculator className="h-4 w-4" /> Start Date</span>
                                <span className="font-medium">{project.start_date ?? "Not set"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Deadline</span>
                                <span className="font-medium">{project.deadline ?? "Not set"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update project details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Project Title *</Label>
                            <Input
                                placeholder="AI Strategy Roadmap"
                                className="bg-zinc-900 border-zinc-800"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                <Label>Total Price ($) *</Label>
                                <Input
                                    type="number"
                                    placeholder="8500"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
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
                    <DialogFooter>
                        <Button onClick={handleProjectEdit} disabled={editingSaving || !editForm.title || !editForm.price}>
                            {editingSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
