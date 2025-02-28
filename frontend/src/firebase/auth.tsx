import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/calendar');
  const result = await signInWithPopup(auth, provider);
  return result;
};

export const doSignOut = async () => {
  localStorage.removeItem("authToken");
  await signOut(auth);
};
