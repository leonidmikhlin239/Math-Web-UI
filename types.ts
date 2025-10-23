export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
  imagePrompt?: string;
  hidden?: boolean;
}

export interface Task {
  id: string;
  taskNumber: number;
  problem: string; 
  solution: string;
}

// --- New types for lazy-loading architecture ---

/** Describes a single chapter within the manifest. */
export interface ChapterInfo {
  title: string;
  /** Relative path to the chapter's JSON file. */
  path: string;
}

/** Describes a single book within the manifest. */
export interface BookInfo {
  title:string;
  chapters: ChapterInfo[];
}

/** Represents the structure of the initial manifest file (`global-chapter-index.json`). */
export interface IndexManifest {
  books: BookInfo[];
}


export interface LoadingProgress {
  status: string;
  totalTasks?: number;
  booksLoaded?: number;
  chaptersLoaded?: number;
  tasksLoaded?: number;
}