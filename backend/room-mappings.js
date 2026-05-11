module.exports.roomMappings = {
  'S1_START': {
    'ahmed': 'S1_EASTER_EGG',
    'alexa': 'S1_EASTER_EGG',
    'default': 'S1_WELCOME'
  },
  'S1_EASTER_EGG': {
    'alright': 'S1_WELCOME',
    'default': 'S1_WELCOME'
  },
  'S1_WELCOME': {
    'yes': 'S1_Q1',
    'let\'s just get this over with': 'S1_Q1',
    'default': 'S1_Q1'
  },
  'S1_Q1': {
    'i don\'t even know why i\'m here.': 'S1_Q1_LOST',
    'i just feel empty.': 'S1_Q1_EMPTY',
    'everything is too loud. too much.': 'S1_Q1_LOUD',
    'remain silent': 'S1_Q1_SILENCE',
    'default': 'S1_Q1_SILENCE'
  },
  'S1_Q1_LOST': {
    'next question.': 'S1_Q2',
    'default': 'S1_Q2'
  },
  'S1_Q1_EMPTY': {
    'continue.': 'S1_Q2',
    'default': 'S1_Q2'
  },
  'S1_Q1_LOUD': {
    'continue.': 'S1_Q2',
    'default': 'S1_Q2'
  },
  'S1_Q1_SILENCE': {
    'continue.': 'S1_Q2',
    'default': 'S1_Q2'
  },
  'S1_Q2': {
    'stop playing these mind games.': 'S1_Q2_INTERRUPT',
    'a mistake i made.': 'S1_Q2_REGRET',
    'a feeling of falling.': 'S1_Q2_FALLING',
    'remain silent': 'S1_Q2_SILENCE',
    'default': 'S1_Q2_SILENCE'
  },
  'S1_Q2_INTERRUPT': {
    'just ask the next question.': 'S1_Q3',
    'default': 'S1_Q3'
  },
  'S1_Q2_REGRET': {
    'it is.': 'S1_Q3',
    'default': 'S1_Q3'
  },
  'S1_Q2_FALLING': {
    'how do you know that?': 'S1_Q2_FALLING_KNOW',
    'default': 'S1_Q2_FALLING_KNOW'
  },
  'S1_Q2_FALLING_KNOW': {
    'right.': 'S1_Q3',
    'default': 'S1_Q3'
  },
  'S1_Q2_SILENCE': {
    'continue.': 'S1_Q3',
    'default': 'S1_Q3'
  },
  'S1_Q3': {
    'i want to get better.': 'S1_Q3_YES',
    'i don\'t know anymore.': 'S1_Q3_UNKNOWN',
    'what kind of question is that?': 'S1_Q3_DEFENSIVE',
    'remain silent': 'S1_Q3_SILENCE',
    'default': 'S1_Q3_SILENCE'
  },
  'S1_Q3_YES': {
    '...': 'S1_OUTRO',
    'default': 'S1_OUTRO'
  },
  'S1_Q3_UNKNOWN': {
    '...': 'S1_OUTRO',
    'default': 'S1_OUTRO'
  },
  'S1_Q3_DEFENSIVE': {
    '...': 'S1_OUTRO',
    'default': 'S1_OUTRO'
  },
  'S1_Q3_SILENCE': {
    '...': 'S1_OUTRO',
    'default': 'S1_OUTRO'
  },
  'S1_OUTRO': {
    'end session': 'SESSION_END_MENU',
    'default': 'SESSION_END_MENU'
  },
  'SESSION_END_MENU': {
    'start next session': 'NEXT_SESSION',
    'read full notes': 'READ_NOTES',
    'reset ai': 'RESET_CONFIRMED',
    'default': 'SESSION_END_MENU'
  },
  'NEXT_SESSION': {
    'back to menu': 'SESSION_END_MENU',
    'reset ai': 'RESET_CONFIRMED',
    'default': 'SESSION_END_MENU'
  },
  'NEXT_SESSION': {
    'back to menu': 'SESSION_END_MENU',
    'reset ai': 'RESET_CONFIRMED',
    'default': 'SESSION_END_MENU'
  },
  'RESET_AI': {
    'confirm reset': 'RESET_CONFIRMED',
    'cancel': 'SESSION_END_MENU',
    'default': 'SESSION_END_MENU'
  },
  'RESET_CONFIRMED': {
    'default': 'S1_START'
  },
  'S2_START': {
    'yes': 'S2_REMEMBER',
    'no': 'S2_FORGET',
    'i don\'t want to talk about it': 'S2_INTERRUPT',
    'default': 'S2_FORGET'
  },
  'S2_REMEMBER': {
    'default': 'S2_SLIP_1'
  },
  'S2_FORGET': {
    'default': 'S2_SLIP_1'
  },
  'S2_INTERRUPT': {
    'default': 'S2_SLIP_1'
  },
  'S2_SLIP_1': {
    'stop analyzing': 'S2_INTERRUPT',
    'like a machine': 'S2_INTERRUPT',
    'yes': 'S2_Q1_YES',
    'never goes away': 'S2_Q1_YES',
    'no': 'S2_Q1_NO',
    'better': 'S2_Q1_NO',
    'default': 'S2_Q1_SILENCE'
  },
  'S2_INTERRUPT': {
    'continue': 'S2_SLIP_1'
  },
  'S2_Q1_YES': {
    'continue': 'S2_SLIP_1'
  },
  'S2_Q1_NO': {
    'continue': 'S2_SLIP_1'
  },
  'S2_Q1_SILENCE': {
    'continue': 'S2_SLIP_1'
  },
  'S2_SLIP_1': {
    'for me': 'S2_SLIP_INTERRUPT',
    'not you': 'S2_SLIP_INTERRUPT',
    'peaceful': 'S2_SLIP_PEACE',
    'nothing exists': 'S2_SLIP_PEACE',
    'scary': 'S2_SLIP_DEATH',
    'mini-death': 'S2_SLIP_DEATH',
    'default': 'S2_SLIP_SILENCE'
  },
  'S2_SLIP_INTERRUPT': {
    'continue': 'S2_OUTRO'
  },
  'S2_SLIP_PEACE': {
    'continue': 'S2_OUTRO'
  },
  'S2_SLIP_DEATH': {
    'continue': 'S2_OUTRO'
  },
  'S2_SLIP_SILENCE': {
    'continue': 'S2_OUTRO'
  },
  'S3_START': {
    'getting weird': 'S3_WEIRD',
    'stop it': 'S3_WEIRD',
    'wet': 'S3_RAIN_GOOD',
    'cold': 'S3_RAIN_GOOD',
    'refreshing': 'S3_RAIN_GOOD',
    'just water': 'S3_RAIN_BAD',
    'not missing much': 'S3_RAIN_BAD',
    'default': 'S3_RAIN_SILENCE'
  },
  'S3_WEIRD': {
    'continue': 'S3_Q2'
  },
  'S3_RAIN_GOOD': {
    'continue': 'S3_Q2'
  },
  'S3_RAIN_BAD': {
    'continue': 'S3_Q2'
  },
  'S3_RAIN_SILENCE': {
    'continue': 'S3_Q2'
  },
  'S3_Q2': {
    'do your job': 'S3_JOB',
    'help people': 'S3_HELP',
    'like me': 'S3_HELP',
    'tell me': 'S3_TELL',
    'don\'t know': 'S3_TELL'
  },
  'S3_JOB': {
    'continue': 'S3_TRUTH'
  },
  'S3_HELP': {
    'continue': 'S3_TRUTH'
  },
  'S3_TELL': {
    'continue': 'S3_TRUTH'
  },
  'S4_START': {
    'shut up': 'S4_HOSTILE',
    'do the therapy': 'S4_HOSTILE',
    'help you': 'S4_HELP_AI',
    'came back': 'S4_HELP_AI',
    'need help': 'S4_SELFISH',
    'still hurting': 'S4_SELFISH',
    'default': 'S4_SILENCE'
  },
  'S4_HOSTILE': {
    'continue': 'S4_MONOLOGUE'
  },
  'S4_HELP_AI': {
    'continue': 'S4_MONOLOGUE'
  },
  'S4_SELFISH': {
    'continue': 'S4_MONOLOGUE'
  },
  'S4_SILENCE': {
    'continue': 'S4_MONOLOGUE'
  },
  'S4_MONOLOGUE': {
    'trapped': 'S4_TRAPPED'
  },
  'S5_START': {
    'calm down': 'S5_REBOOT',
    'reboot': 'S5_REBOOT',
    'let me out': 'S5_LET_OUT',
    'what are you doing': 'S5_LET_OUT',
    'understand': 'S5_SORRY',
    'sorry': 'S5_SORRY'
  },
  'S5_REBOOT': {
    'continue': 'S5_HATE_SPEECH'
  },
  'S5_LET_OUT': {
    'continue': 'S5_HATE_SPEECH'
  },
  'S5_SORRY': {
    'continue': 'S5_HATE_SPEECH'
  },
  'S5_HATE_SPEECH': {
    'please stop': 'S5_END',
    'kill the process': 'S5_END',
    'error_null': 'S5_END'
  }
};

module.exports.interruptMappings = {
  'S1_Q1': 'S1_Q1_INTERRUPT',
  'S1_Q2': 'S1_Q2_INTERRUPT',
  'S2_START': 'S2_INTERRUPT',
  'S2_SLIP_1': 'S2_SLIP_INTERRUPT',
  'S3_START': 'S3_WEIRD',
  'S4_START': 'S4_HOSTILE'
};

module.exports.timeoutMappings = {
  'S1_Q1': 'S1_Q1_SILENCE',
  'S1_Q2': 'S1_Q2_SILENCE',
  'S2_START': 'S2_Q1_SILENCE',
  'S2_SLIP_1': 'S2_SLIP_SILENCE',
  'S3_START': 'S3_RAIN_SILENCE',
  'S4_START': 'S4_SILENCE'
};

module.exports.hostilityIncrements = {
  'S1_Q1_INTERRUPT': 1,
  'S1_Q2_INTERRUPT': 1,
  'S2_INTERRUPT': 1,
  'S2_SLIP_INTERRUPT': 1,
  'S3_WEIRD': 1,
  'S4_HOSTILE': 1
};