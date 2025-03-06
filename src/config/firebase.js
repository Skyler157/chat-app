import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyABur8oTxrzFDcS_hCtKzhk5LhLLXWWkEM",
  authDomain: "chat-app-gs-97db9.firebaseapp.com",
  projectId: "chat-app-gs-97db9",
  storageBucket: "chat-app-gs-97db9.firebasestorage.app",
  messagingSenderId: "495163747868",
  appId: "1:495163747868:web:c567474698f7bccd6179d9",
  measurementId: "G-BGL78WKT4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,passsword) => {
    try {
        const res = await createUserWithEmailAndPassword(auth,email,passsword);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey There i am using Chat App",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
        
    }
}
const login = async (email,passsword) => {
    try {
        await signInWithEmailAndPassword(auth,email,passsword);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));       
    }
}

const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export {signup,login,logout,auth,db}