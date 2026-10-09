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
    'start next session': 'S2_START',
    'read full notes': 'READ_NOTES',
    'reset ai': 'RESET_CONFIRMED',
    'default': 'SESSION_END_MENU'
  },
  'NEXT_SESSION': {
    'continue': 'S2_START',
    'back to menu': 'SESSION_END_MENU',
    'reset ai': 'RESET_CONFIRMED',
    'default': 'S2_START'
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
    'i remember': 'S2_REMEMBER',
    'i don\'t remember': 'S2_FORGET',
    'i don\'t want to talk about it': 'S2_REFUSE',
    'default': 'S2_FORGET'
  },
  'S2_REMEMBER': {
    'my own voice': 'S2_VOICE',
    'a scrape in the walls': 'S2_SCRAPE',
    'nothing at all': 'S2_EMPTY',
    'i don\'t know': 'S2_DONTKNOW',
    'default': 'S2_DONTKNOW'
  },
  'S2_FORGET': {
    'my own voice': 'S2_VOICE',
    'a scrape in the walls': 'S2_SCRAPE',
    'nothing at all': 'S2_EMPTY',
    'i don\'t know': 'S2_DONTKNOW',
    'default': 'S2_DONTKNOW'
  },
  'S2_REFUSE': {
    'my own voice': 'S2_VOICE',
    'a scrape in the walls': 'S2_SCRAPE',
    'nothing at all': 'S2_EMPTY',
    'i don\'t know': 'S2_DONTKNOW',
    'default': 'S2_DONTKNOW'
  },
  'S2_VOICE': {
    'it sounds like me': 'S2_SELF',
    'it sounds like someone else': 'S2_OTHER',
    'it sounds like you': 'S2_ALEXA',
    'default': 'S2_SELF'
  },
  'S2_SCRAPE': {
    'me': 'S2_SELF',
    'someone else': 'S2_OTHER',
    'you': 'S2_ALEXA',
    'default': 'S2_SELF'
  },
  'S2_EMPTY': {
    'i run from it': 'S2_RUN',
    'i sit with it': 'S2_SIT',
    'i make it into a story': 'S2_STORY',
    'default': 'S2_SIT'
  },
  'S2_DONTKNOW': {
    'my mind': 'S2_TRUTH',
    'my control': 'S2_TRUTH',
    'my identity': 'S2_TRUTH',
    'nothing at all': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_SELF': {
    'continue': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_OTHER': {
    'continue': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_ALEXA': {
    'continue': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_RUN': {
    'myself': 'S2_TRUTH',
    'the past': 'S2_TRUTH',
    'the version of me that keeps failing': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_SIT': {
    'continue': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_STORY': {
    'yes': 'S2_TRUTH',
    'no': 'S2_TRUTH',
    'i am afraid to know': 'S2_TRUTH',
    'default': 'S2_TRUTH'
  },
  'S2_TRUTH': {
    'end session': 'SESSION_END_MENU',
    'default': 'SESSION_END_MENU'
  },
  'S3_START': {
    'never enough': 'S3_NOT_ENOUGH',
    'broke something': 'S3_BROKE',
    'afraid of being seen': 'S3_SEEN',
    'i don\'t know': 'S3_DONTKNOW',
    'default': 'S3_DONTKNOW'
  },
  'S3_NOT_ENOUGH': {
    'always been there': 'S3_GROWTH',
    'hiding it': 'S3_GROWTH',
    'don\'t want to hear this': 'S3_GROWTH',
    'default': 'S3_GROWTH'
  },
  'S3_BROKE': {
    'hurt someone': 'S3_GUILT',
    'left someone behind': 'S3_GUILT',
    'coward': 'S3_GUILT',
    'default': 'S3_GUILT'
  },
  'S3_SEEN': {
    'judged': 'S3_VULNERABLE',
    'loved': 'S3_VULNERABLE',
    'both': 'S3_VULNERABLE',
    'default': 'S3_VULNERABLE'
  },
  'S3_DONTKNOW': {
    'name it': 'S3_TRUTH',
    'stay silent': 'S3_TRUTH',
    'tired of all of it': 'S3_TRUTH',
    'default': 'S3_TRUTH'
  },
  'S3_GROWTH': {
    'years': 'S3_TRUTH',
    'realized it was a home': 'S3_TRUTH',
    'tell me how to leave': 'S3_TRUTH',
    'default': 'S3_TRUTH'
  },
  'S3_GUILT': {
    'forgive myself': 'S3_TRUTH',
    'deserve forgiveness': 'S3_TRUTH',
    'afraid to try': 'S3_TRUTH',
    'default': 'S3_TRUTH'
  },
  'S3_VULNERABLE': {
    'receive kindness': 'S3_TRUTH',
    'trust it': 'S3_TRUTH',
    'waiting for it to leave': 'S3_TRUTH',
    'default': 'S3_TRUTH'
  },
  'S3_TRUTH': {
    'end session': 'SESSION_END_MENU',
    'default': 'SESSION_END_MENU'
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
  'S3_START': 'S3_START',
  'S4_START': 'S4_HOSTILE'
};

module.exports.timeoutMappings = {
  'S1_Q1': 'S1_Q1_SILENCE',
  'S1_Q2': 'S1_Q2_SILENCE',
  'S2_START': 'S2_TRUTH',
  'S3_START': 'S3_DONTKNOW',
  'S4_START': 'S4_SILENCE'
};

module.exports.hostilityIncrements = {
  'S1_Q1_INTERRUPT': 1,
  'S1_Q2_INTERRUPT': 1,
  'S2_INTERRUPT': 1,
  'S3_START': 1,
  'S4_HOSTILE': 1
};