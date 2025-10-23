export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
  imagePrompt?: string;
}

export interface Problem {
  [problemNumber: string]: string; // TeX content
}

export interface ProblemSection {
  [sectionName: string]: Problem;
}

export interface ProblemLibrary {
  tasks: ProblemSection;
  solutions: ProblemSection;
}

export interface LoadingProgress {
  currentFile: string;
  filesProcessed: number;
  totalFiles: number;
  totalProblems: number;
  // New fields for debugging
  status: string;
  fileSizeBytes: number;
  fileLineCount: number;
}