import { API_ENDPOINTS } from "../constants";
import axiosInstance from "./axiosConfig";

export async function getAllFolders(){
    try{
        const response = await axiosInstance.get(API_ENDPOINTS.DRIVE.FOLDERS);
        return response;
    }
    catch(error:any){
        return { success: false, message: error.response?.data?.message , data:{} };
    }

}

export async function getFilesInFolder(folderId:string){
    try{
        const response = await axiosInstance.get(API_ENDPOINTS.DRIVE.FOLDER(folderId));
        return response;
    }
    catch(error:any){
        return { success: false, message: error.response?.data?.message , data:{} };
    }

}
