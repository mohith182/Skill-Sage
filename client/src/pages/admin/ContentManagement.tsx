import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User as FirebaseUser } from "firebase/auth";
import { AdminNavigation } from "@/components/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentManagementProps {
  user: FirebaseUser;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ContentManagement({ user }: ContentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content
  const { data: content, isLoading } = useQuery({
    queryKey: ["/api/admin/content", activeTab],
    queryFn: async () => {
      // Return mock data for demonstration
      const mockContent: Record<string, ContentItem[]> = {
        courses: [
          { id: "1", title: "Deep Learning Fundamentals", description: "Master neural networks", type: "course", isActive: true, createdAt: "2024-01-15" },
          { id: "2", title: "Python for Data Science", description: "Advanced Python techniques", type: "course", isActive: true, createdAt: "2024-01-20" },
          { id: "3", title: "Machine Learning Basics", description: "Introduction to ML", type: "course", isActive: false, createdAt: "2024-02-01" },
        ],
        articles: [
          { id: "4", title: "How to Prepare for Tech Interviews", description: "Interview preparation guide", type: "article", url: "#", isActive: true, createdAt: "2024-01-25" },
          { id: "5", title: "Resume Writing Best Practices", description: "Tips for creating effective resumes", type: "article", url: "#", isActive: true, createdAt: "2024-02-05" },
        ],
        videos: [
          { id: "6", title: "Career Development Workshop", description: "Video workshop on career growth", type: "video", url: "#", isActive: true, createdAt: "2024-02-01" },
        ],
        templates: [
          { id: "7", title: "Modern Resume Template", description: "Clean and professional resume template", type: "template", url: "#", isActive: true, createdAt: "2024-01-10" },
          { id: "8", title: "Cover Letter Template", description: "Professional cover letter format", type: "template", url: "#", isActive: true, createdAt: "2024-01-12" },
        ],
      };
      return mockContent[activeTab] || [];
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "article": return FileText;
      case "video": return Video;
      default: return FileText;
    }
  };

  const filteredContent = content?.filter((item: ContentItem) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation user={user} />
      
      <main className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage courses, articles, videos, and templates
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="icon-sm mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Add a new course, article, video, or template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL (optional)</Label>
                  <Input id="url" placeholder="Enter URL" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({ title: "Content created successfully" });
                  setIsCreateDialogOpen(false);
                }}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : filteredContent?.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No content found
                  </CardContent>
                </Card>
              ) : (
                filteredContent?.map((item: ContentItem) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <Card key={item.id} className="card-elevated hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <TypeIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                              <Badge variant={item.isActive ? "default" : "secondary"} className="mt-1">
                                {item.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            {item.url && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setEditingContent(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                toast({ title: item.isActive ? "Content deactivated" : "Content activated" });
                              }}
                            >
                              {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this content?")) {
                                  toast({ title: "Content deleted" });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Content Dialog */}
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Update content information
              </DialogDescription>
            </DialogHeader>
            {editingContent && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" defaultValue={editingContent.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" defaultValue={editingContent.description} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL (optional)</Label>
                  <Input id="edit-url" defaultValue={editingContent.url || ""} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-active">Active</Label>
                  <Switch id="edit-active" defaultChecked={editingContent.isActive} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingContent(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Content updated successfully" });
                setEditingContent(null);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
