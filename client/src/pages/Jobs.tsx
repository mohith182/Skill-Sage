
import { JobSearch } from "@/components/JobSearch";
import { useUser } from "@/lib/firebase";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, TrendingUp, Users, Building, Search, Star, Lightbulb, Loader2 } from "lucide-react";

export default function Jobs() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="icon-lg spinner icon-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  const quickStats = [
    { icon: Search, label: "Active Jobs", value: "10K+", color: "text-primary" },
    { icon: Building, label: "Companies", value: "500+", color: "text-emerald-600" },
    { icon: Users, label: "Hired", value: "50K+", color: "text-violet-600" },
    { icon: TrendingUp, label: "Success Rate", value: "95%", color: "text-amber-600" },
  ];

  const categories = [
    { category: "Software Engineering", count: "2,500+", icon: Briefcase },
    { category: "Data Science", count: "1,200+", icon: TrendingUp },
    { category: "Product Management", count: "800+", icon: Star },
    { category: "UX/UI Design", count: "600+", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="section-container py-6 space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-wrapper icon-wrapper-md icon-bg-primary">
              <Briefcase className="icon-md text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Job Opportunities</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Discover your next career opportunity with AI-powered job recommendations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="card-professional">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper icon-wrapper-sm bg-muted">
                    <stat.icon className={`icon-sm ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Search Component */}
        <Card className="card-professional">
          <CardContent className="p-5">
            <JobSearch userId={user.uid} />
          </CardContent>
        </Card>

        {/* Popular Job Categories */}
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="icon-wrapper icon-wrapper-sm icon-bg-primary">
                <Star className="icon-sm icon-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Popular Categories</CardTitle>
                <CardDescription className="text-sm">Explore trending career opportunities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                    <div className="icon-wrapper icon-wrapper-sm bg-muted mb-3">
                      <item.icon className="icon-sm icon-primary" />
                    </div>
                    <h4 className="font-medium text-sm text-foreground mb-1">{item.category}</h4>
                    <p className="text-xs text-muted-foreground">{item.count} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Search Tips */}
        <Card className="card-professional border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Job Search Tips</CardTitle>
                <CardDescription className="text-sm">Expert strategies to land your dream job</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { num: "1", title: "Optimize Your Profile", desc: "Complete with relevant skills and experience" },
                  { num: "2", title: "Use Specific Keywords", desc: "Include technical skills and job titles" },
                  { num: "3", title: "Set Job Alerts", desc: "Get notified for matching positions" },
                ].map((tip) => (
                  <div key={tip.num} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{tip.num}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { num: "4", title: "Network Actively", desc: "Connect with industry professionals" },
                  { num: "5", title: "Apply Strategically", desc: "Quality over quantity in applications" },
                  { num: "6", title: "Follow Up", desc: "Send thoughtful follow-up messages" },
                ].map((tip) => (
                  <div key={tip.num} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{tip.num}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
