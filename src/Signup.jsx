import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pet Log</h1>
      </header>
      <div className="auth-container">
        <div className="auth-box">
          <h2>Sign up</h2>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="input-group">
              <label>Your Pet's Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <button type="submit" className="auth-submit-btn">Sign up</button>
          </form>
          <p className="auth-footer">Already have an account? Log in <Link to="/login">here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;