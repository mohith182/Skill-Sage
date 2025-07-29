import { Button } from "@/components/ui/button";
import { CalendarPlus, FileText, Search } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: CalendarPlus,
      title: "Schedule Session",
      description: "Book 1-on-1 mentoring",
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      icon: FileText,
      title: "Resume Review",
      description: "AI-powered feedback",
      bgColor: "bg-green-100",
      iconColor: "text-accent",
    },
    {
      icon: Search,
      title: "Job Search",
      description: "Find opportunities",
      bgColor: "bg-purple-100",
      iconColor: "text-secondary",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex items-center space-x-3 p-3 h-auto text-left hover:bg-neutral-50 rounded-xl transition-colors justify-start"
            >
              <div className={`w-10 h-10 ${action.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <div>
                <div className="font-medium text-neutral-800">{action.title}</div>
                <div className="text-xs text-neutral-500">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
