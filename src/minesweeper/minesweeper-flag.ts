/*     FLAG POOLING
    system used to create flags for tiles, at the start of 
    the game all possible flags are spawned in and parented
    or placed as needed
    
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: thecryptotrader69@gmail.com
*/

import { ColliderLayer, Entity, GltfContainer, Transform, TransformType, engine } from "@dcl/sdk/ecs";
import { Dictionary, List } from "../utilities/collections";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { FLAG_OBJECT } from "./config/minesweeper-display-config";
export class MinesweeperFlagPool
{
    //current size of the pool
    public get PoolSize():number { return this.flagList.size(); };
    
    //collection of all exsisting tile
    flagList = new List<MinesweeperFlag>();
    flagDict = new Dictionary<MinesweeperFlag>();
    //collection of all flags applied on tiles, index is tile's index
    activeList = new List<MinesweeperFlag>();
    activeDict = new Dictionary<MinesweeperFlag>();
    
    //parental object
    parentObject:Entity;

    constructor()
    {
        //create parent object
        this.parentObject = engine.addEntity();
        Transform.create(this.parentObject,
        ({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));

        //create collections
        this.flagList = new List<MinesweeperFlag>();
        this.flagDict = new Dictionary<MinesweeperFlag>();
        this.activeList = new List<MinesweeperFlag>();
        this.activeDict = new Dictionary<MinesweeperFlag>();
    }

    /**
     * resets all flags in the pool, disabling their display
     */
    public ResetPool()
    {
        //clear all in-use flags
        for(let i:number = 0; i < this.activeList.size(); i++)
        {
            this.activeList.getItem(i).SetState(false);
            Transform.getMutable(this.activeList.getItem(i).entity).parent = this.parentObject;
        }

        //grab new collections (hopefully DCL is using Unity's garbage clean-up...)
        this.activeList = new List<MinesweeperFlag>();
        this.activeDict = new Dictionary<MinesweeperFlag>();
    }

    /**
     * returns the next free flag
     */
    public GetNextFlag():MinesweeperFlag
    {
        //check for free existing flag
        for(let i:number = 0; i < this.PoolSize; i++)
        {
            //check if flag is in-use
            if(!this.flagList.getItem(i).InUse) return this.flagList.getItem(i);
        }

        //if no free flag can be found, create a new one
        const flag:MinesweeperFlag = new MinesweeperFlag();

        //add to collection
        this.flagList.addItem(flag);
        this.flagDict.addItem((this.PoolSize-1).toString(), flag);

        return flag;
    }

    /**  
     * enables a flag and assigns it to the given tile
     * NOTE: this does not set the position of the flag
     */
    public SetFlag(index:string): MinesweeperFlag
    {
        //get a free flag
        const flag:MinesweeperFlag = this.GetNextFlag();

        //enable flag
        flag.SetState(true);

        //add to placement tracking
        this.activeList.addItem(flag);
        this.activeDict.addItem(index, flag);

        return flag;
    }

    /**
     * removes a flag from the given tile
     */
    public RemoveFlag(index:string): MinesweeperFlag
    {
        //get targeted flag
        const flag:MinesweeperFlag = this.activeDict.getItem(index);
        Transform.getMutable(flag.entity).parent = this.parentObject;

        //disable flag
        flag.SetState(false);

        //remove from placement tracking
        this.activeList.removeItem(flag);
        this.activeDict.removeItem(index);

        return flag;
    }
}

/**
 * pooled flag object used to visibly display whether a tile has been flagged by the player
 */
export class MinesweeperFlag 
{
    //true if flag is currently being used
    public InUse:boolean = false;
    
    //flag display object
    public entity:Entity;
    public entityTransform:TransformType;

    constructor()
    {
        //create tile object
        this.entity = engine.addEntity();
        this.entityTransform = Transform.create(this.entity,
        ({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));

        //create flag shape
        GltfContainer.create(this.entity, {
            src: FLAG_OBJECT,
            visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
            invisibleMeshesCollisionMask: undefined
        });
    }

    /** sets the flag use state, modifying dislay object visibility */
    public SetState(state:boolean)
    {
        this.InUse = state;

        if(this.InUse) this.entityTransform.scale = Vector3.One();
        else this.entityTransform.scale = Vector3.Zero();
    }
}