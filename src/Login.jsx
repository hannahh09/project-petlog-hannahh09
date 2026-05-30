import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  return (
    <div className="app-container">
      {/* The static header added to the top of the login page */}
      <header className="app-header">
        <h1>Shared Pet Log</h1>
      </header>

      <div className="auth-container">
        <div className="auth-box">
          <h2>Log in</h2>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="auth-submit-btn">Log in</button>
          </form>
          <p className="auth-footer">New user? Sign up <Link to="/signup">here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;