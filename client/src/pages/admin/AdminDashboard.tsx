import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as FirebaseUser } from "firebase/auth";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

interface AdminDashboardProps {
  user: FirebaseUser;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch admin stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        // Return mock data for now
        return {
          totalUsers: 156,
          activeUsers: 89,
          totalCourses: 24,
          totalResumes: 312,
          alertsCount: 5,
          pendingAlerts: 3,
        };
      }
      return response.json();
    },
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/activities?limit=10");
      if (!response.ok) {
        // Return mock data
        return [
          { id: 1, user: "John Doe", action: "Uploaded resume", time: "2 min ago", type: "resume" },
          { id: 2, user: "Jane Smith", action: "Completed course", time: "5 min ago", type: "course" },
          { id: 3, user: "Mike Johnson", action: "Started interview", time: "10 min ago", type: "interview" },
          { id: 4, user: "Sarah Wilson", action: "Updated profile", time: "15 min ago", type: "profile" },
          { id: 5, user: "Tom Brown", action: "New registration", time: "20 min ago", type: "registration" },
        ];
      }
      return response.json();
    },
  });

  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ["/api/admin/alerts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/alerts?limit=5");
      if (!response.ok) {
        return [
          { id: 1, title: "High server load", severity: "warning", time: "1 hour ago" },
          { id: 2, title: "New user spike", severity: "info", time: "2 hours ago" },
          { id: 3, title: "API rate limit reached", severity: "error", time: "3 hours ago" },
        ];
      }
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setIsRefreshing(false);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      change: "+8%",
      trend: "up",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      change: "+3",
      trend: "up",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Resumes Analyzed",
      value: stats?.totalResumes || 0,
      change: "+45",
      trend: "up",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      error: "destructive",
      warning: "secondary",
      info: "default",
    };
    return variants[severity] || "default";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation user={user} />
      
      <main className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.displayName || "Admin"}. Here's what's happening.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="mt-4 md:mt-0"
            disabled={isRefreshing}
          >
            <RefreshCw className={`icon-sm mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="card-elevated hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest user actions across the platform</CardDescription>
              </div>
              <Link href="/admin/logs">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts Panel */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">System Alerts</CardTitle>
                <CardDescription>Recent notifications</CardDescription>
              </div>
              <Badge variant="secondary" className="font-medium">
                {stats?.pendingAlerts || 0} pending
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts?.map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                    {alert.severity === "error" ? (
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge variant={getSeverityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
              <Link href="/admin/alerts">
                <Button variant="outline" className="w-full mt-4">
                  View All Alerts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BookOpen className="w-6 h-6" />
                  <span>Manage Content</span>
                </Button>
              </Link>
              <Link href="/admin/alerts">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>View Alerts</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <MoreHorizontal className="w-6 h-6" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
