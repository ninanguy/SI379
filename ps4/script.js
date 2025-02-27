const BASE_URL = "https://the-trivia-api.com/api/questions?amount=10&type=multiple";
let currentQuestionIndex = 0;
let score = 0;
let attempts = 0;
let questions = [];
let timerInterval;
let difficulty = "easy"; // easy difficulty
let correctStreak = 0;
let wrongCount = 0;

// runs when page is filly loaded
document.addEventListener("DOMContentLoaded", async () => {
  questions = await fetchTriviaQuestions(); // fetches the questions b4 starting
  startGame();
});

// fetch trivia questions from api based on current difficulty
const fetchTriviaQuestions = async() => { // makes function async
  const url = `${BASE_URL}&difficulty=${difficulty}`;  // adjust api request based on difficulty

  try {
    const response = await fetch(url);
    if(!response.ok) {
      console.error(`Error: ${response.status}`);
      return []; // returns empty array so game doesn't break
    }

    return await response.json();
  } catch(error) {
    console.error("Error fetching trivia questions :", error);
    return []; // again so game doesn't crash
  }
};

// function to shuffle an array (randomizes answer choices)
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

// resets state an displays first q
const startGame = () => {
  document.getElementById("quiz-container").innerHTML = ""; // clears prev qs
  currentQuestionIndex = 0;    score = 0;
  attempts = 0;
  correctStreak = 0;
  wrongCount = 0;
  updateScore();
  showQuestion(); // Display the first question
};

// displays the current question
const showQuestion = () => {
  if (currentQuestionIndex >= questions.length) {
    document.getElementById("quiz-container").innerHTML = `<p>Game Over Final Score ${score}/${attempts}</p>`
    return;
  }
  // gets the current question
  const questionData = questions[currentQuestionIndex];
  const questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  questionDiv.innerHTML = `<p>${questionData.question}</p>`; // displays question text

  const answers = shuffleArray([...questionData.incorrectAnswers, questionData.correctAnswer]); // shuffle answers

  // loop thru answers + create radio buttons
  for (const answer of answers) {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `question-${currentQuestionIndex}`; // group by question
    radio.value = answer;

    label.appendChild(radio);
    label.appendChild(document.createTextNode(answer));
    questionDiv.appendChild(label);
    questionDiv.appendChild(document.createElement("br"));
  }

  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit Answer";
  submitButton.addEventListener("click", () => checkAnswer(questionDiv, questionData.correctAnswer));
  questionDiv.appendChild(submitButton);

  // replace quiz container w new q
  document.getElementById("quiz-container").innerHTML = "";
  document.getElementById("quiz-container").appendChild(questionDiv);

  startTimer(30); // starts 30 sec timer for this question
};

// checks the selected answers + updates game state
const checkAnswer = (questionDiv, correctAnswer) => {
  clearInterval(timerInterval);
  const selectedOption = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`);
  if (!selectedOption) return alert("pick an answer pls :)"); // alerts user to answer
  const userAnswer = selectedOption.value;
  const allOptions = questionDiv.querySelectorAll("input");

  for (const option of allOptions) {
    option.disabled = true; // disables changing answer after selecting
    if (option.value === correctAnswer) {
        option.parentElement.classList.add("correct");
    } else if (option.value === userAnswer) {
        option.parentElement.classList.add("incorrect");
    }
  }
  if (userAnswer === correctAnswer) {
    score++;
    correctStreak++;
    wrongCount = 0; //reset wrong streak on correct answer
  } else {
      correctStreak = 0; // reset streak on wrong answer
      wrongCount++;
  }

    attempts++;
    adjustDifficulty();
    updateScore();
    clearInterval(timerInterval); // stop timer

    // move to next question after 1.5 sec
    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 1500);
};

const updateScore = () => {
  document.getElementById("score").innerText = `Score: ${score}/${attempts} | Streak: ${correctStreak}`;
};

const adjustDifficulty = async () => {
  let newDifficulty = difficulty;
  if (correctStreak >= 6) {
    newDifficulty = "hard";
  } else if (correctStreak >= 3) {
    newDifficulty = "medium";
  } else if (wrongCount >= 3) {
    newDifficulty = "easy";
  }
  // fetches new qs when difficulty changes
  if(newDifficulty !== difficulty) {
    difficulty = newDifficulty;
    const prevIndex = currentQuestionIndex;
    questions = []; // clear old qs b4 fetching new ones 
    questions = await fetchTriviaQuestions(); // fetch new set of qs
    currentQuestionIndex = Math.min(prevIndex, questions.length-1); // don't reset to 0
  }
};

const startTimer = (duration) => {
  clearInterval(timerInterval);
  let timeLeft = duration;
  const timerDisplay = document.getElementById("timer");
  timerDisplay.innerText = `Time:${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time:${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up, moving on to next question");
      currentQuestionIndex++;
      showQuestion();
    }
  }, 1000);
  
};