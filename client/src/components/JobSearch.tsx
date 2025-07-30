
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobSearchProps {
  userId: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applyUrl: string;
  isRealTime?: boolean;
}

export function JobSearch({ userId }: JobSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Popular India job locations
  const popularIndiaLocations = [
    "Bangalore, India",
    "Mumbai, India", 
    "Delhi NCR, India",
    "Hyderabad, India",
    "Pune, India",
    "Chennai, India",
    "Gurgaon, India",
    "Noida, India",
    "Kolkata, India"
  ];

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search required",
        description: "Please enter a job title or keyword.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`, {
        method: "GET",
      });

      if (response.ok) {
        const result = await response.json();
        setJobs(result.jobs || result);
        
        // Show success message for India jobs
        const isIndiaSearch = locationQuery.toLowerCase().includes('india') || 
                             popularIndiaLocations.some(loc => locationQuery.toLowerCase().includes(loc.toLowerCase()));
        
        if (isIndiaSearch || !locationQuery) {
          toast({
            title: "Real-time India Jobs Found!",
            description: `Found ${result.jobs?.length || 0} job opportunities with current market data.`,
          });
        } else {
          toast({
            title: "Jobs Found!",
            description: `Found ${result.jobs?.length || 0} job opportunities.`,
          });
        }
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Job search error:", error);
      // Provide mock jobs for demo
      setJobs([
        {
          id: "1",
          title: `Senior ${searchQuery} Developer`,
          company: "TechCorp Inc",
          location: locationQuery || "San Francisco, CA",
          type: "Full-time",
          salary: "$120,000 - $150,000",
          description: `We are looking for an experienced ${searchQuery} developer to join our innovative team. You'll work on cutting-edge projects and collaborate with talented engineers.`,
          requirements: [searchQuery, "5+ years experience", "Bachelor's degree", "Team collaboration", "Problem solving"],
          postedDate: "2 days ago",
          applyUrl: "#"
        },
        {
          id: "2",
          title: `${searchQuery} Engineer`,
          company: "StartupXYZ",
          location: locationQuery || "Remote",
          type: "Full-time",
          salary: "$90,000 - $120,000",
          description: `Join our fast-growing startup as a ${searchQuery} engineer. Great opportunity for growth and learning in a dynamic environment.`,
          requirements: [searchQuery, "3+ years experience", "Startup experience", "Agile methodology"],
          postedDate: "1 week ago",
          applyUrl: "#"
        },
        {
          id: "3",
          title: `Junior ${searchQuery} Developer`,
          company: "BigTech Solutions",
          location: locationQuery || "New York, NY",
          type: "Full-time",
          salary: "$70,000 - $85,000",
          description: `Entry-level position perfect for new graduates. We provide extensive training and mentorship opportunities.`,
          requirements: [searchQuery, "0-2 years experience", "Recent graduate", "Eager to learn"],
          postedDate: "3 days ago",
          applyUrl: "#"
        },
        {
          id: "4",
          title: `${searchQuery} Consultant`,
          company: "ConsultingPro",
          location: locationQuery || "Chicago, IL",
          type: "Contract",
          salary: "$80 - $120/hour",
          description: `Contract position for experienced ${searchQuery} professionals. Work with multiple clients on diverse projects.`,
          requirements: [searchQuery, "7+ years experience", "Consulting experience", "Client management"],
          postedDate: "5 days ago",
          applyUrl: "#"
        }
      ]);
      toast({
        title: "Demo Results",
        description: "Showing demo job listings.",
      });
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchJobs();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Job Search
          </CardTitle>
          <CardDescription>
            Find your next career opportunity with AI-powered job matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Title or Keywords</label>
                <Input
                  placeholder="e.g. Software Engineer, Data Scientist, Product Manager"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                <Input
                  placeholder="e.g. Bangalore, Mumbai, Delhi NCR"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            
            {/* Popular India Locations */}
            <div>
              <label className="text-sm font-medium mb-2 block">Popular India Job Locations:</label>
              <div className="flex flex-wrap gap-2">
                {popularIndiaLocations.map((location) => (
                  <Button
                    key={location}
                    variant="outline"
                    size="sm"
                    onClick={() => setLocationQuery(location)}
                    className="text-xs"
                  >
                    {location.split(',')[0]}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={searchJobs} disabled={loading} className="w-full">
              {loading ? "Searching..." : "Search Jobs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}</h3>
          
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {job.isRealTime && (
                        <Badge variant="default" className="bg-green-500 text-white text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Real-time
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base font-medium text-blue-600">
                      {job.company}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Apply
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="text-gray-500">
                      Posted {job.postedDate}
                    </div>
                  </div>

                  <p className="text-gray-700 line-clamp-3">
                    {job.description}
                  </p>

                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {jobs.length === 0 && searchQuery && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search terms or location.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
