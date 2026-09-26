import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LearningTracks from './pages/LearningTracks';
import AssessmentHub from './pages/AssessmentHub';
import MentorLounge from './pages/MentorLounge';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background">
        <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-4">
          <div className="font-bold text-xl text-primary mb-6">PlacementPrep AI</div>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="p-2 hover:bg-muted rounded-md font-medium text-foreground">Dashboard</Link>
            <Link to="/learn" className="p-2 hover:bg-muted rounded-md font-medium text-foreground">Learning Tracks</Link>
            <Link to="/assessment" className="p-2 hover:bg-muted rounded-md font-medium text-foreground">Assessment Hub</Link>
            <Link to="/mentor" className="p-2 hover:bg-muted rounded-md font-medium text-foreground">Mentor Lounge</Link>
            <Link to="/analytics" className="p-2 hover:bg-muted rounded-md font-medium text-foreground">Analytics</Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto bg-muted/20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<LearningTracks />} />
            <Route path="/assessment" element={<AssessmentHub />} />
            <Route path="/mentor" element={<MentorLounge />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
