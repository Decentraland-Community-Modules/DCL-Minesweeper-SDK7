/*      TIMER DISPLAY SYSTEM
    used to display an active timer count on a text mesh.
    time is only incremented on every 1/10 second to reduce
    number of redraws on textmesh.

    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: thecryptotrader69@gmail.com
*/
import { Entity, Schemas, TextShape, engine } from "@dcl/sdk/ecs";
//custom component def
export const TimerDisplayData =
{
    //contains text shape targeted for update
    displayEntity: Schemas.Entity,
    //  stored values
    curDelta:Schemas.Number,
    curTime:Schemas.Array(Schemas.Number)
}
//create component def
export const TimerDisplayComponent = engine.defineComponent("TimerDisplayComponent", TimerDisplayData);
//create component processing
export function TimerDisplaySystem(dt: number)
{
    //process every entity that has this component
    for (const [entity] of engine.getEntitiesWith(TimerDisplayComponent)) 
    {
        //NOTE: dt in current verson does not translate cleanly to seconds
        let timerDisplayComponent = TimerDisplayComponent.getMutable(entity);
        
        timerDisplayComponent.curDelta += dt;
        if(timerDisplayComponent.curDelta >= 0.1)
        {
            timerDisplayComponent.curDelta -= 0.1;
            //  seconds
            timerDisplayComponent.curTime[0]++;
            if(timerDisplayComponent.curTime[0] > 599)
            {
                timerDisplayComponent.curTime[0] = 0;
                //  mins         
                timerDisplayComponent.curTime[1]++;       
                /*if(timerDisplayComponent.curTime[0] > 59)
                {
                    timerDisplayComponent.curTime[0] = 0;
                    timerDisplayComponent.curTime[1]++;
                }*/
            }
            //update textshape
            TextShape.getMutable(timerDisplayComponent.displayEntity).text = 
                TimerDisplayManager.PadCheck(timerDisplayComponent.curTime[1], 2)+":"+
                TimerDisplayManager.PadCheck(timerDisplayComponent.curTime[0], 3);
        }
    }
}

export class TimerDisplayManager
{
    isActive:boolean = false;

    entityDisplay:Entity;

    //constructor
    constructor(entity:Entity)
    {
        //store display entity
        this.entityDisplay = entity;

        //add timer component
        TimerDisplayComponent.create(this.entityDisplay,
        {
            displayEntity: this.entityDisplay,
            curDelta: 0,
            curTime: [0,0]
        });
    }

    //
    public SetState(state:boolean)
    {
        //ensure a change is occuring
        if(!this.isActive && state)
        {
            engine.addSystem(TimerDisplaySystem);

            //clear component details 
            let timer = TimerDisplayComponent.getMutable(this.entityDisplay);

            timer.curDelta = 0;
            timer.curTime = [0,0];
        }
        else if(this.isActive && !state)
        {
            engine.removeSystem(TimerDisplaySystem);
        }

        this.isActive = state;
    }

    //
    public ClearDisplay()
    {
        TextShape.getMutable(this.entityDisplay).text = "00:000";
    }

    //returns with padding zeroes to the given amount
    public static PadCheck(value:number, count:number): string
    {
        let tmp:string = value.toString();
        while(tmp.length < count)
        {
            tmp = "0" + tmp;
        }
        return tmp; 
    }
}