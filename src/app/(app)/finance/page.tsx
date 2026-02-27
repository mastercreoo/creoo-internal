"use client"

import { useEffect, useState } from "react"
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    Download,
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
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"

type ProjectMetric = {
    id: string
    title: string
    service_type: string
    price: number
    profit: number
    margin: number
    cycle_days: number | null
}

type ServiceBreakdown = { revenue: number; cost: number; profit: number }

type FinanceData = {
    totalRevenue: number
    totalCosts: number
    totalProfit: number
    burnRate: number
    avgCycleTimeDays: number
    profitByServiceType: Record<string, ServiceBreakdown>
    projectMetrics: ProjectMetric[]
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

export default function FinancePage() {
    const [data, setData] = useState<FinanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/finance")
                if (!res.ok) throw new Error("Failed to load finance data")
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

    const serviceChartData = data
        ? Object.entries(data.profitByServiceType).map(([key, val]) => ({
              category: SERVICE_LABELS[key] ?? key,
              profit: val.profit,
              color: SERVICE_COLORS[key] ?? "#71717a",
              margin: val.revenue > 0 ? Math.round((val.profit / val.revenue) * 100) : 0,
          }))
        : []

    const avgMargin =
        data && data.totalRevenue > 0
            ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1)
            : "0.0"

    const lowestMargin = (data?.projectMetrics ?? [])
        .filter((p) => p.margin < 50)
        .sort((a, b) => a.margin - b.margin)

    const longestCycle = (data?.projectMetrics ?? [])
        .filter((p) => p.cycle_days !== null && p.cycle_days > 40)
        .sort((a, b) => (b.cycle_days ?? 0) - (a.cycle_days ?? 0))

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading financial data...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time profit tracking, margin analysis, and cost efficiency metrics.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50" disabled>
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fmt(data?.totalProfit ?? 0)}</div>
                        <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> All time
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Average Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgMargin}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Target: &gt;60%</div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Monthly Burn Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fmt(data?.burnRate ?? 0)}</div>
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> Total costs / active months
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Avg. Cycle Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.avgCycleTimeDays ? `${data.avgCycleTimeDays} Days` : "—"}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3" /> Start to final payment
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Profit by Service Category</CardTitle>
                        <CardDescription>Performance of different service lines.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {serviceChartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">No project data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis dataKey="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                                        formatter={(v: number | undefined) => fmt(v ?? 0)}
                                    />
                                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                        {serviceChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Margin Analysis</CardTitle>
                        <CardDescription>Which services are most efficient?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {serviceChartData.length === 0 ? (
                            <div className="text-zinc-500 text-sm">No data yet</div>
                        ) : (
                            serviceChartData.map((service) => (
                                <div key={service.category} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{service.category}</span>
                                        <span className="text-zinc-400">{service.margin}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${service.margin}%`, backgroundColor: service.color }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Lowest Margin Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowestMargin.length === 0 ? (
                            <div className="text-sm text-zinc-500">No projects with margin below 50%.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800">
                                        <TableHead>Project</TableHead>
                                        <TableHead className="text-right">Margin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowestMargin.map((p) => (
                                        <TableRow key={p.id} className="border-zinc-800">
                                            <TableCell className="text-sm">{p.title}</TableCell>
                                            <TableCell className="text-right font-bold text-red-500">{p.margin}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-amber-400 flex items-center gap-2">
                            <Clock className="h-5 w-5" /> Highest Cycle Time Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {longestCycle.length === 0 ? (
                            <div className="text-sm text-zinc-500">No completed projects with cycle data yet.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800">
                                        <TableHead>Project</TableHead>
                                        <TableHead className="text-right">Days</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {longestCycle.map((p) => (
                                        <TableRow key={p.id} className="border-zinc-800">
                                            <TableCell className="text-sm">{p.title}</TableCell>
                                            <TableCell className="text-right font-bold text-amber-500">{p.cycle_days} Days</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
