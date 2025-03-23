import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Selected words list
let selectedWords = [];

// Fetch all text metadata from "index/indexes"
async function fetchTextsMetadata() {
  const indexDocRef = doc(db, "index", "indexes");
  const indexDocSnap = await getDoc(indexDocRef);

  if (!indexDocSnap.exists()) {
    console.error("Index document not found!");
    return [];
  }

  const indexData = indexDocSnap.data();
  const textsMetadata = [];
  for (const [id, metadata] of Object.entries(indexData)) {
    textsMetadata.push({
      no: parseInt(id),
      title: metadata[0],
      category: metadata[1],
      level: metadata[2]
    });
  }
  return textsMetadata;
}

// Fetch full text content by "no" from "texts" collection
async function fetchTextContent(no) {
  const q = query(collection(db, "texts"), where("no", "==", no));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data().content;
  }
  return "Text content not found.";
}

// Display list of texts
async function displayTexts() {
  const texts = await fetchTextsMetadata();
  const textsList = document.getElementById("texts-list");
  textsList.innerHTML = "";

  texts.forEach(text => {
    const card = document.createElement("div");
    card.classList.add("text-card");
    card.innerText = text.title;

    card.addEventListener("click", async () => {
      const content = await fetchTextContent(text.no);
      displayTextContent(content);
    });

    textsList.appendChild(card);
  });
}

// Display text content with clickable words
function displayTextContent(content) {
  const contentDiv = document.getElementById("selected-text-content");
  contentDiv.innerHTML = "";

  const words = content.split(/\b/); // Split by word boundaries
  const processedContent = words.map(word => {
    const trimmedWord = word.trim();
    if (/^[a-zA-Z]+$/.test(trimmedWord)) { // Only make alphabetic words clickable
      return `<span class="clickable-word">${word}</span>`;
    }
    return word;
  }).join("");

  contentDiv.innerHTML = processedContent;

  // Add click event to each word
  const clickableWords = contentDiv.querySelectorAll(".clickable-word");
  clickableWords.forEach(wordElement => {
    wordElement.addEventListener("click", () => {
      const word = wordElement.innerText.trim();
      if (!selectedWords.includes(word)) {
        selectedWords.push(word);
        wordElement.classList.add("selected");
        updateSelectedWordsList();
      }
    });
  });
}

// Update the selected words list
function updateSelectedWordsList() {
  const wordsList = document.getElementById("words-list");
  wordsList.innerText = selectedWords.length > 0 ? " " + selectedWords.join(", ") + "," : "";
}

// Initialize page
window.onload = () => {
  displayTexts();
};