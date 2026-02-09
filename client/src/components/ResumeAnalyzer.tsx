import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Briefcase,
  GraduationCap,
  Code,
  Image,
  File,
  FileType,
  FileImage,
  FileCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  atsOptimization: string[];
  extractedData: {
    name: string;
    email: string;
    phone: string;
    experience: string[];
    education: string[];
    skills: string[];
  };
  keywordAnalysis: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
  formattingScore: number;
  contentScore: number;
  atsScore: number;
  overallScore: number;
  fileType: string;
  fileSize: string;
  processingTime: number;
}

const supportedFormats = [
  // Document formats
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/html',
  'application/xml',
  'text/xml',
  'application/json',
  // Image formats
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp',
  // Additional formats
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation'
];

const formatIcons = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileText,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileText,
  'application/vnd.ms-powerpoint': FileText,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileText,
  'text/plain': FileText,
  'text/html': FileCode,
  'application/xml': FileCode,
  'text/xml': FileCode,
  'application/json': FileCode,
  'image/jpeg': Image,
  'image/jpg': Image,
  'image/png': Image,
  'image/gif': Image,
  'image/bmp': Image,
  'image/tiff': Image,
  'image/webp': Image,
  'application/rtf': FileText,
  'text/rtf': FileText,
  'application/vnd.oasis.opendocument.text': FileText,
  'application/vnd.oasis.opendocument.spreadsheet': FileText,
  'application/vnd.oasis.opendocument.presentation': FileText
};

export function ResumeAnalyzer({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobKeywords, setJobKeywords] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    return formatIcons[fileType as keyof typeof formatIcons] || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (selectedFile: File) => {
    // Check file type
    if (!supportedFormats.includes(selectedFile.type)) {
      toast({
        title: "Unsupported File Type",
        description: `File type "${selectedFile.type}" is not supported. Please upload a supported format.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Check file size (20MB limit for images, 10MB for documents)
    const maxSize = selectedFile.type.startsWith('image/') ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `Please upload a file smaller than ${formatFileSize(maxSize)}.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setAnalysis(null); // Clear previous analysis
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setAnalysis(null); // Clear previous analysis
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    const startTime = Date.now();
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", userId);
      formData.append("fileType", file.type);
      formData.append("fileSize", file.size.toString());
      if (jobKeywords.trim()) {
        formData.append("jobKeywords", jobKeywords.trim());
      }
      
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }
      
      const data = await response.json();
      if (!data.analysis) {
        throw new Error("No analysis received from server");
      }
      
      const processingTime = Date.now() - startTime;
      setAnalysis({
        ...data.analysis,
        fileType: file.type,
        fileSize: formatFileSize(file.size),
        processingTime
      });
      
      toast({
        title: "Analysis Complete",
        description: `Resume analyzed successfully in ${processingTime}ms!`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getFileTypeDisplay = (fileType: string) => {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF Document',
      'application/msword': 'Word Document (.doc)',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (.docx)',
      'application/vnd.ms-excel': 'Excel Spreadsheet (.xls)',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet (.xlsx)',
      'application/vnd.ms-powerpoint': 'PowerPoint Presentation (.ppt)',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation (.pptx)',
      'text/plain': 'Text File (.txt)',
      'text/html': 'HTML Document',
      'application/xml': 'XML Document',
      'text/xml': 'XML Document',
      'application/json': 'JSON Document',
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/bmp': 'BMP Image',
      'image/tiff': 'TIFF Image',
      'image/webp': 'WebP Image',
      'application/rtf': 'Rich Text Format',
      'text/rtf': 'Rich Text Format',
      'application/vnd.oasis.opendocument.text': 'OpenDocument Text',
      'application/vnd.oasis.opendocument.spreadsheet': 'OpenDocument Spreadsheet',
      'application/vnd.oasis.opendocument.presentation': 'OpenDocument Presentation'
    };
    return typeMap[fileType] || fileType;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Upload */}
            <div 
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              
              <div className="text-center mb-4">
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your resume here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Word, Excel, PowerPoint, Images, XML, HTML, and more
                </p>
              </div>
              
              <input 
                type="file" 
                onChange={onFileChange} 
                className="mb-4"
                accept={supportedFormats.join(',')}
                multiple={false}
              />
              
              {/* File Info */}
              {file && (
                <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(getFileIcon(file.type), { className: "w-8 h-8 text-blue-500" })}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {getFileTypeDisplay(file.type)} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Job Keywords Input */}
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                  placeholder="e.g., React, Python, Project Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add keywords from the job description for targeted analysis
                </p>
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={!file || isAnalyzing} 
                className="mt-4"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>

            {/* Supported Formats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Supported File Formats:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>PDF, Word, Excel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-green-600" />
                  <span>JPEG, PNG, GIF</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  <span>XML, HTML, JSON</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileType className="w-4 h-4 text-orange-600" />
                  <span>Text, RTF, ODT</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-gray-500 mt-2">
                Processing {file?.type.startsWith('image/') ? 'image' : 'document'} format
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  {React.createElement(getFileIcon(analysis.fileType), { className: "w-6 h-6 text-blue-500" })}
                  <div>
                    <p className="font-medium">{getFileTypeDisplay(analysis.fileType)}</p>
                    <p className="text-sm text-gray-500">File Type</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{analysis.fileSize}</p>
                  <p className="text-sm text-gray-500">File Size</p>
                </div>
                <div>
                  <p className="font-medium">{analysis.processingTime}ms</p>
                  <p className="text-sm text-gray-500">Processing Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Analysis Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBgColor(analysis.overallScore)}`}>
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{analysis.extractedData?.name || 'Name not found'}</h3>
                  <p className="text-gray-600 mb-4">{analysis.summary}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.formattingScore}</div>
                      <div className="text-sm text-gray-500">Formatting</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analysis.contentScore}</div>
                      <div className="text-sm text-gray-500">Content</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analysis.atsScore}</div>
                      <div className="text-sm text-gray-500">ATS</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <CardTitle>Formatting Score</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={analysis.formattingScore} className="mb-4" />
                <p className="text-sm text-gray-600">
                  {analysis.formattingScore >= 80 ? "Excellent formatting and structure" :
                   analysis.formattingScore >= 60 ? "Good formatting with room for improvement" :
                   "Needs formatting improvements"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-500" />
                <CardTitle>Content Score</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={analysis.contentScore} className="mb-4" />
                <p className="text-sm text-gray-600">
                  {analysis.contentScore >= 80 ? "Strong content and achievements" :
                   analysis.contentScore >= 60 ? "Good content, could be enhanced" :
                   "Content needs significant improvement"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
                <CardTitle>ATS Score</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={analysis.atsScore} className="mb-4" />
                <p className="text-sm text-gray-600">
                  {analysis.atsScore >= 80 ? "Excellent ATS compatibility" :
                   analysis.atsScore >= 60 ? "Good ATS compatibility" :
                   "Needs ATS optimization"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Keyword Analysis */}
          {analysis.keywordAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Keyword Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Found Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.found.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.missing.map((keyword, index) => (
                        <Badge key={index} variant="destructive">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Suggested Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.suggestions.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <CardTitle>Improvement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.improvements?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.atsOptimization?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Extracted Information */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {analysis.extractedData?.name || 'Not found'}</p>
                    <p><strong>Email:</strong> {analysis.extractedData?.email || 'Not found'}</p>
                    <p><strong>Phone:</strong> {analysis.extractedData?.phone || 'Not found'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Experience
                  </h4>
                  <div className="space-y-1">
                    {analysis.extractedData?.experience?.map((exp, index) => (
                      <p key={index} className="text-sm">• {exp}</p>
                    )) || <p className="text-sm text-gray-500">No experience found</p>}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </h4>
                  <div className="space-y-1">
                    {analysis.extractedData?.education?.map((edu, index) => (
                      <p key={index} className="text-sm">• {edu}</p>
                    )) || <p className="text-sm text-gray-500">No education found</p>}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.extractedData?.skills?.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    )) || <p className="text-sm text-gray-500">No skills found</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 