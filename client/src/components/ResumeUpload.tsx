import React, { useState } from "react";

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/resume-review", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setFeedback(result.feedback);
  };

  return (
    <div>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Resume</button>
      {feedback && <div>{feedback}</div>}
    </div>
  );
};

export default ResumeUpload;
