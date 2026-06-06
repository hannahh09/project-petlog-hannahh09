import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import './App.css';
import LogSymptom from './LogSymptom';
import LogFood from './LogFood';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload();
        setUser(auth.currentUser);
      } else {
        setUser(null);
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return <div className="auth-container"><p>Loading...</p></div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pet Log</h1>
        <div className="user-info">
          <span>{user ? user.displayName : ''}</span>
          <button className="logout-btn" onClick={handleSignOut}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        {user && <LogSymptom user={user} />}
        {user && <LogFood user={user} />}
      </main>
    </div>
  );
}

export default Home;