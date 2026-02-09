import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Eye, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    url: string;
  }>;
}

const initialResumeData: ResumeData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export function ResumeBuilder({ userId }: { userId: string }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    const skill = prompt("Enter a skill:");
    if (skill && skill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: "",
      url: "",
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const saveResume = async () => {
    try {
      const response = await fetch("/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, resumeData }),
      });

      if (response.ok) {
        setIsSaved(true);
        setLastSaved(new Date());
        toast({
          title: "Resume Saved",
          description: "Your resume has been saved successfully!",
        });
      } else {
        throw new Error("Failed to save resume");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadResume = () => {
    // Create a professional HTML version for download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.personalInfo.name || 'Resume'} - Professional Resume</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 2.5em;
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            margin: 15px 0;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .section { 
            margin-bottom: 30px; 
          }
          
          .section-title { 
            font-size: 1.4em; 
            font-weight: bold; 
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb; 
            margin-bottom: 15px; 
            padding-bottom: 5px;
          }
          
          .experience-item, .education-item, .project-item { 
            margin-bottom: 20px; 
            padding: 15px;
            border-left: 3px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .experience-item:hover, .education-item:hover, .project-item:hover {
            border-left-color: #2563eb;
            background: #f0f9ff;
          }
          
          .job-title {
            font-weight: bold;
            color: #1f2937;
            font-size: 1.1em;
          }
          
          .company-name {
            color: #2563eb;
            font-weight: 600;
          }
          
          .date-range {
            color: #6b7280;
            font-style: italic;
          }
          
          .skills { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
          }
          
          .skill { 
            background: #2563eb; 
            color: white;
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 0.9em;
            font-weight: 500;
          }
          
          .summary {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .project-title {
            font-weight: bold;
            color: #1f2937;
          }
          
          .technologies {
            color: #6b7280;
            font-size: 0.9em;
          }
          
          .download-info {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background: #f0f9ff;
            border-radius: 8px;
            font-size: 0.9em;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${resumeData.personalInfo.name || 'Your Name'}</h1>
            <div class="contact-info">
              ${resumeData.personalInfo.email ? `<div class="contact-item">📧 ${resumeData.personalInfo.email}</div>` : ''}
              ${resumeData.personalInfo.phone ? `<div class="contact-item">📞 ${resumeData.personalInfo.phone}</div>` : ''}
              ${resumeData.personalInfo.location ? `<div class="contact-item">📍 ${resumeData.personalInfo.location}</div>` : ''}
              ${resumeData.personalInfo.linkedin ? `<div class="contact-item">🔗 <a href="${resumeData.personalInfo.linkedin}" target="_blank">LinkedIn</a></div>` : ''}
            </div>
          </div>
          
          ${resumeData.personalInfo.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">
              <p>${resumeData.personalInfo.summary}</p>
            </div>
          </div>
          ` : ''}
          
          ${resumeData.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${resumeData.experience.map(exp => `
              <div class="experience-item">
                <div class="job-title">${exp.title}</div>
                <div class="company-name">${exp.company}</div>
                <div class="date-range">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                ${exp.location ? `<div style="color: #6b7280; margin-bottom: 10px;">📍 ${exp.location}</div>` : ''}
                <p>${exp.description}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${resumeData.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${resumeData.education.map(edu => `
              <div class="education-item">
                <div class="job-title">${edu.degree}</div>
                <div class="company-name">${edu.institution}</div>
                <div class="date-range">${edu.startDate} - ${edu.endDate}</div>
                ${edu.location ? `<div style="color: #6b7280; margin-bottom: 10px;">📍 ${edu.location}</div>` : ''}
                ${edu.gpa ? `<div style="color: #6b7280;">GPA: ${edu.gpa}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${resumeData.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills">
              ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          
          ${resumeData.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Projects</div>
            ${resumeData.projects.map(project => `
              <div class="project-item">
                <div class="project-title">${project.name}</div>
                <div class="technologies">Technologies: ${project.technologies}</div>
                <p>${project.description}</p>
                ${project.url ? `<p><a href="${project.url}" target="_blank">🔗 View Project</a></p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="download-info no-print">
            <p>Generated by SkillSage Resume Builder</p>
            <p>Last updated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.name || 'resume'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Resume Downloaded",
      description: "Your resume has been downloaded successfully!",
    });
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resume Preview</h2>
          <div className="space-x-2">
            <Button onClick={() => setIsPreviewMode(false)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={downloadResume}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.name || 'Your Name'}</h1>
                <p className="text-gray-600">{resumeData.personalInfo.email}</p>
                <p className="text-gray-600">{resumeData.personalInfo.phone}</p>
                <p className="text-gray-600">{resumeData.personalInfo.location}</p>
                {resumeData.personalInfo.linkedin && (
                  <p className="text-blue-600">{resumeData.personalInfo.linkedin}</p>
                )}
              </div>

              {/* Summary */}
              {resumeData.personalInfo.summary && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 border-b-2 border-gray-300">Summary</h2>
                  <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-300">Experience</h2>
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{exp.title}</h3>
                        <span className="text-sm text-gray-500">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <p className="text-blue-600 font-medium">{exp.company} - {exp.location}</p>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-300">Education</h2>
                  {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <span className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                      <p className="text-blue-600 font-medium">{edu.institution} - {edu.location}</p>
                      {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-300">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-300">Projects</h2>
                  {resumeData.projects.map((project, index) => (
                    <div key={project.id} className="mb-4">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-gray-700 mt-1">{project.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Technologies:</strong> {project.technologies}
                      </p>
                      {project.url && (
                        <a href={project.url} className="text-blue-600 text-sm" target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resume Builder</h2>
          {isSaved && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Saved {lastSaved?.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <div className="space-x-2">
          <Button onClick={saveResume}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={() => setIsPreviewMode(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={downloadResume} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={resumeData.personalInfo.name}
                onChange={(e) => updatePersonalInfo("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={resumeData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={resumeData.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={resumeData.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={resumeData.personalInfo.summary}
              onChange={(e) => updatePersonalInfo("summary", e.target.value)}
              placeholder="Brief professional summary..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Experience</CardTitle>
          <Button onClick={addExperience} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <div key={exp.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Experience #{index + 1}</h4>
                <Button
                  onClick={() => removeExperience(exp.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    placeholder="Tech Company Inc."
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      disabled={exp.current}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                />
                <Label htmlFor={`current-${exp.id}`}>Current Position</Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button onClick={addEducation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <div key={edu.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Education #{index + 1}</h4>
                <Button
                  onClick={() => removeEducation(edu.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>GPA (Optional)</Label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                    placeholder="3.8"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Button onClick={addSkill} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span>{skill}</span>
                <Button
                  onClick={() => removeSkill(index)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button onClick={addProject} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.projects.map((project, index) => (
            <div key={project.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Project #{index + 1}</h4>
                <Button
                  onClick={() => removeProject(project.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    placeholder="E-commerce Platform"
                  />
                </div>
                <div>
                  <Label>Technologies</Label>
                  <Input
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Project URL (Optional)</Label>
                  <Input
                    value={project.url}
                    onChange={(e) => updateProject(project.id, "url", e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, "description", e.target.value)}
                  placeholder="Describe your project, its features, and your role..."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 