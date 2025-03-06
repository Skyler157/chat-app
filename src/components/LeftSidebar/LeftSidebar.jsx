import React, { useContext, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { collection, doc, query, where, getDocs, updateDoc, arrayUnion, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {
  
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const userDataFromFirestore = querySnap.docs[0].data();
          if (userDataFromFirestore.id !== userData.id) {
            let userExist = false;
            chatData.forEach((user) => {
              if (user.rId === querySnap.docs[0].data().id) {
                userExist = true;
              }
            });
            if (!userExist) {
              setUser(querySnap.docs[0].data());
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      // Create new message document
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      // Check if chat exists for the user (user.id)
      const userChatRef = doc(chatsRef, user.id);
      const userChatDoc = await getDoc(userChatRef);

      // If the user chat document doesn't exist, create it
      if (!userChatDoc.exists()) {
        await setDoc(userChatRef, {
          chatsData: [],
        });
      }

      // Update chat document for the user (user.id)
      await updateDoc(userChatRef, {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Check if chat exists for the current user (userData.id)
      const userDataChatRef = doc(chatsRef, userData.id);
      const userDataChatDoc = await getDoc(userDataChatRef);

      // If the current user chat document doesn't exist, create it
      if (!userDataChatDoc.exists()) {
        await setDoc(userDataChatRef, {
          chatsData: [],
        });
      }

      // Update chat document for the current user (userData.id)
      await updateDoc(userDataChatRef, {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item)
    
  }

  return (
    <div className='ls'>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here...' />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar || assets.profile_img} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          (Array.isArray(chatData) ? chatData : [])
            .sort((a, b) => b.updatedAt - a.updatedAt) // Sort chats by updatedAt (most recent first)
            .map((item, index) => (
              <div onClick={()=>setChat(item)} key={index} className="friends">
                <img src={item.userData.avatar} alt="" />
                <div>
                  <p>{item.userData.name}</p>
                  <span>{item.lastMessage}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
