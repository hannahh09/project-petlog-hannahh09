import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'; 
import { db } from './firebase';

function LogSymptom({ user }) { 
  const [isEditing, setIsEditing] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  
  const [symptomType, setSymptomType] = useState('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    async function getSymptomsFromDb() {
      try {
        const q = query(collection(db, "symptoms"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        setSymptoms(fetched);
      } catch (e) {
        console.error("Error fetching symptoms: ", e);
      }
    }

    if (user) {
      getSymptomsFromDb();
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!symptomType || !user) return; 

    const formattedDate = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    let currentTemp = "N/A";
    let currentHumidity = "N/A";
    try {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=24.81&longitude=120.96&current=temperature_2m,relative_humidity_2m");
      const weatherData = await response.json();
      currentTemp = weatherData.current.temperature_2m + "°C";
      currentHumidity = weatherData.current.relative_humidity_2m + "%";
    } catch (apiError) {
      console.error("Weather fetch failed:", apiError);
    }

    try {
      const docRef = await addDoc(collection(db, "symptoms"), {
        userId: user.uid, 
        symptomType: symptomType,
        noteText: noteText,
        temperature: currentTemp, 
        humidity: currentHumidity, 
        timestamp: formattedDate
      });

      const newEntry = {
        id: docRef.id,
        userId: user.uid,
        symptomType: symptomType,
        noteText: noteText,
        temperature: currentTemp,
        humidity: currentHumidity,
        timestamp: formattedDate
      };

      setSymptoms(symptoms.concat([newEntry]));
      
      setSymptomType('');
      setNoteText('');
      setIsEditing(false); 
    } catch (e) {
      console.error("Error adding symptom: ", e);
    }
  }

  return (
    <div className="log-column">
      {/* If NOT editing, we still render the button behind the absolute form space */}
      <button className="main-log-btn" onClick={() => setIsEditing(true)}>
        Log Symptom
      </button>

      {/* If editing, render the absolute form OVER the feed */}
      {isEditing && (
        <form className="modal-overlay" onSubmit={handleSubmit}>
          {/* Native HTML entity for 'X' */}
          <button type="button" className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
          
          <h2>Log Symptom</h2>
          <select value={symptomType} onChange={(e) => setSymptomType(e.target.value)}>
            <option value="">Select Symptom (Dropdown)</option>
            <option value="Itching/Scratching">Itching/Scratching</option>
            <option value="Red Skin">Red Skin</option>
            <option value="Nasal Discharge">Nasal Discharge</option>
          </select>

          <input 
            type="text" 
            placeholder="Optional Notes (Text Input)" 
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />

          <button type="submit" className="form-submit-btn">Submit Log to Feed</button>
        </form>
      )}

      <div className="entries-box">
        <h3>Symptom Entries</h3>
        <div className="feed-list">
          {symptoms.map((item) => (
            <div key={item.id} className="entry-card">
              <div className="entry-header">
                <span className="entry-date">{item.timestamp}</span>
                {/* Weather moved to the top right of the card */}
                {(item.temperature && item.humidity) && (
                  <span className="entry-weather">Weather: {item.temperature}, {item.humidity}</span>
                )}
              </div>
              <p className="entry-main-text">{item.symptomType}</p>
              {item.noteText && <p className="entry-subtext">Notes: {item.noteText}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LogSymptom;