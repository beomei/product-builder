const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');
const themeBtn = document.getElementById('theme-btn');
const startTestBtn = document.getElementById('start-test-btn');

// --- Theme Toggle ---
themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
});

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

// --- Lotto Generator ---
generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    displayNumbers(numbers);
});

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayNumbers(numbers) {
    lottoNumbersContainer.innerHTML = '';
    numbers.forEach(number => {
        const ball = document.createElement('div');
        ball.classList.add('lotto-ball');
        ball.textContent = number;
        lottoNumbersContainer.appendChild(ball);
    });
}

// --- Animal Face Test (Teachable Machine) ---
const URL = "https://teachablemachine.withgoogle.com/models/8TCWpICyS/";
let model, webcam, labelContainer, maxPredictions;

async function init() {
    startTestBtn.style.display = 'none'; // Hide button after start
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load model
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup webcam
    const flip = true; 
    webcam = new tmImage.Webcam(300, 300, flip); // Increased size
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append to DOM
    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ''; // Clear previous
    for (let i = 0; i < maxPredictions; i++) {
        const div = document.createElement("div");
        div.classList.add("prediction-bar-container");
        labelContainer.appendChild(div);
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        labelContainer.childNodes[i].innerHTML = `
            <div class="prediction-label">${className}</div>
            <div class="prediction-bar">
                <div class="prediction-fill" style="width: ${probability}%"></div>
            </div>
            <div class="prediction-percent">${probability}%</div>
        `;
    }
}

startTestBtn.addEventListener('click', init);
