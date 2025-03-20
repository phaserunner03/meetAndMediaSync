import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FolderData {
    id: string;
    name: string;
}

interface FileData {
    id: string;
    name: string;
    webViewLink?: string;
}

interface DriveContextType {
    folders: FolderData[];
    selectedFolder: FolderData | null;
    files: FileData[];
    setFolders: (folders: FolderData[]) => void;
    setSelectedFolder: (folder: FolderData | null) => void;
    setFiles: (files: FileData[]) => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const DriveProvider = ({ children }: { children: ReactNode }) => {
    const [folders, setFolders] = useState<FolderData[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(
        () => {
            const storedFolder = sessionStorage.getItem("selectedFolder");
            return storedFolder ? JSON.parse(storedFolder) : null;
        }
    );
    const [files, setFiles] = useState<FileData[]>(() => {
        const storedFiles = sessionStorage.getItem("files");
        return storedFiles ? JSON.parse(storedFiles) : [];
    });

    // Store selected folder & files in session storage when changed
    useEffect(() => {
        if (selectedFolder) {
            sessionStorage.setItem("selectedFolder", JSON.stringify(selectedFolder));
        } else {
            sessionStorage.removeItem("selectedFolder");
        }
    }, [selectedFolder]);

    useEffect(() => {
        sessionStorage.setItem("files", JSON.stringify(files));
    }, [files]);

    return (
        <DriveContext.Provider value={{ folders, selectedFolder, files, setFolders, setSelectedFolder, setFiles }}>
            {children}
        </DriveContext.Provider>
    );
};

export const useDrive = () => {
    const context = useContext(DriveContext);
    if (!context) throw new Error("useDrive must be used within a DriveProvider");
    return context;
};
