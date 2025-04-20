export const API_BASE_URL = "https://backend-972397341408.us-central1.run.app/web";
export const API_URL = "https://cloudcapture-972397341408.us-central1.run.app";
// export const API_BASE_URL = import.meta.env.VITE_API_URL ;
// export const API_URL =  import.meta.env.URL ;

export const API_ENDPOINTS = {
  MEETINGS: {
    ALL: `${API_BASE_URL}/meetings/v1/all`,
    SCHEDULE: `${API_BASE_URL}/meetings/v1/schedule`,
    UPDATE: (id: string) => `${API_BASE_URL}/meetings/v1/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/meetings/v1/delete/${id}`,
  },
  AUTH: {
    LOGIN: {
      GOOGLE: `${API_BASE_URL}/auth/v1/google`,
    },
    SIGNUP: {
      GOOGLE: `${API_BASE_URL}/auth/v1/google`,
    },
    LOGOUT: `${API_BASE_URL}/auth/v1/logout`,
    CHECK_REFRESH: `${API_BASE_URL}/auth/v1/check-refresh`,
  },
  USER: {
    ME: `${API_BASE_URL}/users/v1/user`,
    ALL: `${API_BASE_URL}/users/v1/allUsers`,
    ADD: `${API_BASE_URL}/users/v1/addUser`,
    DELETE: (id: string) => `${API_BASE_URL}/users/v1/deleteUser/${id}`,
    NOTIFY: `${API_BASE_URL}/users/v1/notify`,
    EDIT_ROLE: `${API_BASE_URL}/users/v1/editUserRole`,
  },
  ROLE: {
    ALL: `${API_BASE_URL}/roles/v1/allRoles`,
    BELOW: `${API_BASE_URL}/roles/v1/getBelowRoles`,
    ADD: `${API_BASE_URL}/roles/v1/addRole`,
    DELETE: (id: string) => `${API_BASE_URL}/roles/v1/deleteRole/${id}`,
    EDIT: (id: string) => `${API_BASE_URL}/roles/v1/editRole/${id}`,
  },
  DRIVE: {
    FOLDERS: `${API_BASE_URL}/drive/v1/folders`,
    FOLDER: (folderId: string) => `${API_BASE_URL}/drive/v1/folders/${folderId}`,
    FILE: (fileId: string) => `${API_BASE_URL}/drive/v1/files/${fileId}`,
  },
  TRANSFER:{
    GCP:`${API_BASE_URL}/transfer/v1/gcp`,
  }
};
