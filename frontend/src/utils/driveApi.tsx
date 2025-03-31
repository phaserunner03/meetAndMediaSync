import axiosInstance from "./axiosConfig";

export async function getAllFolders(){
    try{
        const response = await axiosInstance.get("/drive/v1/folders");
        return response;
    }
    catch(error:any){
        return { success: false, message: error.response?.data?.message , data:{} };
    }

}

export async function getFilesInFolder(folderId:string){
    try{
        const response = await axiosInstance.get(`/drive/v1/folders/${folderId}`);
        return response;
    }
    catch(error:any){
        return { success: false, message: error.response?.data?.message , data:{} };
    }

}
