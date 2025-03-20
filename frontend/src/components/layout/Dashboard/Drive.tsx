import { useEffect, useState } from "react";
import { getAllFolders } from "../../../utils/driveApi";


interface Folder {
    id: string;
    name: string;
}

const Drive = () => {

    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchFolders() {
            setLoading(true);
            try {
                const response = await getAllFolders();
                setFolders(response.data.data.folders)
                
                
            } catch (error) {
                console.error("Error fetching folders:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFolders();
    }, []);
  return (
    <div className="pt-4 sm:ml-64">
            <div className="pt-4 max-w-[1800px] mx-auto">
            {!selectedFolder && 
                // Show list of folders
                <div>
                    <h3 className="text-lg font-semibold">Folders:</h3>
                    <ul className="mt-2">
                        {folders.map((folder) => (
                            <li
                                key={folder.id}
                                className="cursor-pointer p-2 border-b hover:bg-gray-100"
                            >
                                 {folder.name}
                            </li>
                        ))}
                    </ul>
                </div>}
            </div>
        </div>
  )
}

export default Drive
