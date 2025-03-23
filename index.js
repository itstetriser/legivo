import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxWpU8TWBDdiDP7zZxKW2ovS1OBYddixA",
  authDomain: "legivo-1.firebaseapp.com",
  projectId: "legivo-1",
  storageBucket: "legivo-1.firebasestorage.app",
  messagingSenderId: "733952528595",
  appId: "1:733952528595:web:99bd0efdd4874d3ea50426",
  measurementId: "G-X5NH69G6DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const textCount = document.querySelector(".stat-text-number");
const wordCount = document.querySelector(".stat-word-number");

// Fetch text and word count
async function fetchStats() {
  try {
    const indexDoc = await getDoc(doc(db, "index", "indexes"));
    if (indexDoc.exists()) {
      const indexes = indexDoc.data();

      // Get number of texts
      const textsCount = Object.keys(indexes).length;
      textCount.textContent = textsCount;

      // Calculate total word count (sum of 4th elements in each array)
      let totalWords = 0;
      Object.values(indexes).forEach(arr => {
        if (Array.isArray(arr) && arr.length > 3 && typeof arr[3] === "number") {
          totalWords += arr[3];
        }
      });

      wordCount.textContent = totalWords;
    } else {
      console.error("Indexes document not found");
    }
  } catch (error) {
    console.error("Error fetching index document:", error);
  }
}

fetchStats();

const findTextsButton = document.getElementById("find-texts-button");
findTextsButton.addEventListener("click", () => {
  window.location.href = "search/search.html";
});
