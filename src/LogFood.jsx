import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'; 
import { db } from './firebase';

function LogFood({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);

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
        setFoodEntries(fetched);
      } catch (e) {
        console.error("Error fetching food: ", e);
      }
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

      setFoodEntries(foodEntries.concat([newEntry]));
      
      setFoodItem('');
      setPawScale('');
      setIsEditing(false); 
    } catch (e) {
      console.error("Error logging food: ", e);
    }
  }

  return (
    <div className="log-column">
      <button className="main-log-btn" onClick={() => setIsEditing(true)}>
        Log Food
      </button>
      
      {isEditing && (
        <form className="modal-overlay" onSubmit={handleSubmit}>
          {/* Native HTML entity for 'X' */}
          <button type="button" className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
          
          <h2>Log Food</h2>
          <input 
            type="text" 
            placeholder="Food Item Description (e.g. Sponge Cake)" 
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
          />

          <select value={pawScale} onChange={(e) => setPawScale(e.target.value)}>
            <option value="">Paw Scale Amount (Dropdown)</option>
            <option value="Half a Paw">Half a Paw</option>
            <option value="One Full Paw">One Full Paw</option>
            <option value="Two Paws">Two Paws</option>
          </select>

          <button type="submit" className="form-submit-btn">Submit Log to Feed</button>
        </form>
      )}

      <div className="entries-box">
        <h3>Food Intake Entries</h3>
        <div className="feed-list">
          {foodEntries.map((item) => (
            <div key={item.id} className="entry-card">
              <div className="entry-header">
                <span className="entry-date">{item.timestamp}</span>
                {/* No user name or pet name displayed here anymore */}
              </div>
              <p className="entry-main-text">{item.foodItem}</p>
              <p className="entry-subtext-paw">Scale: <em>{item.pawScale}</em></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LogFood;