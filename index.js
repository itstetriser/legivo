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

// Modern number counter animation
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// Intersection Observer for scroll animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      
      // Animate counters when stats section comes into view
      if (entry.target.id === 'hero-stats') {
        const textCountElement = entry.target.querySelector('.stat-text-number');
        const wordCountElement = entry.target.querySelector('.stat-word-number');
        
        if (textCountElement && wordCountElement) {
          setTimeout(() => animateCounter(textCountElement, parseInt(textCountElement.textContent)), 300);
          setTimeout(() => animateCounter(wordCountElement, parseInt(wordCountElement.textContent)), 600);
        }
      }
    }
  });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('#hero-stats, .selected-text, #call-to-action-content');
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
});

// Fetch text and word count with error handling and loading states
async function fetchStats() {
  try {
    // Show loading state
    if (textCount) textCount.textContent = '...';
    if (wordCount) wordCount.textContent = '...';
    
    const indexDoc = await getDoc(doc(db, "index", "indexes"));
    if (indexDoc.exists()) {
      const indexes = indexDoc.data();

      // Get number of texts
      const textsCount = Object.keys(indexes).length;
      if (textCount) textCount.textContent = textsCount;

      // Calculate total word count (sum of 4th elements in each array)
      let totalWords = 0;
      Object.values(indexes).forEach(arr => {
        if (Array.isArray(arr) && arr.length > 3 && typeof arr[3] === "number") {
          totalWords += arr[3];
        }
      });

      if (wordCount) wordCount.textContent = totalWords;
    } else {
      console.error("Indexes document not found");
      // Fallback to static values
      if (textCount) textCount.textContent = '8';
      if (wordCount) wordCount.textContent = '150';
    }
  } catch (error) {
    console.error("Error fetching index document:", error);
    // Fallback to static values
    if (textCount) textCount.textContent = '8';
    if (wordCount) wordCount.textContent = '150';
  }
}

// Enhanced button functionality with modern feedback
const findTextsButtons = document.querySelectorAll("#find-texts-button");
findTextsButtons.forEach(button => {
  button.addEventListener("click", (e) => {
    // Add ripple effect
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Add loading state
    button.classList.add('loading');
    button.textContent = 'Loading...';
    
    // Navigate after brief delay for UX
    setTimeout(() => {
      window.location.href = "search/search.html";
    }, 500);
  });
});

// Smooth scroll behavior for internal links
document.addEventListener('DOMContentLoaded', () => {
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Initialize stats fetching
fetchStats();

// Add CSS for animations and ripple effect
const style = document.createElement('style');
style.textContent = `
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .selected-text:nth-child(1) { transition-delay: 0.1s; }
  .selected-text:nth-child(2) { transition-delay: 0.2s; }
  .selected-text:nth-child(3) { transition-delay: 0.3s; }
  .selected-text:nth-child(4) { transition-delay: 0.4s; }
  .selected-text:nth-child(5) { transition-delay: 0.5s; }
  .selected-text:nth-child(6) { transition-delay: 0.6s; }
  
  .ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  #find-texts-button {
    position: relative;
    overflow: hidden;
  }
  
  #find-texts-button.loading {
    pointer-events: none;
    opacity: 0.8;
  }
  
  /* Performance optimization */
  .selected-text {
    will-change: transform;
  }
  
  .word {
    will-change: opacity, transform;
  }
`;

document.head.appendChild(style);
