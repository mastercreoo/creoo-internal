"use client"

import { useEffect, useState } from "react"
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    CheckCircle2,
    Clock,
    DollarSign,
    Loader2
} from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Pie,
    PieChart
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"

type ProjectMetric = {
    id: string
    title: string
    service_type: string
    price: number
    profit: number
    margin: number
    status: string
}

type RevenueByMonth = {
    month: string
    revenue: number
    expenses: number
}

type ReportsData = {
    totalRevenue: number
    totalCosts: number
    totalProfit: number
    activeProjectsCount: number
    completedProjectsCount: number
    projectMetrics: ProjectMetric[]
    revenueByMonth: RevenueByMonth[]
}

const SERVICE_LABELS: Record<string, string> = {
    website: "Websites",
    ai_workflow: "AI Workflows",
    automation: "Automation",
    management: "Management",
    other: "Other",
}

const SERVICE_COLORS: Record<string, string> = {
    website: "#3b82f6",
    ai_workflow: "#8b5cf6",
    automation: "#10b981",
    management: "#f59e0b",
    other: "#71717a",
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/finance")
                if (!res.ok) throw new Error("Failed to load reports data")
                setData(await res.json())
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const fmt = formatCurrency

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading reports...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
                    No data available
                </div>
            </div>
        )
    }

    // Prepare chart data
    const projectStatusData = [
        { name: "Active", value: data.activeProjectsCount, fill: "#3b82f6" },
        { name: "Completed", value: data.completedProjectsCount, fill: "#10b981" },
    ]

    const profitableProjects = data.projectMetrics
        .filter((p) => p.profit > 0)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5)

    const lowMarginProjects = data.projectMetrics
        .filter((p) => p.margin < 50)
        .sort((a, b) => a.margin - b.margin)

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive project analytics and financial performance.
                    </p>
                </div>
            </div>

            {/* Top metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fmt(data.totalRevenue)}</div>
                        <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> All projects
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Total Costs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fmt(data.totalCosts)}</div>
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3" /> Expenses
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Total Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{fmt(data.totalProfit)}</div>
                        <div className="text-xs text-emerald-500/70 mt-1">
                            {data.totalRevenue > 0
                                ? `${((data.totalProfit / data.totalRevenue) * 100).toFixed(1)}% margin`
                                : "N/A"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.activeProjectsCount}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {data.completedProjectsCount} completed
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Status Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Project Status Breakdown</CardTitle>
                        <CardDescription>Active vs Completed projects</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {projectStatusData.reduce((sum, item) => sum + item.value, 0) === 0 ? (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                                No project data yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        dataKey="value"
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                    >
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => value.toString()} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Revenue by Month</CardTitle>
                        <CardDescription>Last 6 months of activity</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {data.revenueByMonth.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                                No monthly data yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.revenueByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                                        formatter={(v: number | undefined) => fmt(v ?? 0)}
                                    />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Project Table */}
            <Card className="border-none bg-zinc-900/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Project Performance</CardTitle>
                    <CardDescription>Detailed metrics for each project</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.projectMetrics.length === 0 ? (
                        <div className="text-sm text-zinc-500 py-8">No projects found</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800">
                                    <TableHead>Project</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="text-right">Costs</TableHead>
                                    <TableHead className="text-right">Profit</TableHead>
                                    <TableHead className="text-right">Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.projectMetrics.map((project) => (
                                    <TableRow key={project.id} className="border-zinc-800">
                                        <TableCell className="font-medium text-sm">{project.title}</TableCell>
                                        <TableCell className="text-sm">{SERVICE_LABELS[project.service_type] ?? project.service_type}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    project.status === "completed"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : project.status === "active"
                                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                            : "bg-zinc-700/10 text-zinc-400 border-zinc-700/20"
                                                }
                                            >
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{fmt(project.price)}</TableCell>
                                        <TableCell className="text-right text-red-400">{fmt(project.price - project.profit)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-500">{fmt(project.profit)}</TableCell>
                                        <TableCell className="text-right font-medium">{project.margin.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Low Margin Projects Alert */}
            {lowMarginProjects.length > 0 && (
                <Card className="border-none bg-red-950/20 border-red-500/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-red-400">⚠ Low Margin Projects</CardTitle>
                        <CardDescription>Projects with margin below 50%</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-red-500/20">
                                    <TableHead>Project</TableHead>
                                    <TableHead className="text-right">Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowMarginProjects.map((p) => (
                                    <TableRow key={p.id} className="border-red-500/20">
                                        <TableCell className="text-sm">{p.title}</TableCell>
                                        <TableCell className="text-right font-bold text-red-500">{p.margin.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
