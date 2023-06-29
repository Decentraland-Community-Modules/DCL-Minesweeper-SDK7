/*     GAME MANAGER
    this module is used to manage the initialization and processing
    of the minesweeper game field. the bulk of functionality can be found
    within this file, including: game-field generation, tile uncovering, and
    game-state change mechanics. 

    all game components are parented below this module, so if you wish to remove
    the minesweeper field from your game during runtime all that has to be done is
    toggle/destroy this one object.

    
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: thecryptotrader69@gmail.com
*/

import { ColliderLayer, Entity, GltfContainer, Transform, TransformType, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { DifficultyData } from "./data/minesweeper-difficulties";
import { MinesweeperMenu } from "./minesweeper-menu";
import Dictionary from "../utilities/collections";
import { MinesweeperTile } from "./minesweeper-tile";
import { TimerDisplayManager, TimerDisplaySystem } from "./timer-display-system";
import { MinesweeperFlag, MinesweeperFlagPool } from "./minesweeper-flag";
import { GAME_STATE_COLOURS, GAME_STATE_LABELS } from "./config/minesweeper-display-config";
import { AudioManager } from "../utilities/audio-manager";

export class MinesweeperManager
{
  //debugging setting
  public static IsDebugging:boolean = true;

  //access pocketing
  private static instance:undefined|MinesweeperManager;
  public static get Instance():MinesweeperManager
  {
      //ensure instance is set
      if(MinesweeperManager.instance === undefined)
      {
        MinesweeperManager.instance = new MinesweeperManager();
      }

      return MinesweeperManager.instance;
  }

  //parent for all board objects 
  private boardParentObject:Entity;
  private boardParentTransform:TransformType;
  //board's menu system
  private menuObject:MinesweeperMenu;
  private menuObjectTransform:TransformType;
  //board's flag pool
  private flagPool:MinesweeperFlagPool;
  //audio manager
  private audioManager:AudioManager;
  //board's timer system
  private timerSystem:TimerDisplayManager;

  /* GAME STATES & STATS */
  //  game states: 
  //    0 ilde: a game has not started/ended
  //    1 starting: game is waiting for players to register
  //    2 pre-gen session: game is waiting for player to click first tile before
  //  map is generated, prevents player from dying on first move
  //    3 post-gen session: map has been generated and game is being played
  gameState:number = 0;
  public SetGameState(value:number)
  {
    this.gameState = value;

    //update ui
    this.menuObject.menu3DParent.GetMenuObjectText("menuOffset", "gameStateValue").text = GAME_STATE_LABELS[this.gameState];
    this.menuObject.menu3DParent.GetMenuObjectText("menuOffset", "gameStateValue").textColor = GAME_STATE_COLOURS[this.gameState];

    //dis/able timer
    //  first click/game map is generated -> start timer
    if(this.gameState == 3)
    {
      this.timerSystem.SetState(true);
    }
    //  game end (win/loss) -> end timer
    else if(this.gameState == 4 || this.gameState == 5)
    {
      this.timerSystem.SetState(false);
    }
    //  clear timer feed
    else
    {
      this.timerSystem.SetState(false);
      this.timerSystem.ClearDisplay();
    }
  }

  //GAME SETTINGS
  //  current game difficulty
  private difficulty:number = 0;
  /** sets a new difficulty for the game board */
  public CallbackChangeDifficulty(value:number) { MinesweeperManager.Instance.ChangeDifficulty(value); }
  public ChangeDifficulty(value:number) { this.SetDifficulty(this.difficulty + value); } 
  public SetDifficulty(value:number) 
  {
    this.difficulty = value;
    
    //leash difficulties, roll over
    if(this.difficulty < 0) this.difficulty = DifficultyData.length-1;
    else if(this.difficulty >= DifficultyData.length) this.difficulty = 0;

    //restart the game
    this.ResetGameBoardTiles();

    //update ui
    this.menuObject.menu3DParent.GetMenuObjectText("menuOffset", "difficultyValue").text = DifficultyData[this.difficulty].ID;
  }
  //size of gameboard to be generated
  boardTileCountX:number = 10;
  boardTileCountY:number = 10;
  //  base scale of the game board
  tileBaseSizeX:number = 4;
  tileBaseSizeY:number = 4;
  //  spacing between each tile
  tileSpacingX:number = 2; 
  tileSpacingY:number = 2;

  //total number of tiles on the field
  tileCountTotal:number = 0;
  //current number of tiles uncovered
  tileCountUncovered:number = 0;

  //total number of mines on the field
  bombCountTotal:number = 0;
  //current number of correctly sited mines
  bombCountCorrect:number = 0;
  /** calculated mine count based on the current settings */
  calculateMineCount(): number 
  {
    return Math.round
    (
      (this.tileCountTotal * DifficultyData[this.difficulty].MinesBase) 
      + (Math.floor(Math.random() * (this.tileCountTotal * DifficultyData[this.difficulty].MinesMod)))
    );
  }

  //current number of flags used
  flagCount:number = 0;
  public SetFlagCount(value:number)
  {
    this.flagCount = value;

    //update ui
    this.menuObject.menu3DParent.GetMenuObjectText("menuOffset", "minesRemainingValue").text = (this.bombCountTotal - this.flagCount).toString();
  }

  //timer start/end dates
  date_start:Date = new Date();
  date_end:Date = new Date();
  date_score_value_raw:number = 0;
  date_score_value_minutes:string = "";
  date_score_value_seconds:string = "";

  //board frame objects
  boardFrameBase:Entity;
  boardFrameBaseTransform:TransformType;
  boardFrameSides:Entity[];
  boardFrameSidesTransform:TransformType[];
  boardFrameCorners:Entity[];
  boardFrameCornersTransform:TransformType[];

  //collection of all exsisting tile
  boardTileDict:Dictionary<MinesweeperTile>; 
  getTileIndex(x:number, y:number):string { return x+"_"+y; }
  getTile(x:number, y:number):MinesweeperTile { return this.boardTileDict.getItem(this.getTileIndex(x,y)); }
  doesTileExist(x:number, y:number):boolean { return this.boardTileDict.containsKey(this.getTileIndex(x,y)); }

  /**
   * changes the position of the board
   */
  public SetPosition(x:number, y:number, z:number)
  {
    Transform.getMutable(this.boardParentObject).position = Vector3.create(x, y, z);
  }

  /**
   * changes the grid size (number of tiles) of the game board
   * @param x new board width
   * @param y new board breadth
   */
  private SetMapSize(x:number, y:number)
  {
    //redefine stage size
    this.boardTileCountX = x;
    this.boardTileCountY = y;

    //reposition menu
    this.menuObjectTransform.position = this.CalculatePosition((this.boardTileCountX/2)-0.5,this.boardTileCountY);
    this.menuObjectTransform.position.y = 1.5;

    //update barrier
    this.AlignBarrier();

    //regenerate object map
    this.GenerateGameBoardTiles();
  }

  /**
   * changes the base size (dimensions) of the game board
   * @param x new board width
   * @param y new board breadth
   */
  private SetBaseScale(x:number, y:number)
  {
    //assign values
    this.tileBaseSizeX = x;
    this.tileBaseSizeY = y;

    //reposition menu
    this.menuObjectTransform.position = this.CalculatePosition((this.boardTileCountX/2)-0.5,this.boardTileCountY);
    this.menuObjectTransform.position.y = 1.5;

    //update barrier
    this.AlignBarrier();

    //regenerate object map
    //this.GenerateMapObject();
  }

  /**
   * initializes manager, creating menus, materials, then generates map objects
   */
  constructor()
  {
    if(MinesweeperManager.IsDebugging) { console.log("Minesweeper Manager: game board initializing..."); }

    //create board parent object
    this.boardParentObject = engine.addEntity();
    this.boardParentTransform = Transform.create(this.boardParentObject,
    ({
        position: Vector3.create(0, 0, 0),
        scale: Vector3.create(1.2, 1.2, 1.2),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    }));
    
    //create board menus
    this.menuObject = new MinesweeperMenu();
    this.menuObjectTransform = Transform.getMutable(this.menuObject.menu3DParent.groupParent);
    this.menuObjectTransform.parent = this.boardParentObject;
    this.menuObjectTransform.position = Vector3.create(0,1.5,8);

    //create flag pool
    this.flagPool = new MinesweeperFlagPool();
    
    //create audio manager
    this.audioManager = new AudioManager();
    Transform.getMutable(this.audioManager.parentEntity).parent = this.boardParentObject;

    //setup callbacks
    this.menuObject.GameStart = this.CallbackStartGame;
    this.menuObject.GameReset = this.CallbackResetGame;
    this.menuObject.ChangeDifficulty = this.CallbackChangeDifficulty;

    //create timer display system
    this.timerSystem = new TimerDisplayManager(this.menuObject.menu3DParent.GetMenuTextObject("menuOffset","timerCurValue"));

    //create collections
    this.boardTileDict = new Dictionary<MinesweeperTile>();

    //create frame objects
    //  base
    this.boardFrameBase = engine.addEntity();
    this.boardFrameBaseTransform = Transform.create(this.boardFrameBase,
    ({
        position: Vector3.create(0, 0, 0),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    }));
    Transform.getMutable(this.boardFrameBase).parent = this.boardParentObject;
    GltfContainer.create(this.boardFrameBase, {
        src: "models/minesweeper/barrierBase.glb",
        visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
        invisibleMeshesCollisionMask: undefined
    });
    //  sides
    this.boardFrameSides = [];
    this.boardFrameSidesTransform = [];
    for (let i = 0; i < 4; i++) 
    {
      this.boardFrameSides.push(engine.addEntity());
      this.boardFrameSidesTransform.push(Transform.create(this.boardFrameSides[i],
      ({
          position: Vector3.create(0, 1, 0),
          scale: Vector3.create(1, 1, 1),
          rotation: Quaternion.fromEulerDegrees(0,(-90*i)+90,0)
      })));
      this.boardFrameSidesTransform[i].parent = this.boardParentObject;
      GltfContainer.create(this.boardFrameSides[i], {
          src: "models/minesweeper/barrierSide.glb",
          visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
          invisibleMeshesCollisionMask: undefined
      });
    }
    //  corners
    this.boardFrameCorners = [];
    this.boardFrameCornersTransform = [];
    for (let i = 0; i < 4; i++) 
    {
      this.boardFrameCorners.push(engine.addEntity());
      this.boardFrameCornersTransform.push(Transform.create(this.boardFrameCorners[i],
      ({
          position: Vector3.create(0, 1, 0),
          scale: Vector3.create(1, 1, 1),
          rotation: Quaternion.fromEulerDegrees(0,-(90*i),0)
      })));
      this.boardFrameCornersTransform[i].parent = this.boardParentObject;
      GltfContainer.create(this.boardFrameCorners[i], {
          src: "models/minesweeper/barrierCorner.glb",
          visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
          invisibleMeshesCollisionMask: undefined
      });
    }

    //  generate map
    this.SetMapSize(19,19);
    this.SetBaseScale(4,4);

    //set difficulty to median
    this.SetDifficulty(2);

    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: game board initialized!"); }
  }

  /**
   * sets the visibility state of the object, adding or removing it from the game scene
   * @param state new visibility state
   */
  public SetDisplayState(state:boolean)
  {
    if(state) { this.menuObjectTransform.scale = Vector3.One(); }
    else { this.menuObjectTransform.scale = Vector3.Zero(); }
  }

  /**
   * places barrier objects in accordance the map scale
   */
  public AlignBarrier()
  {
    //place border objects
    //  base
    this.boardFrameBaseTransform.scale.x = (this.tileSpacingX * this.boardTileCountX * 0.5) * (this.tileBaseSizeX/this.boardTileCountX);
    this.boardFrameBaseTransform.scale.z = (this.tileSpacingY * this.boardTileCountY * 0.5) * (this.tileBaseSizeY/this.boardTileCountY);
    //  sides
    this.boardFrameSidesTransform[0].position = this.CalculatePosition(this.boardTileCountX, (this.boardTileCountY/2)-0.5);
    this.boardFrameSidesTransform[0].scale = this.CalculateScale();
    this.boardFrameSidesTransform[0].scale.x = (this.tileSpacingX * this.boardTileCountX * 0.5) * (this.tileBaseSizeX/this.boardTileCountX);
    
    this.boardFrameSidesTransform[1].position = this.CalculatePosition((this.boardTileCountX/2)-0.5, this.boardTileCountY);
    this.boardFrameSidesTransform[1].scale = this.CalculateScale();
    this.boardFrameSidesTransform[1].scale.x = (this.tileSpacingY * this.boardTileCountY * 0.5) * (this.tileBaseSizeY/this.boardTileCountY);
    
    this.boardFrameSidesTransform[2].position = this.CalculatePosition(-1, (this.boardTileCountY/2)-0.5);
    this.boardFrameSidesTransform[2].scale = this.CalculateScale();
    this.boardFrameSidesTransform[2].scale.x = (this.tileSpacingX * this.boardTileCountX * 0.5) * (this.tileBaseSizeX/this.boardTileCountX);
    
    this.boardFrameSidesTransform[3].position = this.CalculatePosition((this.boardTileCountX/2)-0.5, -1);
    this.boardFrameSidesTransform[3].scale = this.CalculateScale();
    this.boardFrameSidesTransform[3].scale.x = (this.tileSpacingY * this.boardTileCountY * 0.5) * (this.tileBaseSizeY/this.boardTileCountY);
    //  corner
    this.boardFrameCornersTransform[0].position = this.CalculatePosition(this.boardTileCountX, this.boardTileCountY);
    this.boardFrameCornersTransform[0].scale = this.CalculateScale();

    this.boardFrameCornersTransform[1].position = this.CalculatePosition(-1, this.boardTileCountY);
    this.boardFrameCornersTransform[1].scale = this.CalculateScale();

    this.boardFrameCornersTransform[2].position = this.CalculatePosition(-1, -1);
    this.boardFrameCornersTransform[2].scale = this.CalculateScale();

    this.boardFrameCornersTransform[3].position = this.CalculatePosition(this.boardTileCountX, -1);
    this.boardFrameCornersTransform[3].scale = this.CalculateScale();
  }

  /**
   * generates the field of tiles for the minesweeper game,
   * no data for mines per-tile is generated at this point
   */
  public GenerateGameBoardTiles()
  {
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: generating board tile objects..."); }

    //spawn tiles onto map
    for (let y = 0; y < this.boardTileCountY ; y++) 
    {
      for (let x = 0; x < this.boardTileCountX ; x++) 
      {
        //create tile
        const tile:MinesweeperTile = new MinesweeperTile(x, y);
        Transform.getMutable(tile.tileEntity).parent = this.boardParentObject;

        //position object
        Transform.getMutable(tile.tileEntity).position = this.CalculatePosition(x,y);
        Transform.getMutable(tile.tileEntity).position.y = 0;
        Transform.getMutable(tile.tileEntity).scale.x = this.CalculateScale().x;
        Transform.getMutable(tile.tileEntity).scale.y = this.CalculateScale().z;

        //callbacks
        tile.TileReveal = this.CallbackRevealTile;
        tile.TileFlag = this.CallbackFlagTile;

        //add to registry
        this.boardTileDict.addItem(this.getTileIndex(x,y), tile);
      }
    }

    //reset game board with new tile size
    this.ResetGameBoardTiles();

    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: board tile objects generated!"); }
  }

  /**
   * starts the game
   */
  public CallbackStartGame() { MinesweeperManager.Instance.SetGameState(1); }

  /**
   * resets all exsisting tiles on the board
   */
  public CallbackResetGame() { MinesweeperManager.Instance.ResetGameBoardTiles(); }
  public ResetGameBoardTiles()
  {
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: resetting game board..."); }

    this.SetGameState(2);
    
    //randomize number of mines
    this.tileCountTotal = this.boardTileCountX * this.boardTileCountY;
    this.bombCountTotal = this.calculateMineCount();

    //reset game values
    this.tileCountUncovered = 0;
    this.bombCountCorrect = 0;
    this.SetFlagCount(0);
    
    //clear any flags
    this.flagPool.ResetPool();

    //process each tile currently in the dict
    for (let y = 0; y < this.boardTileCountY ; y++) 
    { 
      for (let x = 0; x < this.boardTileCountX ; x++) 
      {
        this.getTile(x,y).ResetTile();
      }
    }

    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: game board reset!"); }
  }

  /**
   * starts the game
   */
  public CallbackEndGame(isVictory:boolean) { MinesweeperManager.Instance.EndGame(isVictory); }
  public EndGame(isVictory:boolean)
  {
    //halt timer


    //game ended in victory
    if(isVictory)
    {
      this.SetGameState(4);
      this.audioManager.PlayAudio(0);
    }
    //game ended in defeat
    else
    {
      //display all bombs on the board
      for (let y = 0; y < this.boardTileCountY ; y++) 
      { 
        for (let x = 0; x < this.boardTileCountX ; x++) 
        {
          const tile = this.getTile(x,y);
          if(tile.type == 1) 
          {
            tile.SetAnimationState(2);
            console.log("test");
          }
        }
      }

      this.SetGameState(5);
      this.audioManager.PlayAudio(1);
    }
  }

  /**
   * removes all exsisting tiles from the board and collection anchors,
   * use this to cut down on scene resources if the minesweeper board is going to be stashed for a while
   * or before changing board sizes
   */
  public RemoveGameBoardTiles()
  {
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: removing all tiles..."); }
    //process each tile currently in the dict
    for (let y = 0; y < this.boardTileCountY ; y++) 
    { 
      for (let x = 0; x < this.boardTileCountX ; x++) 
      {
        //remove tile from collection and engine
        const curTile:MinesweeperTile = this.getTile(x,y);
        this.boardTileDict.removeItem(this.getTileIndex(x,y));
        engine.removeEntity(curTile.tileEntity);
      }
    }
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: all tiles removed."); }
  }

  private randBombsToPlace:number = 0;
  private randTileX:number = 0;
  private randTileY:number = 0;
  /**
   * generates the data map for the minesweeper game,
   * we generate the data map from the tile the player
   * selects to ensure they can never select a mine first
   * @param startTile 
   */
  public GenerateMapData(startTile:MinesweeperTile)
  {
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: Generating of map data..."); }

    //calculate and place explosives
    this.randBombsToPlace = this.bombCountTotal;
    var randTile:MinesweeperTile;

    //place all bombs bombs until
    while(this.randBombsToPlace > 0)
    {
      //grab a random tile
      this.randTileX = Math.floor(Math.random() * this.boardTileCountX);
      this.randTileY = Math.floor(Math.random() * this.boardTileCountY);
      randTile = this.getTile(this.randTileX,this.randTileY);

      //if that location is not already a mine and is not the starting position
      if(randTile.type != 1 && randTile != startTile)
      {
        this.getTile(this.randTileX,this.randTileY).type = 1;
        this.randBombsToPlace--;
      }
    }

    //calculate number of neighbouring bombs for each tile
    for (let y = 0; y < this.boardTileCountY ; y++) 
    { 
      for (let x = 0; x < this.boardTileCountX ; x++) 
      {
        //reset counter
        var count:number = 0;

        //count bombs
        for (let offset_y = -1; offset_y < 2 ; offset_y++) 
        { 
          for (let offset_x = -1; offset_x < 2 ; offset_x++) 
          {
            //ensure tile exists (can over reach on borders)
            if(this.boardTileDict.containsKey(this.getTileIndex(x+offset_x,y+offset_y)) == true)
            {
              //add to current count if tile is a bomb
              if(this.getTile(x+offset_x,y+offset_y).type == 1) count++;
            }
          }
        }

        //assign number of bombs
        this.boardTileDict.getItem(this.getTileIndex(x,y)).SetThreatCount(count);
      }
    }

    //change game state
    this.SetGameState(3);
    if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: Generation of map data complete."); }
  }

  //updates the timer display text with an accurate value of the game's runtime
  //  while the timer is running it seems to lose/gain time depending on framerate
  //  usually it is only between +/-5%, but if the window is not in-focus the difference
  //  can end up being significantly larger
  //we get around this by calculating the time difference from the start and end timestamps
  //  date difference ratio: 1 second = 100
  public UpdateTimerDisplay()
  {
    /*//get difference value, reduced for display purposes
    this.date_score_value_raw = parseInt(((this.date_end.valueOf() - this.date_start.valueOf())/100).toString());
    this.date_score_value_minutes = (Math.floor(this.date_score_value_raw/600)).toString();
    this.date_score_value_seconds = (this.date_score_value_raw).toString();
    //ensure buffer zeroes
    while(this.date_score_value_minutes.length < 2)
    {
      this.date_score_value_minutes = "0" + this.date_score_value_minutes;
    }
    while(this.date_score_value_seconds.length < 3)
    {
      this.date_score_value_seconds = "0" + this.date_score_value_seconds;
    }

    this.menu_object_timer_text.getComponent(TextShape).value = "Time: " + this.date_score_value_minutes + ":" + this.date_score_value_seconds;
  */}

  /**
   * attempts to uncover the given tile
   * @param tile tile being processed for reveal
   * @param snowball whether the reveal effect will roll over to nearby tiles
   */
  public CallbackRevealTile(tile:MinesweeperTile) { MinesweeperManager.Instance.RevealTile(tile); }
  public RevealTile(tile:MinesweeperTile, snowball:boolean = false)
  {
    //check for pre-gen state
    //  ensures player cannot click on a mine on the first reveal
    if(this.gameState == 2) this.GenerateMapData(tile);

    //ensure game is in-session/interaction is allowed
    if(this.gameState != 3)
    { 
      if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: failed to uncover tile, game not in session"); }
      return;
    }
  
    //ensure tile is not covered
    if(tile.state == 0)
    {
      //if this tile is a mine
      if(tile.type == 1)
      {
        if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: tile ("+tile.posX.toString()+"," +tile.posY.toString()+") is a mine: you lost!"); }      
        
        //end game as a loss
        this.EndGame(false);
        return;
      }
      //if tile is not a mine
      else if(tile.type == 0)
      {
        if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: tile ("+tile.posX.toString()+"," +tile.posY.toString()+") has been uncovered"); }

        //update tile state
        tile.SetState(1);
        tile.SetAnimationState(1);

        //increase number of uncovered tiles
        this.tileCountUncovered++;
      }
    }
    else 
    { 
      if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: tile ("+tile.posX.toString()+"," +tile.posY.toString()+") is already uncovered"); }
    }

    //snowball reveal
    //check all neighbours for empty blocks
    //  NOTE: i don't know the limitations for the system, so we only
    //  check the blocks directly nearby the targeted block instead of
    //  recurssively checking ALL tiles down the chain
    for (let offset_y = -1; offset_y < 2 ; offset_y++) 
    { 
      for (let offset_x = -1; offset_x < 2 ; offset_x++) 
      {
        //skip if this is the current/central tile
        if(offset_x == 0 && offset_y == 0) continue;
        
        //ensure tile exists
        if(!this.doesTileExist(tile.posX+offset_x,tile.posY+offset_y)) continue;
        const snowTile = this.getTile(tile.posX+offset_x,tile.posY+offset_y);
        
        //ensure tile is covered/unflagged
        if(snowTile.state != 0) continue;
        
        //ensure core tile and snow tile have no surrounding bombs 
        if(tile.threatCount != 0 && snowTile.threatCount != 0) continue;
        
        //check if tile is covered and nearby bombs
        if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: snow-ball reveal tile:"+snowTile.posX.toString()+"," +snowTile.posY.toString()); }

        //uncover tile
        tile.SetState(1);
        tile.SetAnimationState(1);

        //increase number of uncovered tiles
        this.tileCountUncovered++;

        //if snow tile has no threat, reveal all other tiles around it
        if(snowTile.threatCount == 0) this.RevealTile(snowTile, true);
        //if snow tile has a threat, only reveal that tile
        else this.RevealTile(snowTile, true);
      }
    }
  }

  /**
   * toggles the flag on the targeted flag
   * @param tile targeted tile
   */
  public CallbackFlagTile(tile:MinesweeperTile) { MinesweeperManager.Instance.FlagTile(tile); }
  public FlagTile(tile:MinesweeperTile)
  {
    //ensure game is on-going
    if(this.gameState != 3) 
    { 
      if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: failed to flag tile, game not in session"); }
      return;
    }

    //ensure tile is not uncovered
    if(tile.state == 1) return;

    //if tile is not flagged and flags remain
    if(tile.state != 2 && this.flagCount < this.bombCountTotal)
    {
      if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: flagging tile "+tile.posX.toString()+","+tile.posX.toString()+"..."); }

        //flag tile
        tile.SetState(2);

        //move flag to tile
        const flag:MinesweeperFlag = this.flagPool.SetFlag(this.getTileIndex(tile.posX, tile.posY));
        Transform.getMutable(flag.entity).parent = tile.tileEntity;

        //increase number of flags used
        this.SetFlagCount(this.flagCount+1);

        //check if this tile has a mine
        if(tile.type == 1)
        {
          //increase the number of correctly flagged tiles
          this.bombCountCorrect++;
          //check win condition
          if(this.bombCountCorrect == this.bombCountTotal)
          {
            this.EndGame(true);
          }
        }

        if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: tile flagged "+tile.posX.toString()+","+tile.posX.toString()+"!"); }
    }
    //currently flagged
    else if(tile.state == 2)
    {
      if(MinesweeperManager.IsDebugging){ console.log("Minesweeper Manager: unflagging tile "+tile.posX.toString()+","+tile.posX.toString()+"..."); }
        
      //flag tile
      tile.SetState(0);
      
      //move flag to tile
      this.flagPool.RemoveFlag(this.getTileIndex(tile.posX, tile.posY));
      
      //decrease number of flags used
      this.SetFlagCount(this.flagCount-1);

      //check if this tile has a mine
      if(tile.type == 1)
      {
        //decrease the number of correctly flagged tiles
        this.bombCountCorrect--;
      }
    }
  }
  
  //returns the position of a tile based on the given coord
  public CalculatePosition(x:number, y:number)
  {
    return Vector3.create
    (
      (((x+0.5) * this.tileSpacingX) - (this.tileSpacingX * this.boardTileCountX * 0.5)) * (this.tileBaseSizeX/this.boardTileCountX), 
      0, 
      (((y+0.5) * this.tileSpacingY) - (this.tileSpacingY * this.boardTileCountY * 0.5)) * (this.tileBaseSizeY/this.boardTileCountY)
    );
  }
  
  //returns the scale of a tile
  public CalculateScale()
  {
    return Vector3.create
    (
      (this.tileBaseSizeX/this.boardTileCountX), 
      1, 
      (this.tileBaseSizeY/this.boardTileCountY)
    );
  }
}