"use client"

import { useEffect, useState } from "react"
import {
    Files,
    Search,
    Plus,
    FileText,
    FileCode,
    Image as ImageIcon,
    Trash2,
    Loader2,
    Upload,
    AlertCircle,
    Download
} from "lucide-react"
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatFileSize, formatDate } from "@/lib/format"

type Document = {
    id: string
    name: string
    type: string
    size: number
    client_id: string | null
    client_name?: string
    storage_path: string
    created_at: string
}

type Client = { id: string; client_name: string }

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedClientId, setSelectedClientId] = useState("")

    useEffect(() => {
        loadDocuments()
        loadClients()
    }, [])

    async function loadDocuments() {
        try {
            const res = await fetch("/api/documents")
            if (!res.ok) throw new Error("Failed to load documents")
            setDocuments(await res.json())
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading documents")
        } finally {
            setLoading(false)
        }
    }

    async function loadClients() {
        try {
            const res = await fetch("/api/clients")
            if (!res.ok) throw new Error("Failed to load clients")
            setClients(await res.json())
        } catch (err) {
            console.error(err)
        }
    }

    async function handleUpload() {
        if (!selectedFile) return

        setUploading(true)
        try {
            const storagePath = `${STORAGE_BUCKET}/${Date.now()}-${selectedFile.name}`

            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('client_id', selectedClientId || '')
            formData.append('storage_path', storagePath)

            const res = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to upload document")

            setDialogOpen(false)
            setSelectedFile(null)
            setSelectedClientId("")
            await loadDocuments()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error uploading document")
        } finally {
            setUploading(false)
        }
    }

    async function handleDownload(doc: Document) {
        try {
            // Create download link with the storage path
            const link = document.createElement("a")
            link.href = `/api/documents/download?path=${encodeURIComponent(doc.storage_path)}&name=${encodeURIComponent(doc.name)}`
            link.download = doc.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error downloading document")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this document?")) return

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete document")
            await loadDocuments()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting document")
        }
    }

    const filtered = documents.filter((doc) => {
        const q = search.toLowerCase()
        return (
            doc.name.toLowerCase().includes(q) ||
            (doc.client_name?.toLowerCase().includes(q) ?? false)
        )
    })


    const getFileIcon = (filename: string) => {
        if (filename.endsWith(".pdf")) {
            return <FileText className="h-4 w-4 text-red-400" />
        } else if (filename.match(/\.(png|jpg|jpeg|webp)$/i)) {
            return <ImageIcon className="h-4 w-4 text-blue-400" />
        }
        return <FileCode className="h-4 w-4 text-zinc-400" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading documents...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Document Repository</h1>
                    <p className="text-muted-foreground mt-1">
                        Secure storage for contracts, invoices, and project artifacts.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>Upload a file to the document repository.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Select File *</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    className="bg-zinc-900 border-zinc-800"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                                {selectedFile && (
                                    <p className="text-xs text-zinc-400">
                                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">Client (Optional)</Label>
                                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.client_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Storage Configuration Notice */}
            <Card className="border border-dashed border-blue-500/30 bg-blue-500/5">
                <CardContent className="flex items-start gap-3 p-4">
                    <Upload className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-400">Storage Bucket Configured</p>
                        <p className="text-xs text-zinc-400 mt-1">
                            Files are being stored in the <code className="bg-zinc-900 px-1 rounded text-zinc-300">{STORAGE_BUCKET}</code> bucket. Document metadata is persisted in the database.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border border-dashed border-red-500/30 bg-red-500/5">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-400">Error</p>
                            <p className="text-xs text-zinc-400 mt-1">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search documents..."
                        className="pl-8 bg-zinc-900/50 border-zinc-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-500">
                            <Files className="h-10 w-10 text-zinc-700" />
                            <p className="text-sm">{search ? "No documents match your search." : "No documents uploaded yet."}</p>
                            <p className="text-xs text-zinc-600">Use the upload button to add documents to the repository.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-zinc-900/50">
                                <TableRow className="border-zinc-800">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((doc) => (
                                    <TableRow key={doc.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(doc.name)}
                                                <span className="font-medium text-sm text-zinc-200 max-w-sm truncate">{doc.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                                {doc.type.split("/")[1] || "file"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-400">{doc.client_name || "—"}</TableCell>
                                        <TableCell className="text-sm text-zinc-400">{formatFileSize(doc.size)}</TableCell>
                                        <TableCell className="text-sm text-zinc-400">
                                            {formatDate(doc.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:text-primary"
                                                    onClick={() => handleDownload(doc)}
                                                    title="Download document"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:text-red-400"
                                                    onClick={() => handleDelete(doc.id)}
                                                    title="Delete document"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
