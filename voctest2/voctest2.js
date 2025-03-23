import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxWpU8TWBDdiDP7zZxKW2ovS1OBYddixA",
  authDomain: "legivo-1.firebaseapp.com",
  projectId: "legivo-1",
  storageBucket: "legivo-1.appspot.com",
  messagingSenderId: "733952528595",
  appId: "1:733952528595:web:99bd0efdd4874d3ea50426"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


window.onload = async () => {
   for (const word of words) {
      const wordQuery = query(collection(db, "words"), where("name", "==", word));
      const querySnapshot = await getDocs(wordQuery);

      if (!querySnapshot.empty) {
        const wordData = querySnapshot.docs[0].data();
        const synonyms = wordData.synonyms ? wordData.synonyms : "";  // Don't split synonyms
        wordDataMap.set(word, synonyms);  // Store the full synonym string
      } else {
        console.log(`No data found for the word: ${word}`);
      }
    }
  console.log(selectedWords)



  // Get container elements for both sections
  const partAContainer = document.getElementById("part-a");
  const partBContainer = document.getElementById("part-b");

  selectedWords.forEach(word => {
    const wordData = wordDataMap.get(word);
    if (wordData) {
      // Create the word boxes for Part A and Part B
      const synonymBox = document.createElement("li");
      synonymBox.classList.add("synonym", "draggable");
      synonymBox.setAttribute("draggable", "true");
      synonymBox.textContent = wordData;  // Display full synonym string
      synonymBox.addEventListener("dragstart", dragStart);
      synonymBox.addEventListener("dragend", dragEnd);
      
      partAContainer.appendChild(synonymBox);
      partBContainer.appendChild(synonymBox.cloneNode(true)); // Duplicate for Part B
    }
  });

  // Fetch the first and second sentence questions
  const firstWordData = wordDataMap.get(selectedWords[0]);
  const firstSentence = firstWordData ? firstWordData.questions[0] : "";
  const secondSentence = firstWordData ? firstWordData.questions[1] : "";

  // Add the sentences to Part A and Part B with blanks
  const sentenceA = createSentenceWithBlank(firstSentence, selectedWords[0]);
  const sentenceB = createSentenceWithBlank(secondSentence, selectedWords[0]);

  partAContainer.innerHTML += `<div class="sentence">${sentenceA}</div>`;
  partBContainer.innerHTML += `<div class="sentence">${sentenceB}</div>`;

  // Handle drag-and-drop events for the words
  function dragStart(e) {
    e.dataTransfer.setData("text", e.target.textContent.trim());
    e.target.style.backgroundColor = "orange"; // Reset background color
  }

  function dragEnd(e) {
    e.target.style.removeProperty("background-color");
  }

  // Function to create a sentence with a blank
  function createSentenceWithBlank(sentence, word) {
    const blankPlaceholder = "______";
    const sentenceParts = sentence.split(word); // Split sentence around the word
    return sentenceParts.join(blankPlaceholder); // Replace the word with the blank
  }

  // Handle dragging and dropping into blanks in the sentences
  partAContainer.querySelectorAll(".sentence").forEach(sentence => {
    sentence.addEventListener("dragover", dragOver);
    sentence.addEventListener("dragenter", dragEnter);
    sentence.addEventListener("dragleave", dragLeave);
    sentence.addEventListener("drop", drop);
  });

  partBContainer.querySelectorAll(".sentence").forEach(sentence => {
    sentence.addEventListener("dragover", dragOver);
    sentence.addEventListener("dragenter", dragEnter);
    sentence.addEventListener("dragleave", dragLeave);
    sentence.addEventListener("drop", drop);
  });

  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.target.classList.add("drag-over");
  }

  function dragLeave(e) {
    e.target.classList.remove("drag-over");
  }

  function drop(e) {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text");
    const sentence = e.target;

    if (sentence.classList.contains("sentence")) {
      // Replace the blank with the dropped word
      sentence.textContent = sentence.textContent.replace("______", droppedWord);
      sentence.classList.remove("drag-over");
    }
  }

  // Add a "Check Answers" button
  const checkButton = document.createElement("button");
  checkButton.textContent = "Check Answers";
  checkButton.addEventListener("click", checkAnswers);
  document.body.appendChild(checkButton);

  // Function to check answers and mark correct/incorrect
  function checkAnswers() {
    let correctCount = 0;
    let incorrectCount = 0;

    // Check Part A sentence
    const partASentence = partAContainer.querySelector(".sentence");
    if (partASentence.textContent.includes(selectedWords[0])) {
      correctCount++;
      partASentence.style.backgroundColor = "#d3ffd3"; // Green for correct
    } else {
      incorrectCount++;
      partASentence.style.backgroundColor = "#ffdddd"; // Red for incorrect
    }

    // Check Part B sentence
    const partBSentence = partBContainer.querySelector(".sentence");
    if (partBSentence.textContent.includes(selectedWords[0])) {
      correctCount++;
      partBSentence.style.backgroundColor = "#d3ffd3"; // Green for correct
    } else {
      incorrectCount++;
      partBSentence.style.backgroundColor = "#ffdddd"; // Red for incorrect
    }

    alert(`You got ${correctCount} out of 2 correct!`);
  }
};

