// import { UserDocument } from '../models/User';
import mongoose, {Document} from 'mongoose';

//User Document Interface
export interface UserDocument extends Document {
    googleId: string;
    displayName: string;
    email:string;
    role: mongoose.Schema.Types.ObjectId;
    photoURL: string;
    accessToken: string;
    refreshToken: string;
}

// Role document interface
export interface RoleDocument extends Document {
    name: string;
    permissions: string[];

}

export interface AuthenticatedRequest extends Request {
    user?: User;
    token?: string;
    params: Record<string, string>; 
    header: Record<string, string>; 
    cookies: Record<string, string>;
}



export interface MeetingResponse {
    success: boolean;
    message?: string;
    meetLink?: string;
    updatedEvent?: any;
}



export interface User extends Document {
    email: any;
    googleId: string
    _id: string;
    role: { _id: mongoose.Schema.Types.ObjectId, name: string, permissions:string[] };
    refreshToken: string;
}


export interface Payload {
    type?: string;
    client_id?: string;
    client_secret?: string;
    refresh_token?: string;
}



// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserDocument;
//     }
//   }
// }