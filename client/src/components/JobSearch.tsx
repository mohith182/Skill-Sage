
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building, Clock, ExternalLink } from "lucide-react";
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
}

export function JobSearch({ userId }: JobSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a job title or keyword",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          location: location,
          userId: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        toast({
          title: `Found ${data.jobs?.length || 0} jobs`,
          description: "Check the results below",
        });
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'internship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Job Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-primary hover:bg-primary/90"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {jobs.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-800">
              Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {jobs.map((job) => (
                <Card key={job.id} className="border-primary/20 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-semibold text-lg">{job.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{job.postedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={getJobTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">{job.salary}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 line-clamp-2">{job.description}</p>
                      
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium text-neutral-700">Requirements:</h6>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 5).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button 
                          size="sm"
                          onClick={() => window.open(job.applyUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {jobs.length === 0 && searchQuery && !isSearching && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-700">
                No jobs found for "{searchQuery}". Try different keywords or locations.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
