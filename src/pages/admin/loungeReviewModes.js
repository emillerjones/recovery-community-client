export const REVIEW_MODES = [
  {value:'cutoffs',label:'Our cutoffs',description:'Review a message when any category score reaches one of our saved cutoffs.',example:'Use the category thresholds below to tune the queue.'},
  {value:'openai',label:"OpenAI’s evaluation",description:'Review a message when OpenAI returns its overall flagged judgment.',example:'Our saved cutoffs do not decide which messages enter the queue.'},
  {value:'either',label:'Either one',description:'Review a message if our cutoffs OR OpenAI identify a concern.',example:'Catches either signal. May produce more messages to review.'},
];
export const reviewModeLabel=value=>REVIEW_MODES.find(mode=>mode.value===value)?.label||'Our cutoffs';

