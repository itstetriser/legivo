import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxWpU8TWBDdiDP7zZxKW2ovS1OBYddixA",
  authDomain: "legivo-1.firebaseapp.com",
  projectId: "legivo-1",
  storageBucket: "legivo-1.appspot.com",
  messagingSenderId: "733952528595",
  appId: "1:733952528595:web:99bd0efdd4874d3ea50426",
  measurementId: "G-X5NH69G6DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch all metadata from the "index" collection
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

// Function to display texts with pagination
function displayTexts(texts, page = 1) {
  const resultsContainer = document.getElementById("search-results-content");
  resultsContainer.innerHTML = "";

  if (texts.length === 0) {
    resultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  const itemsPerPage = 15;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTexts = texts.slice(startIndex, endIndex);

  paginatedTexts.forEach(text => {
    const card = document.createElement("div");
    card.classList.add("text-card");
    card.innerHTML = `
      <p class="card-title">${text.title}</p>
    `;

    card.addEventListener("click", () => {
      window.location.href = `../reading/reading.html?no=${text.no}`;
    });

    resultsContainer.appendChild(card);
  });

  addPaginationButtons(texts, page, itemsPerPage);
}

// Function to add pagination buttons
function addPaginationButtons(texts, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(texts.length / itemsPerPage);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.innerText = i;
    button.classList.add("pagination-button");
    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      displayTexts(texts, i);
    });

    paginationContainer.appendChild(button);
  }
}

// Function to filter and sort texts
async function applyFilters() {
  let texts = await fetchTextsMetadata();

  // Get selected level filters
  const selectedLevels = Array.from(document.querySelectorAll("input[name='level']:checked")).map(input => input.value);
  const selectedTopic = document.getElementById("topic-select").value;
  const sortBy = document.getElementById("sort-select").value;

  // Apply level filter
  if (selectedLevels.length > 0) {
    texts = texts.filter(text => selectedLevels.includes(text.level));
  }

  // Apply topic filter
  if (selectedTopic !== "all") {
    texts = texts.filter(text => text.category === selectedTopic);
  }

  // Apply sorting
  if (sortBy === "title") {
    texts.sort((a, b) => a.title.localeCompare(b.title)); // A-Z sorting
  } else if (sortBy === "level") {
    const levelOrder = { easy: 1, medium: 2, hard: 3 };
    texts.sort((a, b) => (levelOrder[a.level] || 4) - (levelOrder[b.level] || 4));
  } else if (sortBy === "date") {
    texts.sort((a, b) => b.no - a.no); // Newest first (descending no)
  }

  // Display filtered and sorted texts with pagination
  displayTexts(texts);
}

// Event listener for filter button
document.getElementById("filter-button").addEventListener("click", applyFilters);

// Load all texts on page load
window.onload = applyFilters;