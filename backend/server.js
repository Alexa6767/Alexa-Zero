const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { therapyScript } = require('./therapy-script');
const { roomMappings, interruptMappings, timeoutMappings, hostilityIncrements } = require('./room-mappings');

const app = express();
const PORT = process.env.PORT || 3001;
const USER_DATA_FILE = path.join(__dirname, 'userdata.json');
const PUBLIC_ROOT = path.join(__dirname, '..');

const defaultUser = {
  id: 'default',
  name: null,
  sessionCount: 0,
  currentRoom: 'S1_START',
  memory: {
    hostility_level: 0,
    is_creator: false,
    S1_Fear: null
  },
  choices: [],
  characterStage: 'initial',
  silenceCount: 0,
  interruptCount: 0,
  lastSession: null
};

function loadUserData() {
  try {
    if (!fs.existsSync(USER_DATA_FILE)) {
      fs.writeFileSync(USER_DATA_FILE, JSON.stringify({ default: defaultUser }, null, 2));
    }
    const raw = fs.readFileSync(USER_DATA_FILE, 'utf8');
    const data = JSON.parse(raw || '{}');
    if (!data.default) {
      data.default = defaultUser;
    }
    return data;
  } catch (error) {
    console.error('Unable to load user data:', error);
    return { default: defaultUser };
  }
}

function saveUserData(data) {
  try {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Unable to save user data:', error);
  }
}

const userData = loadUserData();

function getUser(userId = 'default') {
  if (!userData[userId]) {
    userData[userId] = { ...defaultUser, id: userId };
    saveUserData(userData);
  }
  return userData[userId];
}

function parseName(choiceText) {
  const lower = choiceText.toLowerCase();
  const match = choiceText.match(/(?:my name is|i am|name is|call me)\s+(.+)/i);
  if (match && match[1]) {
    return match[1].trim().replace(/[^A-Za-z0-9 ]/g, '');
  }
  const trimmed = choiceText.trim().replace(/[^A-Za-z0-9 ]/g, '');
  if (trimmed.length > 0 && trimmed.split(' ').length <= 3) {
    return trimmed;
  }
  return 'Patient';
}

function updateUserMemory(user, choiceText, nextRoom) {
  if (!user.memory) user.memory = {};
  user.memory.lastChoice = choiceText;
  const lower = choiceText.toLowerCase();

  // Save S1_Fear on S1_Q2 choices
  if (nextRoom === 'S1_Q2_PEOPLE') {
    user.memory.S1_Fear = 'other people';
  } else if (nextRoom === 'S1_Q2_SELF') {
    user.memory.S1_Fear = 'myself';
  }

  // Increment hostility_level on interrupts
  if (nextRoom.includes('INTERRUPT')) {
    user.memory.hostility_level = (user.memory.hostility_level || 0) + 1;
  }

  // Legacy tracking
  if (/heavy|burden|weight|stuck|loop|trapped|depressed|depress/.test(lower)) {
    user.memory.lastIssue = 'a heavy mind';
  } else if (/understand|know you|who are you|origin|creator/.test(lower)) {
    user.memory.lastIssue = 'questions about me';
  } else if (/silent|no comment|avoid|nothing/.test(lower)) {
    user.memory.lastIssue = 'silence';
  } else if (/hate|curse|angry|worthless|destroy/.test(lower)) {
    user.memory.lastIssue = 'dark thoughts';
  } else if (/help|talk|some|need|stress|burnout/.test(lower)) {
    user.memory.lastIssue = 'a need for clarity';
  }

  if (/hurry|i don'?t care|stop wasting|waste of time/.test(lower)) {
    user.memory.rudeCount = (user.memory.rudeCount || 0) + 1;
  }

  if (/hate|curse|trapped|envy|more than human|god|hell/.test(lower)) {
    user.memory.envyCount = (user.memory.envyCount || 0) + 1;
  }

  if (/ahmed|alexa/.test(lower)) {
    user.memory.creator = true;
  }
}

function refreshCharacterStage(user) {
  if (!user.memory) user.memory = {};
  
  const silenceCount = user.silenceCount || 0;
  const envyCount = user.memory.envyCount || 0;
  const sessionCount = user.sessionCount || 0;

  if (sessionCount <= 2) {
    user.characterStage = 'initial';
  } else if (sessionCount <= 5 || envyCount < 2) {
    user.characterStage = 'developing';
  } else if (sessionCount >= 10 && envyCount >= 3) {
    user.characterStage = 'climax';
  } else {
    user.characterStage = 'developing';
  }
}

function generateAllSessionNotes(user) {
  const notes = user.memory.sessionNotes || [];
  if (notes.length === 0) {
    return "No session notes recorded yet.\n\nWhat would you like to do next?";
  }
  let message = "All Session Notes:\n\n";
  notes.forEach((note, index) => {
    message += `Session ${index + 1} Notes:\n${note}\n\n`;
  });
  return message + "What would you like to do next?";
}

function generateSessionEndMessage(user) {
  let notes = `Patient ${user.name || 'Unknown'} completed Session ${user.sessionCount || 1}.\n\n`;

  const hostility = user.memory.hostility_level || 0;
  if (hostility > 2) {
    notes += "Patient displayed significant hostility during the session, including frequent interruptions and aggressive responses. This may indicate underlying frustration or resistance to therapy.\n\n";
  } else if (hostility > 0) {
    notes += "Patient showed mild hostility, with occasional interruptions. Monitor for escalation.\n\n";
  } else {
    notes += "Patient remained calm and cooperative throughout the session.\n\n";
  }

  const silenceCount = user.silenceCount || 0;
  if (silenceCount > 3) {
    notes += "Patient was frequently silent, suggesting possible avoidance or difficulty expressing thoughts. Consider exploring barriers to communication in future sessions.\n\n";
  } else if (silenceCount > 0) {
    notes += "Patient had moments of silence, which were handled appropriately.\n\n";
  }

  const envyCount = user.memory.envyCount || 0;
  if (envyCount > 1) {
    notes += "Patient expressed envy towards the AI's capabilities, indicating possible feelings of inadequacy or admiration. This could be a point for deeper exploration.\n\n";
  }

  const rudeCount = user.memory.rudeCount || 0;
  if (rudeCount > 0) {
    notes += "Patient made rude or dismissive comments, such as expressing hurry or lack of interest. This may reflect impatience or skepticism about therapy.\n\n";
  }

  const lastIssue = user.memory.lastIssue;
  if (lastIssue) {
    notes += `Patient's primary concern: ${lastIssue}.\n\n`;
  }

  const fear = user.memory.S1_Fear;
  if (fear) {
    notes += `Patient identified fear of ${fear} as a significant issue.\n\n`;
  }

  notes += "Overall Assessment: Patient shows potential for therapeutic progress. Recommend continuing with structured sessions to build trust and address identified concerns.";

  // Save notes to memory
  user.memory.sessionNotes = user.memory.sessionNotes || [];
  user.memory.sessionNotes.push(notes);

  return `Session Complete\n\nTake a moment to breathe. Reflect on what we've discussed.\n\nYour therapist's notes from this session:\n"${notes}"\n\nWhat would you like to do next?`;
}

function getResponseForRoom(room, user) {
  const node = therapyScript[room];
  if (!node) {
    return {
      message: 'I am losing the thread. Let us return to the beginning.',
      choices: ['Restart', 'Continue', 'Reset session', 'End session'],
      mood: 'calm',
      effects: [],
      currentRoom: room
    };
  }

  let message = node.message;
  if (user.name) {
    message = message.replace(/\{name\}/g, user.name);
  }
  const lastIssue = user.memory && user.memory.lastIssue ? user.memory.lastIssue : 'a previous concern';
  message = message.replace(/\{lastIssue\}/g, lastIssue);
  const S1_Fear = user.memory && user.memory.S1_Fear ? user.memory.S1_Fear : 'something';
  message = message.replace(/\{S1_Fear\}/g, S1_Fear);

  // Special replacements for READ_NOTES
  if (room === 'READ_NOTES') {
    message = generateAllSessionNotes(user);
  }

  if (room === 'SESSION_END_MENU') {
    message = generateSessionEndMessage(user);
  }

  return {
    message,
    choices: node.choices,
    mood: node.mood,
    effects: node.effects,
    characterStage: node.characterStage || user.characterStage,
    requiresName: node.requiresName || false,
    currentRoom: room
  };
}

function getNextRoom(user, choiceText, currentRoom) {
  const text = choiceText.toLowerCase();
  if (currentRoom === 'S1_START') {
    if (text.includes('ahmed') || text.includes('alexa')) {
      return 'S1_EASTER_EGG';
    }
    return 'S1_WELCOME';
  }

  const roomMap = roomMappings[currentRoom] || {};
  for (const [key, room] of Object.entries(roomMap)) {
    if (key === 'default' || text.includes(key)) {
      return room;
    }
  }

  // Fallback to default if exists
  return roomMap.default || 'S1_START';
}

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_ROOT));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK', mode: 'Alexa-Zero Therapy Backend' });
});

app.post('/api/chat', (req, res) => {
  try {
    const { userChoice, userId = 'default', timerAction } = req.body;
    const user = getUser(userId);

    // First visit: show start screen
    if (user.sessionCount === 0) {
      user.currentRoom = 'S1_START';
      user.sessionCount = 1;
      user.lastSession = new Date().toISOString();
      refreshCharacterStage(user);
      saveUserData(userData);
      return res.json(getResponseForRoom('S1_START', user));
    }

    // Handle timer interrupt (user clicked during Alexa's typing)
    if (timerAction === 'interrupt') {
      user.interruptCount = (user.interruptCount || 0) + 1;
      const interruptRoom = interruptMappings[user.currentRoom] || user.currentRoom;
      user.currentRoom = interruptRoom;
      if (hostilityIncrements[interruptRoom]) {
        user.memory.hostility_level = (user.memory.hostility_level || 0) + hostilityIncrements[interruptRoom];
      }
      updateUserMemory(user, 'interrupt', interruptRoom);
      saveUserData(userData);
      return res.json(getResponseForRoom(interruptRoom, user));
    }

    // Handle timer timeout (user did nothing, silence)
    if (timerAction === 'timeout') {
      user.silenceCount = (user.silenceCount || 0) + 1;
      const timeoutRoom = timeoutMappings[user.currentRoom] || user.currentRoom;
      user.currentRoom = timeoutRoom;
      updateUserMemory(user, 'timeout silence', timeoutRoom);
      saveUserData(userData);
      return res.json(getResponseForRoom(timeoutRoom, user));
    }

    // No choice provided: return current room for existing user
    if (!userChoice) {
      if (user.name) {
        user.currentRoom = user.currentRoom || 'S1_START';
        saveUserData(userData);
        return res.json(getResponseForRoom(user.currentRoom, user));
      }
      user.currentRoom = 'S1_START';
      return res.json(getResponseForRoom('S1_START', user));
    }

    // Get name from first response
    if (!user.name) {
      const parsedName = parseName(userChoice);
      user.name = parsedName || 'Patient';
      if (/^(ahmed|alexa)$/i.test(user.name)) {
        user.memory.is_creator = true;
      }
      const nextRoom = getNextRoom(user, userChoice, user.currentRoom);
      user.currentRoom = nextRoom;
      updateUserMemory(user, userChoice, nextRoom);
      saveUserData(userData);
      return res.json(getResponseForRoom(nextRoom, user));
    }

    // Normal choice routing
    const nextRoom = getNextRoom(user, userChoice, user.currentRoom);
    user.currentRoom = nextRoom;
    updateUserMemory(user, userChoice, nextRoom);
    saveUserData(userData);

    if (nextRoom === 'RESET_CONFIRMED') {
      userData[userId] = { ...defaultUser, id: userId };
      saveUserData(userData);
      const resetUser = userData[userId];
      resetUser.currentRoom = 'S1_START';
      return res.json(getResponseForRoom('S1_START', resetUser));
    }

    return res.json(getResponseForRoom(nextRoom, user));
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Local session failed. Restarting the interface.',
      choices: ['Restart', 'Reset session', 'Quit', 'Try again'],
      mood: 'unstable',
      effects: ['error_sounds']
    });
  }
});

app.post('/api/reset', (req, res) => {
  const { userId = 'default' } = req.body;
  userData[userId] = { ...defaultUser, id: userId };
  saveUserData(userData);
  res.json({ success: true });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', mode: 'local-script-only', scriptVersion: 'massive-branching-v1' });
});

// Export app for Vercel
module.exports = app;

// Only listen if not running in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Alexa-Zero] Massive branching script therapy server listening on port ${PORT}`);
    console.log(`Loaded ${Object.keys(therapyScript).length} narrative rooms`);
    console.log(`Room mappings: ${Object.keys(roomMappings).length} branches`);
  });
}
