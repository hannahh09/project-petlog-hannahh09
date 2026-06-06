import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

function LogSymptom({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [symptomType, setSymptomType] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [logWeather, setLogWeather] = useState(true);

  const symptomOptions = [
    'Itching/Scratching',
    'Red Skin',
    'Nasal Discharge'
  ];

  useEffect(() => {
    async function getSymptomsFromDb() {
      try {
        const q = query(collection(db, "symptoms"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        fetched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSymptoms(fetched);
      } catch (e) {
        console.error("Error fetching symptoms: ", e);
      }
      setLoading(false);
    }

    if (user) {
      getSymptomsFromDb();
    }
  }, [user]);

  function handleCheckbox(option) {
    if (symptomType.includes(option)) {
      setSymptomType(symptomType.filter((s) => s !== option));
    } else {
      setSymptomType(symptomType.concat([option]));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const allSelected = otherText.trim() !== ''
      ? symptomType.concat([otherText.trim()])
      : symptomType;

    if (allSelected.length === 0 || !user) return;

    const formattedDate = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    let currentTemp = "N/A";
    let currentHumidity = "N/A";

    if (logWeather) {
      try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=24.81&longitude=120.96&current=temperature_2m,relative_humidity_2m");
        const weatherData = await response.json();
        currentTemp = weatherData.current.temperature_2m + "°C";
        currentHumidity = weatherData.current.relative_humidity_2m + "%";
      } catch (apiError) {
        console.error("Weather fetch failed:", apiError);
      }
    }

    const symptomString = allSelected.join(', ');

    try {
      const docRef = await addDoc(collection(db, "symptoms"), {
        userId: user.uid,
        symptomType: symptomString,
        noteText: noteText,
        temperature: currentTemp,
        humidity: currentHumidity,
        timestamp: formattedDate
      });

      const newEntry = {
        id: docRef.id,
        userId: user.uid,
        symptomType: symptomString,
        noteText: noteText,
        temperature: currentTemp,
        humidity: currentHumidity,
        timestamp: formattedDate
      };

      setSymptoms([newEntry, ...symptoms]);
      setSymptomType([]);
      setOtherText('');
      setNoteText('');
      setLogWeather(true);
      setIsEditing(false);
    } catch (e) {
      console.error("Error adding symptom: ", e);
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return { datePart: '', timePart: '' };
    const parts = timestamp.split(', ');
    const timePart = parts[parts.length - 1];
    const datePart = parts.slice(0, parts.length - 1).join(', ');
    return { datePart, timePart };
  }

  return (
    <div className="log-column">
      <button className="main-log-btn" onClick={() => setIsEditing(true)}>
        Log Symptom
      </button>

      {isEditing && (
        <form className="modal-overlay" onSubmit={handleSubmit}>
          <button type="button" className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
          <h2>Log Symptom</h2>

          <div className="symptom-selection-box">
            <p className="checkbox-group-label">Select Symptoms</p>
            <div className="checkbox-group">
              {symptomOptions.map((option) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={symptomType.includes(option)}
                    onChange={() => handleCheckbox(option)}
                  />
                  {option}
                </label>
              ))}
              <div className="other-input-row">
                <span className="other-input-label">Other:</span>
                <input
                  type="text"
                  className="other-input"
                  placeholder="Describe symptom"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                />
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Optional Notes"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />

          <label className="weather-checkbox-label">
            <input
              type="checkbox"
              checked={logWeather}
              onChange={(e) => setLogWeather(e.target.checked)}
            />
            Log with Hsinchu, Taiwan weather
          </label>

          <button type="submit" className="form-submit-btn">Submit Log to Feed</button>
        </form>
      )}

      <div className="entries-box">
        <h3>Symptom Entries</h3>
        <div className="feed-list">
          {loading && <p className="empty-msg">Loading entries...</p>}
          {!loading && symptoms.length === 0 && (
            <p className="empty-msg">No symptom entries yet.</p>
          )}
          {symptoms.map((item) => {
            const { datePart, timePart } = formatTimestamp(item.timestamp);
            return (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-timestamp">
                    <span className="entry-date">{datePart}</span>
                    <span className="entry-time">{timePart}</span>
                  </div>
                </div>
                <p className="entry-main-text">{item.symptomType}</p>
                {item.noteText && (
                  <p className="entry-subtext">Notes: <em>{item.noteText}</em></p>
                )}
                {item.temperature !== "N/A" && item.humidity !== "N/A" && (
                  <div className="entry-weather-block">
                    <span>Hsinchu, Taiwan</span>
                    <span>Temp: {item.temperature} | Humidity: {item.humidity}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LogSymptom;