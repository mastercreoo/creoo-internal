"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Lock,
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
  LogOut,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // Profile settings
  const [profileForm, setProfileForm] = useState({
    name: "Admin User",
    email: "admin@creoai.studio",
  })

  // Password settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Preference settings
  const [preferences, setPreferences] = useState({
    theme: "dark",
    emailNotifications: true,
  })

  async function handleProfileUpdate() {
    if (!profileForm.name.trim()) {
      setError("Name cannot be empty")
      return
    }
    if (!profileForm.email.trim()) {
      setError("Email cannot be empty")
      return
    }

    setLoading(true)
    try {
      // TODO: Implement actual profile update via API
      // const res = await fetch("/api/users/profile", {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(profileForm),
      // })
      // if (!res.ok) throw new Error("Failed to update profile")

      setSuccess("Profile updated successfully")
      setError(null)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange() {
    if (!passwordForm.currentPassword) {
      setError("Current password is required")
      return
    }
    if (!passwordForm.newPassword) {
      setError("New password is required")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to change password")
        return
      }

      setSuccess("Password changed successfully")
      setError(null)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error changing password")
    } finally {
      setLoading(false)
    }
  }

  function handlePreferenceChange() {
    setSuccess("Preferences updated successfully")
    setError(null)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        throw new Error("Failed to logout")
      }

      // Redirect to login page
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error logging out")
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {success && (
        <Card className="border border-dashed border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border border-dashed border-red-500/30 bg-red-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-none bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-zinc-900 border-zinc-800"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="bg-zinc-900 border-zinc-800"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4">
          <Card className="border-none bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  className="bg-zinc-900 border-zinc-800"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  className="bg-zinc-900 border-zinc-800"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-zinc-900 border-zinc-800"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-none bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience and notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={preferences.theme} onValueChange={(v) => {
                  setPreferences({ ...preferences, theme: v })
                  handlePreferenceChange()
                }}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-400 mt-2">
                  Choose your preferred appearance. System will use your device settings.
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-zinc-800">
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Receive updates about your projects and documents.
                  </p>
                </div>
                <Button
                  variant={preferences.emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPreferences({
                      ...preferences,
                      emailNotifications: !preferences.emailNotifications,
                    })
                    handlePreferenceChange()
                  }}
                >
                  {preferences.emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Information */}
      <Card className="border-none bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-muted-foreground">Account Status</span>
              <span className="font-medium text-green-400">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">Administrator</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">February 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-none bg-red-500/5 border border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base text-red-400">Session</CardTitle>
          <CardDescription className="text-red-300/70">
            Manage your login session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Logout</p>
              <p className="text-xs text-zinc-400 mt-1">
                Sign out from your current session and return to the login page.
              </p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              className="border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
