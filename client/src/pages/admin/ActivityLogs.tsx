import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as FirebaseUser } from "firebase/auth";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  User,
  FileText,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye
} from "lucide-react";

interface ActivityLogsProps {
  user: FirebaseUser;
}

interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

interface AlertEntry {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export default function ActivityLogs({ user }: ActivityLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("activity");

  // Fetch activity logs
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/admin/logs", searchQuery, actionFilter],
    queryFn: async () => {
      // Mock data
      return [
        { id: "1", userId: "u1", userName: "John Doe", action: "login", resource: "auth", timestamp: "2024-02-10T10:30:00Z" },
        { id: "2", userId: "u2", userName: "Jane Smith", action: "create", resource: "resume", resourceId: "r1", details: "Created new resume", timestamp: "2024-02-10T10:25:00Z" },
        { id: "3", userId: "u3", userName: "Mike Johnson", action: "update", resource: "profile", details: "Updated skills", timestamp: "2024-02-10T10:20:00Z" },
        { id: "4", userId: "u1", userName: "John Doe", action: "view", resource: "course", resourceId: "c1", timestamp: "2024-02-10T10:15:00Z" },
        { id: "5", userId: "u4", userName: "Sarah Wilson", action: "delete", resource: "resume", resourceId: "r2", timestamp: "2024-02-10T10:10:00Z" },
        { id: "6", userId: "u2", userName: "Jane Smith", action: "logout", resource: "auth", timestamp: "2024-02-10T10:05:00Z" },
        { id: "7", userId: "u5", userName: "Tom Brown", action: "create", resource: "user", details: "New registration", timestamp: "2024-02-10T10:00:00Z" },
        { id: "8", userId: "u3", userName: "Mike Johnson", action: "update", resource: "course", resourceId: "c2", details: "Completed module", timestamp: "2024-02-10T09:55:00Z" },
      ] as LogEntry[];
    },
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ["/api/admin/alerts", severityFilter],
    queryFn: async () => {
      // Mock data
      return [
        { id: "1", type: "error", severity: "critical", title: "API Rate Limit Exceeded", message: "External API rate limit reached", isResolved: false, createdAt: "2024-02-10T09:00:00Z" },
        { id: "2", type: "warning", severity: "high", title: "High Server Load", message: "Server CPU usage above 80%", isResolved: true, createdAt: "2024-02-10T08:30:00Z", resolvedAt: "2024-02-10T09:00:00Z" },
        { id: "3", type: "info", severity: "low", title: "New User Spike", message: "50 new users registered in the last hour", isResolved: false, createdAt: "2024-02-10T08:00:00Z" },
        { id: "4", type: "warning", severity: "medium", title: "Database Connection Pool", message: "Connection pool at 70% capacity", isResolved: false, createdAt: "2024-02-10T07:30:00Z" },
        { id: "5", type: "success", severity: "low", title: "Backup Completed", message: "Daily backup completed successfully", isResolved: true, createdAt: "2024-02-10T06:00:00Z" },
      ] as AlertEntry[];
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login": return LogIn;
      case "logout": return LogOut;
      case "create": return Plus;
      case "update": return Edit;
      case "delete": return Trash2;
      case "view": return Eye;
      default: return Activity;
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "delete": return "destructive";
      case "create": return "default";
      case "update": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return XCircle;
      case "high": return AlertTriangle;
      case "medium": return Info;
      case "low": return CheckCircle;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  const filteredLogs = logs?.filter((log: LogEntry) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const filteredAlerts = alerts?.filter((alert: AlertEntry) => {
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    return matchesSeverity;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation user={user} />
      
      <main className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity & Logs</h1>
            <p className="text-muted-foreground mt-1">
              Monitor system activity and manage alerts
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => activeTab === "activity" ? refetchLogs() : refetchAlerts()}>
              <RefreshCw className="icon-sm mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="icon-sm mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              System Alerts
              {(alerts?.filter((a: AlertEntry) => !a.isResolved).length ?? 0) > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {alerts?.filter((a: AlertEntry) => !a.isResolved).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <Filter className="icon-sm mr-2" />
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>
                  {filteredLogs?.length || 0} log entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs?.map((log: LogEntry) => {
                        const ActionIcon = getActionIcon(log.action);
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                {log.userName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getActionBadgeVariant(log.action)} className="flex items-center gap-1 w-fit">
                                <ActionIcon className="w-3 h-3" />
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {log.resource}
                                {log.resourceId && (
                                  <span className="text-xs text-muted-foreground">#{log.resourceId}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.details || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="icon-sm mr-2" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
              {alertsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : filteredAlerts?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No alerts found
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts?.map((alert: AlertEntry) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  const severityColors = getSeverityColor(alert.severity);
                  return (
                    <Card key={alert.id} className={`card-elevated ${alert.isResolved ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${severityColors}`}>
                            <SeverityIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground">{alert.title}</h3>
                              <Badge variant={alert.isResolved ? "secondary" : "destructive"}>
                                {alert.isResolved ? "Resolved" : "Active"}
                              </Badge>
                              <Badge variant="outline">{alert.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created: {formatTimestamp(alert.createdAt)}
                              </span>
                              {alert.resolvedAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Resolved: {formatTimestamp(alert.resolvedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          {!alert.isResolved && (
                            <Button variant="outline" size="sm">
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
