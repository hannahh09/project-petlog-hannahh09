import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

function LogFood({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [foodItem, setFoodItem] = useState('');
  const [pawScale, setPawScale] = useState('');

  useEffect(() => {
    async function getFoodFromDb() {
      try {
        const q = query(collection(db, "food"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        fetched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setFoodEntries(fetched);
      } catch (e) {
        console.error("Error fetching food: ", e);
      }
      setLoading(false);
    }

    if (user) {
      getFoodFromDb();
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!foodItem || !pawScale || !user) return;

    const formattedDate = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    try {
      const docRef = await addDoc(collection(db, "food"), {
        userId: user.uid,
        foodItem: foodItem,
        pawScale: pawScale,
        timestamp: formattedDate
      });

      const newEntry = {
        id: docRef.id,
        userId: user.uid,
        foodItem: foodItem,
        pawScale: pawScale,
        timestamp: formattedDate
      };

      setFoodEntries([newEntry, ...foodEntries]);
      setFoodItem('');
      setPawScale('');
      setIsEditing(false);
    } catch (e) {
      console.error("Error logging food: ", e);
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
        Log Food
      </button>

      {isEditing && (
        <form className="modal-overlay" onSubmit={handleSubmit}>
          <button type="button" className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
          <h2>Log Food</h2>
          <input
            type="text"
            placeholder="Food Item Description (e.g. Sponge Cake)"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Paw Scale Amount (e.g. 1.5)"
            value={pawScale}
            onChange={(e) => setPawScale(e.target.value)}
          />
          <button type="submit" className="form-submit-btn">Submit Log to Feed</button>
        </form>
      )}

      <div className="entries-box">
        <h3>Food Intake Entries</h3>
        <div className="feed-list">
          {loading && <p className="empty-msg">Loading entries...</p>}
          {!loading && foodEntries.length === 0 && (
            <p className="empty-msg">No food entries yet.</p>
          )}
          {foodEntries.map((item) => {
            const { datePart, timePart } = formatTimestamp(item.timestamp);
            return (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-timestamp">
                    <span className="entry-date">{datePart}</span>
                    <span className="entry-time">{timePart}</span>
                  </div>
                </div>
                <p className="entry-main-text">{item.foodItem}</p>
                <p className="entry-subtext-paw">
                  Scale Amount: {item.pawScale} {parseFloat(item.pawScale) <= 1 ? 'Paw' : 'Paws'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LogFood;