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

// Function to fetch word data from specific text document
async function fetchWordData(words) {
    const wordDataMap = new Map();
    
    const selectedWordsData = JSON.parse(localStorage.getItem("selectedWordsData"));
    const textId = selectedWordsData?.textId;
    
    if (!textId) {
        console.error("No text ID found in localStorage");
        return wordDataMap;
    }

    try {
        const textsQuery = query(collection(db, "texts"), where("no", "==", parseInt(textId)));
        const querySnapshot = await getDocs(textsQuery);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            
            if (data.words && Array.isArray(data.words)) {
                data.words.forEach(wordObj => {
                    if (words.includes(wordObj.name)) {
                        const synonymsArray = wordObj.synonyms.split(", ").map(syn => syn.trim()); // Split and trim for bare forms
                        
                        wordDataMap.set(wordObj.name, {
                            name: wordObj.name,
                            baseForm: wordObj.baseForm,
                            synonyms: synonymsArray, // Array of bare forms
                            questions: wordObj.questions || [],
                            definition: wordObj.definition,
                            tos: wordObj.tos
                        });
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }

    return wordDataMap;
}

// Utility function to shuffle an array
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialize Synonym Matching
async function initializeSynonymMatching(words) {
    const wordDataMap = await fetchWordData(words);
    const wordListContainer = document.getElementById("word-list");
    
    wordListContainer.innerHTML = '';
    
    const synonyms = [];
    wordDataMap.forEach(data => {
        synonyms.push({ 
            word: data.name, 
            synonym: data.synonyms.join(", "), // Join bare forms for dropdown comparison
            baseForm: data.baseForm,
            tos: data.tos,
            synonymArray: data.synonyms // Keep array for display
        });
    });

    const allSynonyms = synonyms.map(s => s.synonym);

    synonyms.forEach(({ word, synonym, tos, synonymArray }) => {
        const wordItem = document.createElement("li");
        wordItem.classList.add("word");

        const select = document.createElement("select");
        select.classList.add("word-dropdown");
        select.dataset.correctWord = synonym;
        select.innerHTML = `<option value="">---</option>`;

        const shuffledSynonyms = shuffle([...allSynonyms]);
        shuffledSynonyms.forEach(synonymStr => {
            const option = document.createElement("option");
            option.value = synonymStr;
            option.textContent = synonymStr;
            select.appendChild(option);
        });

        // Display word with bare form synonyms and part of speech
        wordItem.innerHTML = `<span>${word} <span style="font-size: 0.8em; color: #666;">(${tos})</span></span>`;
        wordItem.appendChild(select);
        wordListContainer.appendChild(wordItem);
    });
}

// Check synonyms
async function checkSynonyms() {
    const wordListContainer = document.getElementById("word-list");

    wordListContainer.querySelectorAll(".word").forEach(wordItem => {
        const select = wordItem.querySelector("select");
        const selectedSynonym = select.value;
        const correctSynonyms = select.dataset.correctWord;

        select.classList.remove("correct", "incorrect", "unselected");

        if (selectedSynonym) {
            if (selectedSynonym === correctSynonyms) {
                select.classList.add("correct");
            } else {
                select.classList.add("incorrect");
            }
        } else {
            select.classList.add("unselected");
        }
    });
}

// Initialize Sentence Completion
async function initializeSentenceCompletion(words) {
    const wordDataMap = await fetchWordData(words);
    const availableWords = Array.from(wordDataMap.values()).map(data => data.baseForm); // Use bare forms

    const initializePart = (part, sentenceArray) => {
        const container = document.getElementById(`sentences-${part}`);
        const wordsDiv = document.getElementById(`available-words-${part}`);

        if (!container || !wordsDiv) {
            console.error(`Required container not found for part ${part}`);
            return;
        }

        container.innerHTML = '';
        wordsDiv.innerHTML = '';

        const shuffledSentences = shuffle(sentenceArray);
        
        shuffledSentences.forEach((item, index) => {
            const sentenceElement = document.createElement('p');
            const selectElement = document.createElement('select');
            selectElement.classList.add('word-dropdown');
            selectElement.dataset.correctWord = item.baseForm; // Correct answer is bare form
            selectElement.innerHTML = `<option value="">---</option>`;

            availableWords.forEach(word => {
                const option = document.createElement('option');
                option.value = word;
                option.textContent = word;
                selectElement.appendChild(option);
            });

            const sentenceText = item.sentence;
            const wordBaseForm = item.baseForm; // Use bare form
            const wordIndex = sentenceText.indexOf(wordBaseForm);

            if (wordIndex !== -1) {
                const textBefore = sentenceText.substring(0, wordIndex);
                const textAfter = sentenceText.substring(wordIndex + wordBaseForm.length);

                sentenceElement.appendChild(document.createTextNode(`${index + 1}. ${textBefore}`));
                sentenceElement.appendChild(selectElement);
                sentenceElement.appendChild(document.createTextNode(textAfter));
            } else {
                console.error(`Bare form "${wordBaseForm}" not found in sentence: ${item.sentence}`);
            }

            container.appendChild(sentenceElement);
        });
    };

    const questionsA = [];
    const questionsB = [];

    wordDataMap.forEach((wordData, wordName) => {
        if (Array.isArray(wordData.questions)) {
            if (wordData.questions[0]) {
                questionsA.push({
                    sentence: wordData.questions[0],
                    word: wordData.name,
                    baseForm: wordData.baseForm // Include bare form
                });
            }
            
            if (wordData.questions[1]) {
                questionsB.push({
                    sentence: wordData.questions[1],
                    word: wordData.name,
                    baseForm: wordData.baseForm
                });
            } else if (wordData.questions[0]) {
                questionsB.push({
                    sentence: wordData.questions[0],
                    word: wordData.name,
                    baseForm: wordData.baseForm
                });
            }
        }
    });

    initializePart("A", questionsA);
    initializePart("B", questionsB);
}

// Check sentences
function checkSentences(part) {
    const container = document.getElementById(`sentences-${part}`);
    const sentences = container.querySelectorAll('p');

    sentences.forEach(sentence => {
        const select = sentence.querySelector('select');
        const correctWord = select.dataset.correctWord; // Bare form
        const selectedWord = select.value;

        select.classList.remove("correct", "incorrect", "unselected");

        if (selectedWord) {
            if (selectedWord === correctWord) {
                select.classList.add("correct");
            } else {
                select.classList.add("incorrect");
            }
        } else {
            select.classList.add("unselected");
        }
    });
}

// Initialize the application
async function initialize() {
    const selectedWordsData = JSON.parse(localStorage.getItem("selectedWordsData"));
    const selectedWords = selectedWordsData?.words || [];
    console.log("Selected words from localStorage:", selectedWords);
    
    if (selectedWords.length === 0) {
        console.error("No words selected. Please select words first.");
        return;
    }

    await initializeSynonymMatching(selectedWords);
    await initializeSentenceCompletion(selectedWords);

    document.getElementById('check-sentences-A-button').addEventListener('click', () => checkSentences('A'));
    document.getElementById('check-sentences-B-button').addEventListener('click', () => checkSentences('B'));
    document.getElementById('check-synonyms-button').addEventListener('click', checkSynonyms);
}

document.addEventListener("DOMContentLoaded", initialize);