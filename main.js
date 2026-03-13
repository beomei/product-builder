const generateBtn = document.getElementById('generate-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers');
const themeBtn = document.getElementById('theme-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const labelContainer = document.getElementById('label-container');
const loadingSpinner = document.getElementById('loading-spinner');

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
let model, maxPredictions;

async function loadModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        
        loadingSpinner.style.display = 'block';
        labelContainer.innerHTML = '';

        await loadModel();
        await predict();
        
        loadingSpinner.style.display = 'none';
    };
    reader.readAsDataURL(file);
});

async function predict() {
    const prediction = await model.predict(imagePreview);
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const predictionRow = document.createElement('div');
        predictionRow.classList.add('prediction-bar-container');
        predictionRow.innerHTML = `
            <div class="prediction-label">${className}</div>
            <div class="prediction-bar">
                <div class="prediction-fill" style="width: ${probability}%"></div>
            </div>
            <div class="prediction-percent">${probability}%</div>
        `;
        labelContainer.appendChild(predictionRow);
    }
}
