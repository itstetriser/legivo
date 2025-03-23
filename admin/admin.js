// Import Firebase app and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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

// Add Text Function
const textForm = document.getElementById("text-form");
textForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const textId = document.getElementById("text-id").value.trim();
  const textContent = document.getElementById("text-content").value.trim();
  const textNo = document.getElementById("text-no").value.trim();

  if (textId === "") {
    alert("Please enter a text ID.");
    return;
  }

  if (textContent === "") {
    alert("Please enter text content.");
    return;
  }

  if (textNo === "") {
    alert("Please enter a text number.");
    return;
  }

  try {
    await setDoc(doc(db, "texts", textId), {
      no: parseInt(textNo),
      title: textId,
      content: textContent,
      questions: { multipleChoice: [], trueFalse: [] },
      words: []
    });
    alert("Text added successfully!");
    textForm.reset();
  } catch (error) {
    console.error("Error adding text:", error);
    alert("Failed to add the text. Please try again later.");
  }
});

// Add Multiple-Choice Questions Function
const mcForm = document.getElementById("mc-question-form");
mcForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const textId = document.getElementById("text-id-mc").value.trim();
  const mcQuestionsInput = document.getElementById("mc-questions-input").value.trim();

  if (textId === "" || mcQuestionsInput === "") {
    alert("Text ID and questions are required.");
    return;
  }

  const questionsArray = mcQuestionsInput.split(">>").map(q => q.trim()).filter(q => q !== "");
  const mcQuestions = questionsArray.map(question => {
    const [questionText, optionsStr, correctOption] = question.split("--");
    const options = optionsStr.split(":").map(opt => opt.trim()).filter(opt => opt !== "");
    
    // Ensure options are between 3 and 5
    if (options.length < 3 || options.length > 5) {
      throw new Error("Each question must have 3 to 5 options.");
    }

    const formattedOptions = options.map((opt, index) => ({
      text: opt,
      isCorrect: index === parseInt(correctOption)
    }));

    return {
      question: questionText.trim(),
      options: formattedOptions
    };
  });

  try {
    await updateDoc(doc(db, "texts", textId), {
      "questions.multipleChoice": arrayUnion(...mcQuestions)
    });
    alert("Multiple-choice questions added successfully!");
    mcForm.reset();
  } catch (error) {
    console.error("Error adding multiple-choice questions:", error);
    alert("Failed to add the questions. Ensure the format is correct and try again.");
  }
});

// Add True/False Questions Function
const tfForm = document.getElementById("tf-question-form");
tfForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const textId = document.getElementById("text-id-tf").value.trim();
  const tfQuestionsInput = document.getElementById("tf-questions-input").value.trim();

  if (textId === "" || tfQuestionsInput === "") {
    alert("Text ID and statements are required.");
    return;
  }

  const statementsArray = tfQuestionsInput.split(">>").map(s => s.trim()).filter(s => s !== "");
  const tfQuestions = statementsArray.map(statement => {
    const [statementText, answer] = statement.split("--");
    const isTrue = answer.trim().toLowerCase() === "true";
    
    return {
      statement: statementText.trim(),
      isTrue: isTrue
    };
  });

  try {
    await updateDoc(doc(db, "texts", textId), {
      "questions.trueFalse": arrayUnion(...tfQuestions)
    });
    alert("True/False questions added successfully!");
    tfForm.reset();
  } catch (error) {
    console.error("Error adding true/false questions:", error);
    alert("Failed to add the statements. Ensure the format is correct and try again.");
  }
});

// Add Words Function
const wordsForm = document.getElementById("words-form");
wordsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const textId = document.getElementById("text-id-words").value.trim();
  const wordsInput = document.getElementById("words-input").value.trim();

  if (textId === "" || wordsInput === "") {
    alert("Text ID and words are required.");
    return;
  }

  const wordsArray = wordsInput.split(">>").map(word => word.trim()).filter(word => word !== "");
  const words = wordsArray.map(word => {
    const [name, baseForm, definition, tos, synonyms, exampleSentence, questions] = word.split(":");
    return {
      name: name.trim(),
      baseForm: baseForm.trim(),
      definition: definition.trim(),
      tos: tos.trim(),
      synonyms: synonyms.trim(),
      exampleSentence: exampleSentence.trim(),
      questions: questions.split("&").map(q => q.trim())
    };
  });

  try {
    await updateDoc(doc(db, "texts", textId), {
      words: arrayUnion(...words)
    });
    alert("Words added successfully!");
    wordsForm.reset();
  } catch (error) {
    console.error("Error adding words:", error);
    alert("Failed to add the words. Please try again later.");
  }
});