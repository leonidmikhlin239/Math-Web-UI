import type { Dispatch, SetStateAction } from 'react';
import { IndexManifest, LoadingProgress, BookInfo, ChapterInfo, Task } from '../types';

const GLOBAL_INDEX_URL = 'https://raw.githubusercontent.com/leonidmikhlin239/tasks-db/master/global-chapter-index.json';
const BASE_URL = 'https://raw.githubusercontent.com/leonidmikhlin239/tasks-db/master/';

/**
 * Loads ONLY the manifest file containing the structure of books and chapters.
 * Does NOT load the actual task content.
 */
export const loadIndexManifest = async (
    setProgress: Dispatch<SetStateAction<LoadingProgress>>
): Promise<{ manifest: IndexManifest; bookTitles: string[] }> => {
    console.log('[INDEX] Starting to load index manifest...');
    setProgress({ status: 'Загрузка манифеста библиотеки...' });

    let manifestResponse;
    try {
        manifestResponse = await fetch(GLOBAL_INDEX_URL, { cache: 'no-cache' });
    } catch (e) {
        const errorText = `Не удалось получить манифест: ${e instanceof Error ? e.message : String(e)}`;
        setProgress({ status: `Ошибка: ${errorText}` });
        throw new Error(errorText);
    }

    if (!manifestResponse.ok) {
        const errorText = `Ошибка загрузки манифеста: ${manifestResponse.statusText} (${manifestResponse.status})`;
        setProgress({ status: `Ошибка: ${errorText}` });
        throw new Error(errorText);
    }
    
    const manifestText = await manifestResponse.text();

    let manifestJson: any;
    try {
        manifestJson = JSON.parse(manifestText);
    } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        const detailedMessage = `Ошибка парсинга JSON манифеста: ${error.message}`;
        setProgress({ status: `Ошибка: ${detailedMessage}` });
        throw new Error(detailedMessage);
    }

    // --- Transform raw manifest into a clean IndexManifest structure ---
    const books: BookInfo[] = [];
    for (const bookSlug in manifestJson) {
        const rawBook = manifestJson[bookSlug];
        if (typeof rawBook !== 'object' || rawBook === null) continue;

        const bookTitle = bookSlug.replace(/_utf8$/, '').replace(/_/g, ' ');
        const chapters: ChapterInfo[] = [];

        for (const chapterKey in rawBook) {
            const rawChapter = rawBook[chapterKey];
            if (typeof rawChapter === 'object' && rawChapter !== null && typeof rawChapter.chapter_json === 'string') {
                chapters.push({
                    title: rawChapter.title || chapterKey,
                    path: rawChapter.chapter_json
                });
            }
        }
        
        if (chapters.length > 0) {
            books.push({ title: bookTitle, chapters });
        }
    }
    
    const manifest: IndexManifest = { books };
    const bookTitles = manifest.books.map(b => b.title);

    setProgress({
      status: 'Манифест загружен. Выберите книгу и главу.',
      booksLoaded: manifest.books.length,
      chaptersLoaded: manifest.books.reduce((acc, book) => acc + book.chapters.length, 0),
    });
    
    console.log('[INDEX] Manifest loaded successfully.');
    return { manifest, bookTitles };
};

/**
 * Fetches and parses the tasks for a single chapter from its JSON file.
 */
export const loadChapterTasks = async (path: string): Promise<Task[]> => {
    const url = `${BASE_URL}${path}`;
    try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url} (${response.status})`);
        }
        const chapterJson = await response.json();

        // Generate a unique prefix for task IDs from the file path
        // e.g., "4_klass_utf8/chapter_1/chapter.json" -> "4_klass_utf8_chapter_1"
        const idPrefix = path.replace('/chapter.json', '').replace(/\//g, '_');

        const cleanText = (text: string) => {
            // Removes a common TeX artifact where ".\" is used to force a space after a period.
            // In HTML/Markdown rendering, this just leaves a stray backslash.
            return text.replace(/\.\\/g, '.');
        };

        const tasks: Task[] = (Array.isArray(chapterJson) ? chapterJson : [])
            .map((rawTask: any): Task | null => {
                if (typeof rawTask.i !== 'number' || typeof rawTask.problem !== 'string' || typeof rawTask.solution !== 'string') {
                   return null;
                }
                return {
                    id: `${idPrefix}_${rawTask.i}`,
                    taskNumber: rawTask.i,
                    problem: cleanText(rawTask.problem),
                    solution: cleanText(rawTask.solution)
                };
            }).filter((t): t is Task => t !== null);

        return tasks;

    } catch (error) {
        console.error(`[INDEX] Failed to load or parse chapter from ${url}:`, error);
        return []; // Return empty array on failure
    }
};