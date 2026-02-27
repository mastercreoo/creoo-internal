"use client"

import { useEffect, useState } from "react"
import {
    TrendingUp,
    CreditCard,
    DollarSign,
    Briefcase,
    AlertCircle,
    Clock,
    Target
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
    PieChart,
    Pie
} from "recharts"
import { formatCurrency } from "@/lib/format"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

type ServiceBreakdown = { revenue: number; cost: number; profit: number }

type DashboardMetrics = {
    totalRevenue: number
    totalReceived: number
    totalPending: number
    totalCosts: number
    totalProfit: number
    burnRate: number
    activeProjectsCount: number
    avgCycleTimeDays: number
    revenueByMonth: { month: string; revenue: number; expenses: number }[]
    profitByServiceType: Record<string, ServiceBreakdown>
}

const SERVICE_COLORS: Record<string, string> = {
    website: "#3b82f6",
    ai_workflow: "#8b5cf6",
    automation: "#10b981",
    management: "#f59e0b",
    other: "#71717a",
}

const SERVICE_LABELS: Record<string, string> = {
    website: "Websites",
    ai_workflow: "AI Workflows",
    automation: "Automation",
    management: "Management",
    other: "Other",
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadMetrics() {
            try {
                const res = await fetch("/api/dashboard/metrics")
                if (!res.ok) throw new Error("Failed to load dashboard metrics")
                const data = await res.json()
                setMetrics(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading data")
            } finally {
                setLoading(false)
            }
        }
        loadMetrics()
    }, [])

    const totalRevenue = metrics?.totalRevenue ?? 0
    const totalProfit = metrics?.totalProfit ?? 0
    const activeProjectsCount = metrics?.activeProjectsCount ?? 0
    const totalPending = metrics?.totalPending ?? 0
    const avgCycleTimeDays = metrics?.avgCycleTimeDays ?? 0
    const burnRate = metrics?.burnRate ?? 0

    const revenueData = metrics?.revenueByMonth ?? []
    const categoryData = metrics
        ? Object.entries(metrics.profitByServiceType).map(([key, val]) => ({
              name: SERVICE_LABELS[key] ?? key,
              value: val.revenue,
              color: SERVICE_COLORS[key] ?? "#71717a",
          }))
        : []

    const fmt = formatCurrency

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    Failed to load dashboard data: {error}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Overview of Creo AI Studio's operational and financial health.
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : fmt(totalRevenue)}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                            {loading ? "" : `${fmt(metrics?.totalReceived ?? 0)} received`}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-400">Total Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : fmt(totalProfit)}</div>
                        <div className="mt-1 text-xs text-blue-500">
                            {loading || !metrics
                                ? ""
                                : metrics.totalRevenue > 0
                                ? `Margin: ${((totalProfit / metrics.totalRevenue) * 100).toFixed(1)}%`
                                : "No revenue yet"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-400">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : activeProjectsCount}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                            {loading ? "" : `Monthly burn: ${fmt(burnRate)}`}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-400">Pending Payments</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : fmt(totalPending)}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-400 font-medium">
                            <Clock className="h-3 w-3" />
                            Awaiting collection
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Revenue vs Burn Chart */}
                <Card className="md:col-span-4 border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue vs Burn</CardTitle>
                        <CardDescription>Monthly financial performance by project start date.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">Loading...</div>
                        ) : revenueData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">No project data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                                        itemStyle={{ color: "#fff" }}
                                        formatter={(v: number | undefined) => fmt(v ?? 0)}
                                    />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} name="Revenue" />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Category */}
                <Card className="md:col-span-3 border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue by Category</CardTitle>
                        <CardDescription>Distribution of active revenue streams.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-0">
                        {loading ? (
                            <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm w-full">Loading...</div>
                        ) : categoryData.length === 0 ? (
                            <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm w-full">No data yet</div>
                        ) : (
                            <>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}
                                                formatter={(v: number | undefined) => fmt(v ?? 0)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                    {categoryData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs font-medium text-zinc-300 truncate">{item.name}</span>
                                            <span className="text-xs text-zinc-500 ml-auto">{fmt(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4 text-emerald-500" />
                            Profit by Service Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="text-sm text-zinc-500">Loading...</div>
                        ) : categoryData.length === 0 ? (
                            <div className="text-sm text-zinc-500">No project data yet</div>
                        ) : (
                            categoryData
                                .sort((a, b) => b.value - a.value)
                                .map((item) => {
                                    const key = Object.entries(SERVICE_LABELS).find(([, v]) => v === item.name)?.[0] ?? ''
                                    const breakdown = metrics?.profitByServiceType[key]
                                    const margin = breakdown && breakdown.revenue > 0
                                        ? ((breakdown.profit / breakdown.revenue) * 100).toFixed(1)
                                        : '0'
                                    return (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground">{margin}% Avg. Margin</span>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-500">
                                                {breakdown ? fmt(breakdown.profit) : "—"}
                                            </span>
                                        </div>
                                    )
                                })
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Cycle Time Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Avg. Payment Cycle</span>
                            <span className="text-sm font-bold">
                                {loading ? "—" : avgCycleTimeDays > 0 ? `${avgCycleTimeDays} Days` : "No data"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Monthly Burn Rate</span>
                            <span className="text-sm font-bold">
                                {loading ? "—" : fmt(burnRate)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Total Costs</span>
                            <span className="text-sm font-bold text-red-400">
                                {loading ? "—" : fmt(metrics?.totalCosts ?? 0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
