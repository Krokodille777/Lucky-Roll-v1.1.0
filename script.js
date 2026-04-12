// script.js
const canvas = document.getElementById("circle");
const context = canvas.getContext("2d");
let isSpinning = false;
let currentRotationDeg = 0;
let accumulatedRotationDeg = 0;

if (!canvas.width || !canvas.height) {
  canvas.width = 400;
  canvas.height = 400;
}
// Draw pointer triangle
const triangle = document.getElementById("MyCanvas");
const ctx = triangle.getContext("2d");
triangle.width = 120;
triangle.height = 120;

ctx.fillStyle = "red";

ctx.beginPath();
ctx.moveTo(triangle.width / 2, triangle.height); // Point at bottom
ctx.lineTo(0, 0); // Top left
ctx.lineTo(triangle.width, 0); // Top right
ctx.closePath();
ctx.fill();



// Data structure for segments
const segments = [];
const segment_colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];



// Draw a segment of the wheel
function drawSegment(ctx, centerX, centerY, radius, index, total, color, label) {
  const startAngle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const endAngle = ((index + 1) / total) * Math.PI * 2 - Math.PI / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();



  // Draw label
  const midAngle = (startAngle + endAngle) / 2;
  const textX = centerX + (radius * 0.6) * Math.cos(midAngle);
  const textY = centerY + (radius * 0.6) * Math.sin(midAngle);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, textX, textY);
}


// Перерисовка колеса, чтобы отразить изменения в сегментах
function redrawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;



// Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  if (segments.length === 0) return;

  context.save();
  context.translate(centerX, centerY);
  context.rotate((accumulatedRotationDeg * Math.PI) / 180);
  context.translate(-centerX, -centerY);

  for (let i = 0; i < segments.length; i++) {
    const color = segment_colors[i % segment_colors.length];
    drawSegment(context, centerX, centerY, radius, i, segments.length, color, segments[i].label);
  }

  context.restore();
}

// Add Segment. 
const addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", function () {
  
  const newSegment = {
    label: `Segment ${segments.length + 1}`
  };
  segments.push(newSegment);
  redrawWheel();
});



const removeBtn = document.getElementById("removeBtn");
removeBtn.addEventListener("click", function () {
  if (segments.length > 0) {
    segments.pop();
    redrawWheel();
  }
});
// Modal functionality
const modal = document.getElementById("nameModal");
const nameBtn = document.getElementById("nameBtn");
const closeBtn = document.getElementById("nameClose");
const saveNamesBtn = document.getElementById("saveNamesBtn");
const segmentNamesDiv = document.getElementById("segmentNames");

// Open modal and generate inputs
nameBtn.addEventListener("click", function () {
  if (segments.length === 0) {
    alert("Please add segments first!");
    return;
  }
  
  // Clear previous inputs
  segmentNamesDiv.innerHTML = "";
  
  // Create input for each segment
  for (let i = 0; i < segments.length; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "segmentNameInput";
    input.placeholder = `Name for Segment ${i + 1}`;
    input.value = segments[i].label;
    input.dataset.index = i;
    segmentNamesDiv.appendChild(input);
  }
  
  modal.classList.remove("hidden");
});

// Close modal
closeBtn.addEventListener("click", function () {
  modal.classList.add("hidden");
});

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

// Save names
saveNamesBtn.addEventListener("click", function () {
  const inputs = segmentNamesDiv.querySelectorAll(".segmentNameInput");
  // Update segment labels
  inputs.forEach((input) => {
    const index = parseInt(input.dataset.index);
    const newName = input.value.trim();
    
    if (newName) {
      segments[index].label = newName;
    }
  });
  
  redrawWheel();
  modal.classList.add("hidden");
});

// Spin button functionality
const spinBtn = document.getElementById("spinbtn");
spinBtn.addEventListener("click", function() {
  if (isSpinning) return;
  
  if (segments.length === 0) {
    alert("Please add segments first!");
    return;
  }

  // Create a snapshot of the current state of the wheel. This is needed to make the spin animation smooth.
  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  const snapshotCtx = snapshot.getContext("2d");
  snapshotCtx.drawImage(canvas, 0, 0);

  isSpinning = true;


  // Animation parameters
  const startTime = Date.now();
  const duration = 3000; // 3 seconds
  const totalRotationDeg = Math.random() * 360 + 360 * 5; // Random + 5 turns
  currentRotationDeg = 0;


  // Animation loop
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out
    currentRotationDeg = eased * totalRotationDeg;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((currentRotationDeg * Math.PI) / 180);
    context.translate(-canvas.width / 2, -canvas.height / 2);
    context.drawImage(snapshot, 0, 0);
    context.restore();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      accumulatedRotationDeg = (accumulatedRotationDeg + totalRotationDeg) % 360;
      currentRotationDeg = 0;
      isSpinning = false;
      revealSelected();
    }
  };

  requestAnimationFrame(animate);
});
// Get selected segment index based on rotation
function getSelectedIndex() {
  const n = segments.length;
  if (n === 0) return -1;

  const step = 360 / n;
  const startOffset = -90;   
  const pointerAngle = (() => {
    
    const wheelRect = canvas.getBoundingClientRect();
    const centerX = wheelRect.left + wheelRect.width / 2;
    const centerY = wheelRect.top + wheelRect.height / 2;
   
    const ptrRect = triangle.getBoundingClientRect();
    const tipX = ptrRect.left + ptrRect.width / 2;
    const tipY = ptrRect.bottom;
    const angleRad = Math.atan2(tipY - centerY, tipX - centerX);
    return ((angleRad * 180) / Math.PI + 360) % 360;
  })();

  
  const r = ((accumulatedRotationDeg % 360) + 360) % 360;


  const a = ((pointerAngle - startOffset - r) % 360 + 360) % 360;

  const eps = 1e-6;  
  return Math.floor((a + eps) / step) % n;
}

// Reveal the selected segment
function revealSelected() {
  const idx = getSelectedIndex();
  if (idx < 0) return;
  
  const el = document.getElementById("pickedSegmentText");
  if (el) el.textContent = `You landed on: ${segments[idx].label}`;
  
  const modal = document.getElementById("PickedModal");
  if (modal) modal.classList.remove("hidden");
}


function pickSegment() {
  revealSelected();
}
// Close picked modal
function closeModal() {
  const modal = document.getElementById("PickedModal");
  if (modal) modal.classList.add("hidden");
}

const closeModalBtn = document.getElementById("pickedClose");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}


//Language Section
const langSelect = document.getElementById("languageSelect");
const welcomeText = document.getElementById("welcomeText");
const nameSegmenth2 = document.getElementById("nameSegmenth2");
langSelect.addEventListener("change", function(){
  const selectedLang = langSelect.value;
  
  if (selectedLang === "en") {
    welcomeText.textContent = "Welcome to Lucky Roll!";
    nameBtn.textContent = "Name Segments";
    spinBtn.textContent = "Spin!";
    saveNamesBtn.textContent = "Save Names";
    nameSegmenth2.textContent = "Name Segments";
  }
  else if (selectedLang === "de") {
    welcomeText.textContent = "Willkommen bei Lucky Roll!";
    nameBtn.textContent = "Segmente benennen";
    spinBtn.textContent = "Drehen!";
    saveNamesBtn.textContent = "Namen speichern";
    nameSegmenth2.textContent = "Segmente benennen";
  }
  else if (selectedLang === "es") {
    welcomeText.textContent = "¡Bienvenido a Lucky Roll!";
    nameBtn.textContent = "Nombrar segmentos";
    spinBtn.textContent = "¡Girar!";
    saveNamesBtn.textContent = "Guardar nombres";
    nameSegmenth2.textContent = "Nombrar segmentos";
  }
  else if (selectedLang === "fr") {
    welcomeText.textContent = "Bienvenue à Lucky Roll!";
    nameBtn.textContent = "Nommer les segments";
    spinBtn.textContent = "Tourner!";
    saveNamesBtn.textContent = "Enregistrer les noms";
    nameSegmenth2.textContent = "Nommer les segments";
  }
  else if (selectedLang === "it") {
    welcomeText.textContent = "Benvenuto a Lucky Roll!";
    nameBtn.textContent = "Nomina segmenti";
    spinBtn.textContent = "Gira!";
    saveNamesBtn.textContent = "Salva nomi";
    nameSegmenth2.textContent = "Nomina segmenti";
  }
  else if (selectedLang === "zh") {
    welcomeText.textContent = "欢迎来到幸运轮盘！";
    nameBtn.textContent = "命名部分";
    spinBtn.textContent = "旋转！";
    saveNamesBtn.textContent = "保存名称";
    nameSegmenth2.textContent = "命名部分";
  }
  else if (selectedLang === "ja") {
    welcomeText.textContent = "ラッキーロールへようこそ！";
    nameBtn.textContent = "セグメントに名前を付ける";
    spinBtn.textContent = "スピン！";
    saveNamesBtn.textContent = "名前を保存";
    nameSegmenth2.textContent = "セグメントに名前を付ける";
  }
  else if (selectedLang === "ko") {
    welcomeText.textContent = "럭키 롤에 오신 것을 환영합니다!";
    nameBtn.textContent = "세그먼트 이름 지정";
    spinBtn.textContent = "돌리기!";
    saveNamesBtn.textContent = "이름 저장";
    nameSegmenth2.textContent = "세그먼트 이름 지정";
  }
  else if (selectedLang === "uk") {
    welcomeText.textContent = "Ласкаво просимо до Lucky Roll!";
    nameBtn.textContent = "Назвати сегменти";
    spinBtn.textContent = "Крутити!";
    saveNamesBtn.textContent = "Зберегти імена";
    nameSegmenth2.textContent = "Назвати сегменти";
  }
  else if (selectedLang === "ru") {
    welcomeText.textContent = "Добро пожаловать в Lucky Roll!";
    nameBtn.textContent = "Назвать сегменты";
    spinBtn.textContent = "Крутить!";
    saveNamesBtn.textContent = "Сохранить имена";
    nameSegmenth2.textContent = "Назвать сегменты";
  }
  console.log("Selected language:", selectedLang);
});