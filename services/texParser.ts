import { ProblemLibrary, LoadingProgress } from '../types';

const FILES_TO_LOAD = [
    { grade: 7, url: 'https://raw.githubusercontent.com/leonidmikhlin239/zadachki/main/grade7_tasks_solutions.ndjson' },
    { grade: 8, url: 'https://raw.githubusercontent.com/leonidmikhlin239/zadachki/main/grade8_tasks_solutions.ndjson' },
    { grade: 9, url: 'https://raw.githubusercontent.com/leonidmikhlin239/zadachki/main/grade9_tasks_solutions.ndjson' },
];

interface NdjsonRecord {
    id: string;
    grade: number;
    section: string;
    number_in_section: number;
    condition_latex: string;
    solution_latex: string;
}

const processNdjsonString = (text: string): NdjsonRecord[] => {
    return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
};

export const loadProblemLibrary = async (
    setProgress: React.Dispatch<React.SetStateAction<LoadingProgress>>
): Promise<{ library: ProblemLibrary; sections: string[] }> => {
    console.log('[ПАРСИНГ-ДЕБАГ] Запуск загрузки библиотеки задач...');
    const library: ProblemLibrary = {
        tasks: {},
        solutions: {},
    };
    const allSections = new Set<string>();
    let totalProblems = 0;
    
    setProgress(prev => ({ ...prev, totalFiles: FILES_TO_LOAD.length }));

    for (let i = 0; i < FILES_TO_LOAD.length; i++) {
        const file = FILES_TO_LOAD[i];
        const fileName = `grade${file.grade}_tasks_solutions.ndjson`;

        try {
            // Step 1: Fetching
            setProgress(prev => ({ ...prev, currentFile: fileName, status: 'Загрузка...', fileSizeBytes: 0, fileLineCount: 0 }));
            console.log(`[ЗАГРУЗКА] Запрашиваю файл: ${file.url}`);
            
            const response = await fetch(file.url);
            
            if (!response.ok) {
                const errorText = `HTTP error! Status: ${response.status} ${response.statusText}`;
                console.error(`[ЗАГРУЗКА] Не удалось загрузить ${file.url}: ${errorText}`);
                throw new Error(errorText);
            }
            console.log(`[ЗАГРУЗКА] Успешно загружен ${file.url}`);

            const rawText = await response.text();
            const sizeBytes = new Blob([rawText]).size;
            const lineCount = rawText.split('\n').filter(line => line.trim() !== '').length;

            console.log(`[ЗАГРУЗКА] Размер файла: ${sizeBytes} байт, строк: ${lineCount}`);
            setProgress(prev => ({ ...prev, status: 'Обработка...', fileSizeBytes: sizeBytes, fileLineCount: lineCount }));
            
            // Step 2: Parsing
            console.log(`[ПАРСИНГ-ДЕБАГ] Начало обработки файла: ${fileName}. Найдено ${lineCount} записей.`);
            const records = processNdjsonString(rawText);
            
            if (records.length > 0) {
                console.log(`[ПАРСИНГ-ДЕБАГ] Пример первой записи из ${fileName}:`, JSON.stringify(records[0]));
            } else {
                 console.warn(`[ПАРСИНГ-ДЕБАГ] В файле ${fileName} не найдено записей для обработки.`);
            }

            let problemsInFile = 0;
            const sectionsInFile = new Set<string>();
            
            for (const record of records) {
                const sectionKey = `${record.grade} класс - ${record.section}`;
                sectionsInFile.add(sectionKey);
                
                if (!library.tasks[sectionKey]) {
                    library.tasks[sectionKey] = {};
                    library.solutions[sectionKey] = {};
                }
                
                library.tasks[sectionKey][record.number_in_section] = record.condition_latex;
                if (record.solution_latex) {
                    library.solutions[sectionKey][record.number_in_section] = record.solution_latex;
                }
                
                allSections.add(sectionKey);
                problemsInFile++;
            }
            totalProblems += problemsInFile;

            console.log(`[ПАРСИНГ-ДЕБАГ] Файл ${fileName} обработан. Добавлено ${problemsInFile} задач.`);
            console.log(`[ПАРСИНГ-ДЕБАГ] Затронутые разделы в файле: ${Array.from(sectionsInFile).join(', ')}`);
            console.log(`[ПАРСИНГ-ДЕБАГ] Общее количество задач сейчас: ${totalProblems}`);

            setProgress(prev => ({
                ...prev,
                filesProcessed: i + 1,
                totalProblems: totalProblems
            }));
        } catch (error) {
            console.error(`[ДЕБАГ] Критическая ошибка при обработке ${fileName}:`, error);
            throw new Error(`Не удалось загрузить библиотеку задач: ${error.message}`);
        }
    }

    const sortedSections = Array.from(allSections).sort();
    console.log(`[ПАРСИНГ-ДЕБАГ] Обработка всех файлов завершена. Всего найдено ${sortedSections.length} уникальных разделов.`);
    
    return { library, sections: sortedSections };
};