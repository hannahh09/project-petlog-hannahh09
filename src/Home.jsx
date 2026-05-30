import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import './App.css';
import LogSymptom from './LogSymptom';
import LogFood from './LogFood';

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="home-dashboard">
      <div className="dashboard-top-bar">
        <div className="user-info">
          <span>{user ? user.displayName : ''}</span>
          <button className="logout-btn" onClick={handleSignOut}>Logout</button>
        </div>
      </div>
      
      <main className="main-content">
        <LogSymptom user={user} />
        <LogFood user={user} />
      </main>
    </div>
  );
}

export default Home;