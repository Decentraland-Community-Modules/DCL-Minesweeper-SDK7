import { Animator, ColliderLayer, Entity, GltfContainer, InputAction, TextShape, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import { Vector3, Quaternion } from "@dcl/sdk/math";
import { TILE_TEXT_VALUE, TILE_TEXT_SIZE, TILE_TEXT_COLOUR, TILE_OBJECT, TILE_ANIMS } from "./config/minesweeper-display-config";

/*     MINESWEEPER TILE
    represents a single tile on the gameboard. holds data about
    whether the location is un/covered, is a mine, or is flagged.
    this component contains both the tile shape and text shape,
    when modifying the tile's model be aware of the requried rotation
    to correctly display the text. 

    
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: thecryptotrader69@gmail.com
*/
export class MinesweeperTile 
{
    //position of this tile on the gamefield
    posX:number = 0;
    posY:number = 0;
    //number of mines surround this tile
    threatCount:number = 0;

    //type of tile
    //  0: safe
    //  1: bomb
    type:number = 0;

    //state of this tile
    //  0:covered
    //  1:uncovered
    //  2:flagged
    state:number = 0;

    //tile entity
    tileEntity:Entity;
    //text object for the tile in world space
    countEntity:Entity;

    //callbacks
    //  called when tile is selected to be revealed
    public TileReveal: (tile:MinesweeperTile) => void = this.tileReveal;
    private tileReveal(tile:MinesweeperTile): void { console.log("minesweeper tile callback not set - reveal tile"); }
    //  called when tile is selected to be flagged
    public TileFlag: (tile:MinesweeperTile) => void = this.tileFlag;
    private tileFlag(tile:MinesweeperTile): void { console.log("minesweeper tile callback not set - flag time"); }

    //constructor
    //  sets up tile object/count text for use
    constructor(x:number, y:number)
    {
        //set position
        this.posX = x;
        this.posY = y;

        //create tile entity
        this.tileEntity = engine.addEntity();
        Transform.create(this.tileEntity,
        ({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(90, 0, 0)
        }));
        GltfContainer.create(this.tileEntity, {
            src: TILE_OBJECT,
            visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
            invisibleMeshesCollisionMask: undefined
        });

        //add animator
        Animator.create(this.tileEntity, {
            states:[
                { name: TILE_ANIMS[0], clip: TILE_ANIMS[0], playing: false, loop: false },
                { name: TILE_ANIMS[1], clip: TILE_ANIMS[1], playing: false, loop: false },
                { name: TILE_ANIMS[2], clip: TILE_ANIMS[2], playing: false, loop: false },
            ]
        });

        //primary action -> reveal tile
        pointerEventsSystem.onPointerDown(
            {
                entity: this.tileEntity,
                opts: 
                {
                    hoverText: "[E] Reveal Tile \n[F] Flag Tile",
                    button: InputAction.IA_ANY
                }
            },
            (e) => {
                if(e.button == 1) this.TileReveal(this);
                if(e.button == 2) this.TileFlag(this);
            }
        );

        //create tile threat count display text
        this.countEntity = engine.addEntity();
        Transform.create(this.countEntity,
        ({
            position: Vector3.create(0, 0, -0.11),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));
        Transform.getMutable(this.countEntity).parent = this.tileEntity;
        TextShape.create(this.countEntity);
    }

    /**
     * resets the tile to its default state, making it ready for a new game
     */
    public ResetTile()
    {
        //set default 
        this.type = 0;
        this.SetState(0);
        this.SetAnimationState(0);
        this.threatCount = 0;

        TextShape.getMutable(this.countEntity).text = "";
    }
    
    /**
     * updates the number of bombs around this tile, redrawing the count text
     * @param count number of surrounding tiles that contain bombs
     */
    public SetThreatCount(count:number)
    {
        this.threatCount = count;

        //update text (only if not a mine)
        if(this.type != 1)
        {
            TextShape.getMutable(this.countEntity).text = TILE_TEXT_VALUE[this.threatCount];
            TextShape.getMutable(this.countEntity).fontSize = TILE_TEXT_SIZE[this.threatCount];
            TextShape.getMutable(this.countEntity).textColor = TILE_TEXT_COLOUR[this.threatCount];
        }
        else
        {
            TextShape.getMutable(this.countEntity).text = "";
        }
    }

    /**
     * updates tile's state and visual display
     * @param state new target state
     */
    public SetState(state:number)
    {
        //record state
        this.state = state;
    }

    public SetAnimationState(state:number)
    {
        //update display state based on state
        Animator.getClip(this.tileEntity, TILE_ANIMS[0]).playing = false;
        Animator.getClip(this.tileEntity, TILE_ANIMS[1]).playing = false;
        Animator.getClip(this.tileEntity, TILE_ANIMS[2]).playing = false;

        Animator.getClip(this.tileEntity, TILE_ANIMS[state]).playing = true;
    }
}