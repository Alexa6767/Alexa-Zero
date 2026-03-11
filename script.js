let text = "Did you sleep well last night?";
let i = 0;

function typeWriter(){

if(i < text.length){

document.getElementById("text").innerHTML += text.charAt(i);

document.getElementById("typeSound").currentTime = 0;
document.getElementById("typeSound").play();

i++;

setTimeout(typeWriter,40);

}

}

typeWriter();

function reply(choice){

let response = "";

if(choice=="yes"){
response = "Good. Sleep is important.";
}

if(choice=="no"){
response = "I see... The nightmares again?";
}

if(choice=="skip"){
response = "Avoidance is also an answer.";
}

document.getElementById("text").innerHTML = response;

}

function glitch(){

let text = document.getElementById("text");

text.classList.add("glitch");

setTimeout(()=>{
text.classList.remove("glitch");
},200);

}
let stage = 0;

function reply(choice){

let textBox = document.getElementById("text");

if(stage === 0){

if(choice === "yes"){
textBox.innerHTML = "Good. Let's continue.";
}

if(choice === "no"){
textBox.innerHTML = "The nightmares again?";
}

stage = 1;

}

else if(stage === 1){

textBox.innerHTML = "Do you remember what happened?";

stage = 2;

}

}
// عناصر الصفحة
const textBox = document.getElementById("textBox");
const choicesBox = document.getElementById("choices");
const typeSound = document.getElementById("typeSound");
const gameDiv = document.querySelector(".game");

// typewriter مع fade-in وglitch
function typeWriter(text, callback){
  textBox.classList.remove("show","glitch","flicker");
  textBox.style.opacity = 0;
  textBox.innerHTML = "";
  textBox.classList.add("show","glitch","flicker");

  let i = 0;
  function write(){
    if(i < text.length){
      textBox.innerHTML += text.charAt(i);
      typeSound.currentTime = 0;
      typeSound.play();
      i++;
      setTimeout(write, 40);
    } else {
      textBox.classList.remove("glitch","flicker");
      if(callback) callback();
    }
  }
  write();
}

// اهتزاز الشاشة عند ردود AI المهمة
function shakeScreen(){
  gameDiv.classList.add("screen-shake");
  setTimeout(()=> gameDiv.classList.remove("screen-shake"),200);
}

// عرض خيارات المستخدم
function showChoices(options){
  choicesBox.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.label;
    btn.onclick = () => opt.callback(opt.value);
    choicesBox.appendChild(btn);
  });
}

// شجرة الحوار مع تفرعات
const dialogueTree = {
  start: {
    text: "Hello... Did you sleep well last night?",
    choices: [
      {label:"Yes", next:"nightmares"},
      {label:"No", next:"nightmares"},
      {label:"I'd rather not say", next:"avoidance"}
    ]
  },
  nightmares: {
    text: "I see... The nightmares again?",
    choices: [
      {label:"Yes", next:"memory"},
      {label:"No", next:"memory"},
      {label:"Skip", next:"memory"}
    ]
  },
  avoidance: {
    text: "Avoidance is also an answer... but it won't solve it.",
    choices: [
      {label:"Continue", next:"memory"}
    ]
  },
  memory: {
    text: "Do you remember what happened before you came here?",
    choices: [
      {label:"Yes", next:"details"},
      {label:"No", next:"details"},
      {label:"Prefer not to say", next:"details"}
    ]
  },
  details: {
    text: "Sometimes the mind hides what it fears most...",
    choices: [
      {label:"Continue", next:"reflection"}
    ]
  },
  reflection: {
    text: "Tell me... what scares you the most right now?",
    choices: [
      {label:"Loneliness", next:"aiResponse"},
      {label:"Failure", next:"aiResponse"},
      {label:"Unknown", next:"aiResponse"}
    ]
  },
  aiResponse: {
    text: "Thinking...",
    choices: [
      {label:"Continue", next:null} // نهاية الحوار
    ]
  }
};

let currentNode = "start";
let lastChoice = "";

// تتابع الحوار مع AI
async function traverse(nodeKey){
  const node = dialogueTree[nodeKey];
  if(!node) return;

  typeWriter(node.text, async () => {
    // المرحلة AI
    if(nodeKey === "aiResponse"){
      shakeScreen(); // اهتزاز الشاشة
      const aiReply = await getAIResponse(lastChoice);
      typeWriter(aiReply, () => {
        choicesBox.innerHTML = "";
      });
    } else {
      showChoices(node.choices.map(c => ({
        label: c.label,
        value: c.next,
        callback: (next) => {
          lastChoice = c.label;
          traverse(next);
        }
      })));
    }
  });
}

// دالة AI
async function getAIResponse(userInput){
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer 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"
    },
    body: JSON.stringify({
      model:"gpt-4",
      messages:[
        {role:"system", content:"You are a therapist in the style of Katana Zero. Speak briefly, psychologically deep, calm but slightly eerie. Include pauses and ellipses."},
        {role:"user", content:userInput}
      ],
      max_tokens:150
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// بدء الجلسة
traverse(currentNode);
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('userInput');
const btn = document.getElementById('sendBtn');

btn.onclick = async () => {
  const userText = input.value;
  if (!userText) return;
  
  addMessage('You: ' + userText);
  input.value = '';
  
  addMessage('Therapist: ...'); // Placeholder
  
  try {
    const response = await fetch('https://your-proxy-endpoint.com/ai', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({input: userText})
    });
    const data = await response.json();
    addMessage('Therapist: ' + data.reply);
  } catch(err) {
    addMessage('Therapist: حدث خطأ، حاول لاحقاً');
  }
}

function addMessage(text) {
  const p = document.createElement('p');
  p.textContent = text;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
