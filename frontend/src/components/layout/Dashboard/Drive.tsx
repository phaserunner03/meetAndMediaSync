import { useEffect, useState } from "react";
import { getAllFolders, getFilesInFolder } from "../../../utils/driveApi";
import { toast } from "sonner";
import { Folder, FileText, Trash2, ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import axiosInstance from "../../../utils/axiosConfig";
import { useDrive } from "../../../context/driveContext"
import Loader from "../../common/Loader";

const Drive = () => {
    const { folders, selectedFolder, files, setFolders, setSelectedFolder, setFiles } = useDrive();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFolders() {
            setLoading(true);
            try {
                const response = await getAllFolders();
                if (response?.data?.success && response?.data?.data?.folders) {
                    setFolders(response.data.data.folders);
                } else {
                    toast.error("Failed to fetch folders!");
                }
            } catch (error) {
                toast.error("Error fetching folders!");
                console.error("Error fetching folders:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFolders();
    }, []);

    const handleFolderClick = async (folder: { id: string; name: string }) => {
        setSelectedFolder(folder);
        setLoading(true);
        try {
            const response = await getFilesInFolder(folder.id);
            if (response?.data?.success) {
                setFiles(response.data.data.files || []);
                if (response.data.data.files.length === 0) {
                    toast.info("This folder has no files!");
                }
            } else {
                toast.error("Failed to fetch files!");
            }
        } catch (error) {
            toast.error("Error fetching files!");
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!selectedFolder) return;
        setDeleting(fileId);
        try {
            await axiosInstance.delete(`/api/drive/files/${fileId}`);
            setFiles(files.filter((file) => file.id !== fileId));
            toast.success("File deleted successfully!");
        } catch (error) {
            toast.error("Error deleting file!");
            console.error("Error deleting file:", error);
        } finally {
            setDeleting(null);
        }
    };

    const handleTransferToGCP = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/transfer/gcp');
            if (response.status === 200) {
                toast.success("Folder transferred to GCP successfully!");
            } else {
                toast.error("Failed to transfer folder to GCP!");
            }
        } catch (error) {
            toast.error("Error transferring folder to GCP!");
            console.error("Error transferring folder to GCP:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 sm:ml-64 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">📁 Drive</h2>

                {loading && (
                    <Loader/>
                )}

                <Button
                    variant="outline"
                    onClick={handleTransferToGCP}
                    className="mb-4 flex items-center gap-2"
                >
                    Transfer to GCP
                </Button>

                {!selectedFolder ? (
                    <ScrollArea className="h-[500px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folders.length === 0 ? (
                                <p className="text-gray-500">No folders available.</p>
                            ) : (
                                folders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        onClick={() => handleFolderClick(folder)}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Folder className="w-6 h-6 text-blue-500" />
                                                {folder.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-500">Click to view files</p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedFolder(null);
                                setFiles([]); // Reset files when going back
                            }}
                            className="mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Back to Folders
                        </Button>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Folder className="w-6 h-6 text-blue-500" />
                            {selectedFolder.name}
                        </h3>
                        {files.length === 0 ? (
                            <p className="text-gray-500 mt-4">No files in this folder.</p>
                        ) : (
                            <ScrollArea className="h-[500px]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                    {files.map((file) => (
                                        <Card key={file.id} className="h-[140px] flex flex-col justify-between">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="w-6 h-6 text-gray-500" />
                                                    <span className="max-w-[180px] sm:max-w-full truncate">
                                                        {file.name}
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex gap-2 items-center">
                                                <Button asChild variant="outline" className="flex items-center gap-2">
                                                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="w-5 h-5" /> View
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="flex items-center gap-2"
                                                    disabled={deleting === file.id}
                                                >
                                                    {deleting === file.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                    Delete
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Drive;
