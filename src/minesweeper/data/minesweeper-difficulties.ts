/*      MINESWEEPER DIFFICULTIES
    contains all definitions for each difficulty included in the game. 
 
    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: TheCryptoTrader69@gmail.com
*/
/**interface defining a single difficulty's components*/
interface DifficultyContainer {
    ID: string;         //unique ID, used as difficulty label
    MinesBase: number;  //guarenteed percentage count of mines
    MinesMod: number;   //variance for number of mines
}
/** definitions for all difficulties included in the game*/
export const DifficultyData: DifficultyContainer[] =
[
    {
        ID: "Childish",
        MinesBase: 0.08, 
        MinesMod: 0.02
    },
    {
        ID: "Easy",
        MinesBase: 0.10, 
        MinesMod: 0.02
    },
    {
        ID: "Standard",
        MinesBase: 0.12, 
        MinesMod: 0.02
    },
    {
        ID: "Hard",
        MinesBase: 0.15, 
        MinesMod: 0.03
    },
    {
        ID: "Nightmare",
        MinesBase: 0.20, 
        MinesMod: 0.03
    },
]