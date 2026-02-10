import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User as FirebaseUser } from "firebase/auth";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe,
  Mail,
  Database,
  Key,
  Save,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminSettingsProps {
  user: FirebaseUser;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "SkillSage",
    siteDescription: "AI-Powered Career Development Platform",
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: "student",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    welcomeEmail: true,
    courseCompletionEmail: true,
    weeklyDigest: false,
    adminAlerts: true,
    alertThreshold: "high",
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    logUserActivity: true,
  });

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "General settings saved successfully" });
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Notification settings saved successfully" });
    setIsSaving(false);
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Security settings saved successfully" });
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation user={user} />
      
      <main className="section-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic configuration for the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultRole">Default User Role</Label>
                    <Select 
                      value={generalSettings.defaultUserRole}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultUserRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable access for all users except admins
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register on the platform
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.allowRegistration}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allowRegistration: checked })}
                    />
                  </div>
                </div>

                {generalSettings.maintenanceMode && (
                  <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Maintenance mode is enabled. Users cannot access the platform.</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="icon-sm mr-2 animate-spin" /> : <Save className="icon-sm mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure email and alert notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Enable Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Master switch for all email notifications
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <div>
                      <Label>Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send welcome email to new users
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.welcomeEmail}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, welcomeEmail: checked })}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <div>
                      <Label>Course Completion Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when they complete a course
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.courseCompletionEmail}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, courseCompletionEmail: checked })}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between pl-6">
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Send weekly progress summary to users
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Admin Alerts</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Enable Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for important system events
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.adminAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, adminAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alert Threshold</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum severity level for alerts
                      </p>
                    </div>
                    <Select 
                      value={notificationSettings.alertThreshold}
                      onValueChange={(value) => setNotificationSettings({ ...notificationSettings, alertThreshold: value })}
                      disabled={!notificationSettings.adminAlerts}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="icon-sm mr-2 animate-spin" /> : <Save className="icon-sm mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Authentication</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        min={5}
                        max={120}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                        min={3}
                        max={10}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Password Policy</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Minimum Password Length</Label>
                      <Input
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                        min={6}
                        max={32}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Require Special Characters</Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must include special characters
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Logging</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Log User Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Record user actions for audit purposes
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.logUserActivity}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, logUserActivity: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSecurity} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="icon-sm mr-2 animate-spin" /> : <Save className="icon-sm mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-6 border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect the entire system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Clear All Logs</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all activity logs
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Clear Logs
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Reset All Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Reset all settings to default values
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Reset Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
