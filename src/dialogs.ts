import { Dialog } from 'dcl-npc-toolkit'

export let scriptEntryCharacter: Dialog[] = 
[
  {
    text: `aaaa`,
    isQuestion: true,
    buttons: [
      { label: `What's going on here?`, goToDialog: 1 },
      { label: `How do I play?`, goToDialog: 2 },
      { label: `walk away`, goToDialog: 3 }
      // { label: `Leave me alone`, goToDialog: 4, triggeredActions:()=>{
      //   console.log('yes i clicked leave me alone')
      // } }
    ]
  },
  {
    text: `explain story`
  },
  {
    text: `explain game`,
    isEndOfDialog: true
  },
  {
    text: `exit speech`,
    isEndOfDialog: true
  }
]