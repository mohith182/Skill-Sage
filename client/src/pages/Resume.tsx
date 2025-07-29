
import { ResumeReview } from "@/components/ResumeReview";
import { useUser } from "@/lib/firebase";

export default function Resume() {
  const user = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neutral-800">AI Resume Review</h1>
          <p className="text-neutral-600">Get personalized feedback to improve your resume</p>
        </div>
        
        <ResumeReview userId={user.uid} />
      </div>
    </div>
  );
}
