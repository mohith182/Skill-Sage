
import { JobSearch } from "@/components/JobSearch";
import { useUser } from "@/lib/firebase";

export default function Jobs() {
  const user = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neutral-800">Job Search</h1>
          <p className="text-neutral-600">Find your next career opportunity</p>
        </div>
        
        <JobSearch userId={user.uid} />
      </div>
    </div>
  );
}
