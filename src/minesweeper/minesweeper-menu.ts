import { Color4 } from "@dcl/sdk/math";
import { Menu3DDisplayAdjustmentTypes, Menu3DModelTypes, Menu3DTransformAdjustmentTypes, MenuGroup3D } from "../utilities/menu-group-3D";
import { InputAction, pointerEventsSystem } from "@dcl/sdk/ecs";
import { DifficultyData } from "./data/minesweeper-difficulties";

/**       MINESWEEPER MENU
    handles the creation of a minesweeper field's controls
    
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: thecryptotrader69@gmail.com
 */
export class MinesweeperMenu
{
    //menu group instance
    public menu3DParent:MenuGroup3D;

    //callbacks
    //  starts the game
    public GameStart: () => void = this.gameStart;
    private gameStart(): void { console.log("game menu callback not set - start game"); }
    //  restarts the game
    public GameReset: () => void = this.gameReset;
    private gameReset(): void { console.log("game menu callback not set - reset game"); }
    //  changes the difficulty of the game
    public ChangeDifficulty: (change:number) => void = this.changeDifficulty;
    private changeDifficulty(): void { console.log("game menu callback not set - change difficulty"); }

    constructor()
    {
        //create and position 3D menu
        this.menu3DParent = new MenuGroup3D();
        this.menu3DParent.SetColour(Color4.create(1, 0, 1, 1));
        this.menu3DParent.AdjustMenuParent(Menu3DTransformAdjustmentTypes.POSITION, 0, 1.5, 0);

        //initialize 3D menu
        this.InitializeMenu3D();
    }

    /**
     * sets up the 3D menu for the minesweeper board
     */
    public InitializeMenu3D()
    {
        //display setup
        //  main display object
        this.menu3DParent.AddMenuObject("menuFrame", Menu3DModelTypes.PANEL_LONG);
        //  main display offset
        this.menu3DParent.AddMenuObject("menuOffset", Menu3DModelTypes.EMPTY, "menuFrame");
        this.menu3DParent.AdjustMenuObject("menuOffset", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0.0125);

        //  game header
        this.menu3DParent.AddMenuText("menuOffset", "gameHeader", "DREAMSWEEPER");
        this.menu3DParent.AdjustTextObject("menuOffset", "gameHeader", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.65, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "gameHeader", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "gameHeader", Menu3DDisplayAdjustmentTypes.FONT, 5);
        //  game state value
        this.menu3DParent.AddMenuText("menuOffset", "gameStateValue", "GAME_STATE");
        this.menu3DParent.AdjustTextObject("menuOffset", "gameStateValue", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.45, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "gameStateValue", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "gameStateValue", Menu3DDisplayAdjustmentTypes.FONT, 3);

        //  game timer current label
        this.menu3DParent.AddMenuText("menuOffset", "timerCurLabel", "CUR TIME:");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerCurLabel", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.2, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "timerCurLabel", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerCurLabel", Menu3DDisplayAdjustmentTypes.FONT, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerCurLabel", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 1, 2);
        //  game timer current value
        this.menu3DParent.AddMenuText("menuOffset", "timerCurValue", "##:##:##");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerCurValue", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.2, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "timerCurValue", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerCurValue", Menu3DDisplayAdjustmentTypes.FONT, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerCurValue", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 1, 0);
        /*
        //  game timer start label
        this.menu3DParent.AddMenuText("menuOffset", "timerStartLabel", "GAME START:");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerStartLabel", 0, Vector3.create(0, 0.0, 0));
        this.menu3DParent.AdjustTextObject("menuOffset", "timerStartLabel", 1, Vector3.create(0.4, 0.4, 1));
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerStartLabel", 0, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerStartLabel", 2, 1, 2);
        //  game timer start value
        this.menu3DParent.AddMenuText("menuOffset", "timerStartValue", "##:##:##");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerStartValue", 0, Vector3.create(0, 0.0, 0));
        this.menu3DParent.AdjustTextObject("menuOffset", "timerStartValue", 1, Vector3.create(0.4, 0.4, 1));
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerStartValue", 0, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerStartValue", 2, 1, 0);

        //  game timer end label
        this.menu3DParent.AddMenuText("menuOffset", "timerEndLabel", "END TIME:");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerEndLabel", 0, Vector3.create(0, -0.10, 0));
        this.menu3DParent.AdjustTextObject("menuOffset", "timerEndLabel", 1, Vector3.create(0.4, 0.4, 1));
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerEndLabel", 0, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerEndLabel", 2, 1, 2);
        //  game timer end value
        this.menu3DParent.AddMenuText("menuOffset", "timerEndValue", "##:##:##");
        this.menu3DParent.AdjustTextObject("menuOffset", "timerEndValue", 0, Vector3.create(0, -0.10, 0));
        this.menu3DParent.AdjustTextObject("menuOffset", "timerEndValue", 1, Vector3.create(0.4, 0.4, 1));
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerEndValue", 0, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "timerEndValue", 2, 1, 0);
        */
        //  mines remaining label
        this.menu3DParent.AddMenuText("menuOffset", "minesRemainingLabel", "CORRUPT NODES:");
        this.menu3DParent.AdjustTextObject("menuOffset", "minesRemainingLabel", Menu3DTransformAdjustmentTypes.POSITION, 0.38, -0.05, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "minesRemainingLabel", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "minesRemainingLabel", Menu3DDisplayAdjustmentTypes.FONT, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "minesRemainingLabel", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 1, 2);
        //  mines remaining value
        this.menu3DParent.AddMenuText("menuOffset", "minesRemainingValue", "##");
        this.menu3DParent.AdjustTextObject("menuOffset", "minesRemainingValue", Menu3DTransformAdjustmentTypes.POSITION, 0.38, -0.05, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "minesRemainingValue", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "minesRemainingValue", Menu3DDisplayAdjustmentTypes.FONT, 3);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "minesRemainingValue", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 1, 0);

        //  game difficulty value 
        this.menu3DParent.AddMenuText("menuOffset", "difficultyValue", "DIFFICULTY");
        this.menu3DParent.AdjustTextObject("menuOffset", "difficultyValue", Menu3DTransformAdjustmentTypes.POSITION, 0, -0.40, 0);
        this.menu3DParent.AdjustTextObject("menuOffset", "difficultyValue", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
        this.menu3DParent.AdjustTextDisplay("menuOffset", "difficultyValue", Menu3DDisplayAdjustmentTypes.FONT, 4);
        
        //button -> increase difficulty
        //  object
        this.menu3DParent.AddMenuObject("difficultyInc", Menu3DModelTypes.BUTTON_NARROW, "menuFrame");
        this.menu3DParent.AdjustMenuObject("difficultyInc", Menu3DTransformAdjustmentTypes.POSITION, 0.7, -0.4, 0);
        this.menu3DParent.AdjustMenuObject("difficultyInc", Menu3DTransformAdjustmentTypes.SCALE, 0.15, 0.15, 0.15);
        //  click event
        pointerEventsSystem.onPointerDown(
            {
                entity: this.menu3DParent.GetMenuObject("difficultyInc").entity,
                opts: 
                {
                    hoverText: "Increase Difficulty",
                    button: InputAction.IA_POINTER
                }
            },
            () => {
                this.ChangeDifficulty(1);
            }
        );
        //  label
        this.menu3DParent.AddMenuText("difficultyInc", "buttonLabel", "INCREASE");
        this.menu3DParent.AdjustTextObject("difficultyInc", "buttonLabel", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, -0.04);
        this.menu3DParent.AdjustTextObject("difficultyInc", "buttonLabel", Menu3DTransformAdjustmentTypes.SCALE, 2.2, 2.2, 1);
        this.menu3DParent.AdjustTextDisplay("difficultyInc", "buttonLabel", Menu3DDisplayAdjustmentTypes.FONT, 2);
        
        //button -> decrease difficulty
        //  object
        this.menu3DParent.AddMenuObject("difficultyDec", Menu3DModelTypes.BUTTON_NARROW, "menuFrame");
        this.menu3DParent.AdjustMenuObject("difficultyDec", Menu3DTransformAdjustmentTypes.POSITION, -0.7, -0.4, 0);
        this.menu3DParent.AdjustMenuObject("difficultyDec", Menu3DTransformAdjustmentTypes.SCALE, 0.15, 0.15, 0.15);
        //  click event
        pointerEventsSystem.onPointerDown(
            {
                entity: this.menu3DParent.GetMenuObject("difficultyDec").entity,
                opts: 
                {
                    hoverText: "Increase Difficulty",
                    button: InputAction.IA_POINTER
                }
            },
            () => {
                this.ChangeDifficulty(-1);
            }
        );
        //  label
        this.menu3DParent.AddMenuText("difficultyDec", "buttonLabel", "DECREASE");
        this.menu3DParent.AdjustTextObject("difficultyDec", "buttonLabel", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, -0.04);
        this.menu3DParent.AdjustTextObject("difficultyDec", "buttonLabel", Menu3DTransformAdjustmentTypes.SCALE, 2.2, 2.2, 1);
        this.menu3DParent.AdjustTextDisplay("difficultyDec", "buttonLabel", Menu3DDisplayAdjustmentTypes.FONT, 2);
        /*
        //button -> start game
        //  object
        this.menu3DParent.AddMenuObject("gameStart", 5, "menuFrame");
        this.menu3DParent.AdjustMenuObject("gameStart", 0, Vector3.create(0.25, -0.65, 0));
        this.menu3DParent.AdjustMenuObject("gameStart", 1, Vector3.create(0.15, 0.15, 0.15));
        //  click event
        pointerEventsSystem.onPointerDown(
            {
                entity: this.menu3DParent.GetMenuObject("gameStart").entity,
                opts: 
                {
                    hoverText: "Increase Difficulty",
                    button: InputAction.IA_POINTER
                }
            },
            () => {
                this.GameStart();
            }
        );
        //  label
        this.menu3DParent.AddMenuText("gameStart", "buttonLabel", "START");
        this.menu3DParent.AdjustTextObject("gameStart", "buttonLabel", 0, Vector3.create(0, 0, -0.04));
        this.menu3DParent.AdjustTextObject("gameStart", "buttonLabel", 1, Vector3.create(2.2, 2.2, 1));
        this.menu3DParent.AdjustTextDisplay("gameStart", "buttonLabel", 0, 2);
        */
        //button -> reset game
        //  object
        this.menu3DParent.AddMenuObject("gameReset", Menu3DModelTypes.BUTTON_NARROW, "menuFrame");
        this.menu3DParent.AdjustMenuObject("gameReset", Menu3DTransformAdjustmentTypes.POSITION, 0, -0.65, 0);
        this.menu3DParent.AdjustMenuObject("gameReset", Menu3DTransformAdjustmentTypes.SCALE, 0.15, 0.15, 0.15);
        //  click event
        pointerEventsSystem.onPointerDown(
            {
                entity: this.menu3DParent.GetMenuObject("gameReset").entity,
                opts: 
                {
                    hoverText: "Increase Difficulty",
                    button: InputAction.IA_POINTER
                }
            },
            () => {
                this.GameReset();
            }
        );
        //  label
        this.menu3DParent.AddMenuText("gameReset", "buttonLabel", "RESET");
        this.menu3DParent.AdjustTextObject("gameReset", "buttonLabel", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, -0.04);
        this.menu3DParent.AdjustTextObject("gameReset", "buttonLabel", Menu3DTransformAdjustmentTypes.SCALE, 2.2, 2.2, 1);
        this.menu3DParent.AdjustTextDisplay("gameReset", "buttonLabel", Menu3DDisplayAdjustmentTypes.FONT, 2);
    }

    /** redraws difficulty with given value */
    public UpdateDifficultyText(index:number)
    {
        this.menu3DParent.GetMenuObjectText("menuOffset", "difficultyValue").text = DifficultyData[index].ID;
    }
}