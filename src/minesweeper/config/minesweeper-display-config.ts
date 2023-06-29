/*      MINESWEEPER DISPLAY CONFIG
    contains settings for certain draw aspects within the game.
 
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: TheCryptoTrader69@gmail.com
*/
import { Color4 } from "@dcl/sdk/math";

/** */
export const TILE_OBJECT:string = "models/minesweeper/tile.glb";
export const TILE_ANIMS:string[] = ["anim_covered","anim_uncovered","anim_mine"];
export const FLAG_OBJECT:string = "models/minesweeper/tileFlag.glb";

/** game state display labels */ 
export const GAME_STATE_LABELS:string[] =
[
    "Uninitialized...", "Game Idle", "Game On-Going", "Game On-Going", "Game Won", "Game Lost"
];
/** game state display colours */
export const GAME_STATE_COLOURS:Color4[] = 
[
    Color4.Black(), Color4.Yellow(), Color4.Green(), Color4.Green(), Color4.Purple(), Color4.Red()
];

/** tile-text value, number of surrounding mines */  
export const TILE_TEXT_VALUE:string[] = 
[
    '', '1', '2',
    '3', '4', '5',
    '6', '7', '8'
];
/** tile-text size, can be individually scaled */
export const TILE_TEXT_SIZE:number[] =
[
    12, 12, 12, 
    12, 12, 12, 
    12, 12, 12
];
/** tile-text colour, can be individually set */
export const TILE_TEXT_COLOUR:Color4[] = 
[
    Color4.White(), Color4.Blue(), Color4.Green(),
    Color4.Yellow(), Color4.Red(), Color4.Red(),
    Color4.Red(), Color4.Red(), Color4.Red()
];