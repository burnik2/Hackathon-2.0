const API_URL = 'https://the-trivia-api.com/api/questions';
let players = [];
let currentCategory = '';
let questions = [];
let currentQuestionIndex = 0;
let scores = { player1: 0, player2: 0 };
let currentPlayer = 0;

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('select-category').addEventListener('click', fetchQuestions);
document.getElementById('submit-answer').addEventListener('click', submitAnswer);
document.getElementById('restart-game').addEventListener('click', restartGame);

async function startGame() {
    const player1Name = document.getElementById('player1-name').value;
    const player2Name = document.getElementById('player2-name').value;
    if (!player1Name || !player2Name) {
        alert("Please enter both player names.");
        return;
    }
    players = [{ name: player1Name, score: 0 }, { name: player2Name, score: 0 }];
    document.getElementById('player-setup').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
    await loadCategories();
}

async function loadCategories() {
    const response = await fetch(API_URL);
    const data = await response.json();
    const categories = [...new Set(data.map(q => q.category))]; 
    const dropdown = document.getElementById('category-dropdown');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

async function fetchQuestions() {
    try {
        const categoryDropdown = document.getElementById('category-dropdown');
        currentCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value.trim(); 
        // console.log(currentCategory);
        questions = [];
        const difficulties = ['easy', 'medium', 'hard'];

       
        for (let difficulty of difficulties) {
            const response = await fetch(`${API_URL}?category=${currentCategory}&difficulty=${difficulty}&limit=2`);

            // console.log(currentCategory);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();
            // console.log(data);

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format. Expected an array of questions.');
            }

            questions = questions.concat(data); 
            // console.log(questions);
        }


        if (questions.length > 0) {
            document.getElementById('category-selection').style.display = 'none';
            document.getElementById('question-container').style.display = 'block';
             currentQuestionIndex = 0; 
            displayQuestion();
        } else {
            alert('No questions found for the selected category and difficulties.');
        }
    } catch (error) {
        console.error('Error fetching questions:', error.message,error.stack);
    }
}

function displayQuestion() {
    // console.log("display");
    const question = questions[currentQuestionIndex];
    // console.log(questions);
    document.getElementById('question').textContent = question.question;
    document.getElementById('answer').value = '';
}

async function submitAnswer() {
    const answer = document.getElementById('answer').value.trim();
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    // console.log(correctAnswer);
    if (answer.toLowerCase() == correctAnswer.toLowerCase()) {
        scores[`player${currentPlayer + 1}`] += getScore(questions[currentQuestionIndex].difficulty);
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endGame();
    }
    currentPlayer = (currentPlayer + 1) % 2;
}

function getScore(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 10;
        case 'medium':
            return 15;
        case 'hard':
            return 20;
        default:
            return 0;
    }
}

function endGame() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'block';
    const winner = scores.player1 > scores.player2 ? 'Player 1' : 'Player 2';
    document.getElementById('winner').textContent = `The winner is ${winner}!`;
    document.getElementById('score-display').textContent = `Player 1: ${scores.player1} | Player 2: ${scores.player2}`;
    document.getElementById('end-game').style.display = 'block';
}

function restartGame() {
    location.reload();
}
