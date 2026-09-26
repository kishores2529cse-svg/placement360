
export default function MentorLounge() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Dashboard Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Kishore AI Mentor Lounge</h1>
        <p className="text-gray-400">Mock Interviews & Communication Drills</p>
      </div>

      {/* Embedded Live AI Mentor */}
      <div className="flex-1 w-full h-full">
        <iframe 
          src="https://kishore-ai-mentor.vercel.app/" 
          className="w-full h-full border-none"
          title="Kishore AI Mentor"
          allow="microphone; camera" // CRITICAL: Allows the iframe to use the mic/camera!
        />
      </div>
    </div>
  );
}
