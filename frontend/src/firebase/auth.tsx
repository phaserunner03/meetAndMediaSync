import { auth } from "./firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {useNavigate} from 'react-router-dom'

const db = getFirestore();

export const doSignInWithGoogle = async()=>{
    
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid
    };
    
    const token = await result.user.getIdToken();
    localStorage.setItem("authToken", token);
    
    await setDoc(doc(db, "users", user.uid), user);

    // Redirect to dashboard after login
    navigate("/dashboard");

    return result;
};

export const doSignOut = async () => {
    localStorage.removeItem("authToken");
    await signOut(auth);
};