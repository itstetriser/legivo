import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

let highlightedWords = new Set();
let listedWords = new Set();
let wordDataMap = new Map();
let textDoc = null;

const MAX_WORDS = 10;

// Utility Functions
function updatePlaceholderVisibility() {
    const wordsInTextList = document.getElementById("words-in-text-list");
    const placeholder = document.getElementById("words-in-text-placeholder");
    placeholder.style.display = wordsInTextList.children.length === 0 ? "block" : "none";
}

function updateFloatingButton() {
    const floatingButton = document.getElementById("floating-word-list-button");
    floatingButton.textContent = `Word ${listedWords.size}`; // Fixed "Word" to "Words" for consistency
}

function saveSelectedWords() {
    const urlParams = new URLSearchParams(window.location.search);
    const no = urlParams.get("no");
    const listedWordsArray = [...listedWords];
    localStorage.setItem("selectedWordsData", JSON.stringify({
        textId: no,
        words: listedWordsArray
    }));
}

// Load Text and Questions
async function loadText() {
    const urlParams = new URLSearchParams(window.location.search);
    const no = urlParams.get("no");

    if (!no) {
        console.error("No text ID provided in the URL.");
        document.getElementById("text-content").innerText = "No text ID provided.";
        return;
    }

    try {
        const collectionRef = collection(db, "texts");
        const q = query(collectionRef, where("no", "==", parseInt(no)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            textDoc = querySnapshot.docs[0].data();
            console.log("Fetched questions:", textDoc.questions);

            document.title = textDoc.title;
            document.getElementById("text-title").innerText = textDoc.title;
            document.getElementById("text-content").innerHTML = textDoc.content;

            const wordsArray = textDoc.words || [];
            wordsArray.forEach((word) => {
                wordDataMap.set(word.name.toLowerCase(), {
                    baseform: word.baseForm, // Store baseform in wordDataMap
                    definition: word.definition,
                    questions: word.questions || [],
                });
            });

            setupWordInteractions();
            renderQuestions(textDoc.questions);
        } else {
            console.error("No document found with the specified ID.");
            document.getElementById("text-content").innerText = "Text not found.";
        }
    } catch (error) {
        console.error("Error fetching text:", error);
        document.getElementById("text-content").innerText = "An error occurred while loading the text.";
    }
}

// Render Questions
function renderQuestions(questions) {
    const mcContainer = document.getElementById("mc-questions");
    const tfContainer = document.getElementById("tf-questions");

    if (questions && questions.multipleChoice) {
        questions.multipleChoice.forEach((question, index) => {
            const optionsHtml = question.options
                .map((option, i) => `
                    <label class="mc-option">
                        <input type="radio" name="mc-${index}" value="${i}" />
                        ${option.text}
                    </label>
                `)
                .join("");
            mcContainer.innerHTML += `
                <div class="question">
                    <h4 class="question-text">${index + 1}. ${question.question}</h4>
                    <div class="mc-options">${optionsHtml}</div>
                </div>
            `;
        });
    } 

    if (questions && questions.trueFalse) {
        questions.trueFalse.forEach((question, index) => {
            tfContainer.innerHTML += `
                <div class="question">
                    <h4 class="question-text">${index + 1}. ${question.statement}</h4>
                    <div class="tf-options">
                        <label class="tf-option">
                            <input type="radio" name="tf-${index}" value="true" />
                            True
                        </label>
                        <label class="tf-option">
                            <input type="radio" name="tf-${index}" value="false" />
                            False
                        </label>
                    </div>
                </div>
            `;
        });
    } 
}

// Set Up Word Interactions
function setupWordInteractions() {
    const textContent = document.getElementById("text-content");
    const originalContent = textDoc.content;
    textContent.innerHTML = originalContent;

    const textWords = textContent.innerHTML.split(/\b/);
    const processedWords = textWords.map((word) => {
        const sanitizedWord = word.trim().toLowerCase();
        return wordDataMap.has(sanitizedWord) && !listedWords.has(sanitizedWord) ? `<span class="clickable-word">${word}</span>` : word;
    });
    textContent.innerHTML = processedWords.join("");

    const clickableWords = textContent.querySelectorAll(".clickable-word");
    clickableWords.forEach((wordElement) => {
        const newWordElement = wordElement.cloneNode(true);
        wordElement.parentNode.replaceChild(newWordElement, wordElement);

        const word = newWordElement.innerText.toLowerCase();
        newWordElement.addEventListener("mouseenter", () => {
            if (!listedWords.has(word)) newWordElement.classList.add("highlighted");
        });
        newWordElement.addEventListener("mouseleave", () => {
            newWordElement.classList.remove("highlighted");
        });
        newWordElement.addEventListener("click", () => handleWordClick(word, newWordElement));
    });
}

// Handle Word Click
function handleWordClick(word, wordElement) {
    const normalizedWord = word.trim().toLowerCase();

    console.log("Clicking word:", normalizedWord);
    console.log("Current listedWords:", [...listedWords]);
    console.log("localStorage:", localStorage.getItem("selectedWordsData"));

    if (listedWords.has(normalizedWord)) {
        alert(`The word "${word}" is already in the list.`);
        return;
    }

    if (listedWords.size >= MAX_WORDS) {
        alert(`You cannot add more than ${MAX_WORDS} words. You can delete some or reset list.`);
        return;
    }

    const wordData = wordDataMap.get(normalizedWord);
    const baseform = wordData?.baseform || normalizedWord; // Fallback to normalizedWord if baseform missing
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${baseform}</strong>: ${wordData?.definition || "No definition available"}`;

    listedWords.add(normalizedWord); // Still add the clicked form to track uniqueness
    saveSelectedWords();

    const textContent = document.getElementById("text-content");
    const clickableWords = textContent.querySelectorAll(".clickable-word");
    clickableWords.forEach((element) => {
        if (element.innerText.trim().toLowerCase() === normalizedWord) {
            element.outerHTML = element.innerText;
        }
    });

    listItem.addEventListener("click", () => {
        listItem.remove();
        listedWords.delete(normalizedWord);
        saveSelectedWords();
        updatePlaceholderVisibility();
        updateFloatingButton();
        setupWordInteractions();
    });

    document.getElementById("words-in-text-list").appendChild(listItem);
    updatePlaceholderVisibility();
    updateFloatingButton();
}

// Check Answers
function checkAnswers(questions) {
    let correctCount = 0;
    let totalQuestions = 0;

    if (questions && questions.multipleChoice) {
        questions.multipleChoice.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="mc-${index}"]:checked`);
            const questionElement = document.querySelectorAll('#mc-questions .question')[index];
            if (!questionElement) return;

            const options = questionElement.querySelectorAll('.mc-option');
            if (options.length === 0) return;

            totalQuestions++;
            const correctAnswerIndex = question.options.findIndex(option => option.isCorrect);

            options.forEach((option, i) => {
                option.classList.remove('correct', 'incorrect');
                if (i === correctAnswerIndex) option.classList.add('correct');
            });

            if (selectedOption) {
                const selectedValue = parseInt(selectedOption.value);
                if (selectedValue !== correctAnswerIndex) {
                    options[selectedValue].classList.add('incorrect');
                } else {
                    correctCount++;
                }
            }
        });
    }

    if (questions && questions.trueFalse) {
        const tfElements = document.querySelectorAll('#tf-questions .question');
        questions.trueFalse.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="tf-${index}"]:checked`);
            const questionElement = tfElements[index];

            totalQuestions++;
            if (!questionElement) return;

            const options = questionElement.querySelectorAll('.tf-option');
            if (options.length !== 2) return;

            const correctAnswer = question.isTrue;
            options.forEach((option, i) => {
                option.classList.remove('correct', 'incorrect');
                if ((i === 0 && correctAnswer) || (i === 1 && !correctAnswer)) {
                    option.classList.add('correct');
                }
            });

            if (selectedOption) {
                const selectedValue = selectedOption.value === "true";
                if (selectedValue !== correctAnswer) {
                    options[selectedValue ? 0 : 1].classList.add('incorrect');
                } else {
                    correctCount++;
                }
            }
        });
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.textContent = totalQuestions > 0 ? `You got ${correctCount} out of ${totalQuestions} correct!` : "No questions available to check.";
}

// Load Stored Words
function loadStoredWords() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentTextId = urlParams.get("no");
    const storedData = JSON.parse(localStorage.getItem("selectedWordsData")) || {};

    if (storedData.textId !== currentTextId) {
        localStorage.removeItem("selectedWordsData");
        listedWords.clear();
        updatePlaceholderVisibility();
        return;
    }

    const storedWords = storedData.words || [];
    const wordsContainer = document.getElementById("words-in-text-list");
    wordsContainer.innerHTML = "";

    storedWords.forEach((word) => {
        const wordData = wordDataMap.get(word);
        const baseform = wordData?.baseform || word; // Use baseform if available
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${baseform}</strong>: ${wordData?.definition || "No definition available"}`;
        listItem.addEventListener("click", () => {
            listItem.remove();
            listedWords.delete(word);
            saveSelectedWords();
            updatePlaceholderVisibility();
            updateFloatingButton();
            setupWordInteractions();
        });
        wordsContainer.appendChild(listItem);
        listedWords.add(word);
    });

    updatePlaceholderVisibility();
    updateFloatingButton();
}

// Initialize Application
async function initialize() {
    await loadText();
    loadStoredWords();

    document.getElementById("check-answers-button").addEventListener("click", () => {
        if (textDoc && textDoc.questions) {
            checkAnswers(textDoc.questions);
        } else {
            console.error("No questions available to check.");
            document.getElementById("results").textContent = "No questions loaded.";
        }
    });

    document.getElementById("start-vocab-test-button").addEventListener("click", () => {
        saveSelectedWords();
        const urlParams = new URLSearchParams(window.location.search);
        const no = urlParams.get("no");
        window.location.href = `/voctest/voctest.html?no=${no}`;
    });

    document.getElementById("reset-list-button").addEventListener("click", () => {
        console.log("Resetting list...");
        localStorage.removeItem("selectedWordsData");
        listedWords.clear();
        document.getElementById("words-in-text-list").innerHTML = "";
        updatePlaceholderVisibility();
        updateFloatingButton();
        setupWordInteractions();
        console.log("After reset - listedWords:", [...listedWords], "localStorage:", localStorage.getItem("selectedWordsData"));
    });

    const floatingButton = document.getElementById("floating-word-list-button");
    const wordsInText = document.getElementById("words-in-text");

    const toggleWordsInText = () => {
        if (window.innerWidth <= 768) {
            wordsInText.style.display = wordsInText.style.display === "none" ? "block" : "none";
        }
    };

    floatingButton.addEventListener("click", toggleWordsInText);
    window.addEventListener("resize", () => {
        wordsInText.style.display = window.innerWidth > 768 ? "flex" : "none";
    });
}

document.addEventListener("DOMContentLoaded", initialize);