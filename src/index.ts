import { engine, Transform, GltfContainer, ColliderLayer } from "@dcl/sdk/ecs";
import { MinesweeperManager } from "./minesweeper/minesweeper-manager";
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { Menu3DDisplayAdjustmentTypes, Menu3DModelTypes, Menu3DTransformAdjustmentTypes, MenuGroup3D } from "./utilities/menu-group-3D";

/*      MINESWEEPER INCLUSION EXAMPLE
    the code below demos how to import, initialize, and spawn
    a pair of minesweeper game-fields into your scene.

    Author: Alex Pazder, thecryptotrader69@gmail.com
*/

//position minesweeper board
MinesweeperManager.Instance.SetPosition(0,0,0);

//create environment
const envEntity = engine.addEntity();
Transform.create(envEntity,
({
    position: Vector3.create(0, 0, 0),
    scale: Vector3.create(1.5, 1.5, 1.5),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
}));
GltfContainer.create(envEntity, {
    src: 'models/sceneEnvironment.glb',
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
    invisibleMeshesCollisionMask: undefined
});

//create and position 3D info menu
const sceneMenu:MenuGroup3D = new MenuGroup3D();
sceneMenu.SetColour(Color4.create(1, 0, 1, 1));
sceneMenu.AdjustMenuParent(Menu3DTransformAdjustmentTypes.POSITION, -9, 2, 0);
sceneMenu.AdjustMenuParent(Menu3DTransformAdjustmentTypes.SCALE, 1.5, 1.5, 1.5);
sceneMenu.AdjustMenuParent(Menu3DTransformAdjustmentTypes.ROTATION, 0, 90, 0);
//display setup
//  main display object
sceneMenu.AddMenuObject("menuFrame", Menu3DModelTypes.PANEL_LONG);
sceneMenu.AdjustMenuObject("menuFrame", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0);
//  main display offset
sceneMenu.AddMenuObject("menuOffset", Menu3DModelTypes.EMPTY, "menuFrame");
sceneMenu.AdjustMenuObject("menuOffset", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0.0125);
//text content
//  info header
sceneMenu.AddMenuText("menuOffset", "infoHeader", "Welcome To SweetDreams.co");
sceneMenu.AdjustTextObject("menuOffset", "infoHeader", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.675, 0);
sceneMenu.AdjustTextObject("menuOffset", "infoHeader", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
sceneMenu.AdjustTextDisplay("menuOffset", "infoHeader", Menu3DDisplayAdjustmentTypes.FONT, 4);
//  info content
sceneMenu.AddMenuText("menuOffset", "infoContent",
    "Hello and welcome to the team [EMPLOYEE_NAME]!"+
    "\n\nAs an employee of SweetDreams.co your role is to oversee the maintenance of the primary mainframe, where inactive dreams are stored."+
    " Think of it as a virtual minefield filled with corrupt data nodes that should NOT be activated."+
    " Your task is to identify and mark these corrupt dream nodes for removal."+
    " Exercise caution and precision as you navigate through the grid, ensuring that you don't accidentally trigger any of these corrupt nodes as that will risk corrupting the rest of the data page."+
    " By carrying out these tasks, you will help maintain the integrity of our dream database and ensure our users can experience uninterrupted sweet dreams!");
sceneMenu.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.525, 0);
sceneMenu.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
sceneMenu.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.FONT, 2);
sceneMenu.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WIDTH, 6);
sceneMenu.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WRAPPING, 1);
sceneMenu.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 0, 1);


//create and position 3D info menu
const infoMenu0:MenuGroup3D = new MenuGroup3D();
infoMenu0.SetColour(Color4.create(1, 0, 1, 1));
infoMenu0.AdjustMenuParent(Menu3DTransformAdjustmentTypes.POSITION, -12.75, 2, -21);
infoMenu0.AdjustMenuParent(Menu3DTransformAdjustmentTypes.SCALE, 1.5, 1.5, 1.5);
infoMenu0.AdjustMenuParent(Menu3DTransformAdjustmentTypes.ROTATION, 0, 180, 0);
//display setup
//  main display object
infoMenu0.AddMenuObject("menuFrame", Menu3DModelTypes.PANEL_LONG);
infoMenu0.AdjustMenuObject("menuFrame", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0);
//  main display offset
infoMenu0.AddMenuObject("menuOffset", Menu3DModelTypes.EMPTY, "menuFrame");
infoMenu0.AdjustMenuObject("menuOffset", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0.0125);
//text content
//  info header
infoMenu0.AddMenuText("menuOffset", "infoHeader", "Welcome To SweetDreams.co");
infoMenu0.AdjustTextObject("menuOffset", "infoHeader", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.675, 0);
infoMenu0.AdjustTextObject("menuOffset", "infoHeader", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
infoMenu0.AdjustTextDisplay("menuOffset", "infoHeader", Menu3DDisplayAdjustmentTypes.FONT, 4);
//  info content
infoMenu0.AddMenuText("menuOffset", "infoContent",
    "Escape to a realm of celestial dreams with SweetDreams.co's revolutionary sci-fi sleeping pod."+
    " Step into a universe of serenity as our cutting-edge device cocoons you in unparalleled comfort and tranquility."+
    " Designed to transport you to galaxies far beyond imagination, our state-of-the-art sleeping pod effortlessly cradles your body, lulling you into a deep & rejuvenating slumber."+
    " Drift through stardust and surrender to the cosmic embrace of rest, as our advanced technology gently harmonizes with your every sleep need. Unleash the power of dreams and awaken to a universe of possibilities with SweetDreams.co, where your nocturnal odyssey begins."
    );
infoMenu0.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.45, 0);
infoMenu0.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
infoMenu0.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.FONT, 2);
infoMenu0.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WIDTH, 6);
infoMenu0.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WRAPPING, 1);
infoMenu0.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 0, 1);


//create and position 3D info menu
const infoMenu1:MenuGroup3D = new MenuGroup3D();
infoMenu1.SetColour(Color4.create(1, 0, 1, 1));
infoMenu1.AdjustMenuParent(Menu3DTransformAdjustmentTypes.POSITION, 0.75, 2, -21);
infoMenu1.AdjustMenuParent(Menu3DTransformAdjustmentTypes.SCALE, 1.5, 1.5, 1.5);
infoMenu1.AdjustMenuParent(Menu3DTransformAdjustmentTypes.ROTATION, 0, 180, 0);
//display setup
//  main display object
infoMenu1.AddMenuObject("menuFrame", Menu3DModelTypes.PANEL_LONG);
infoMenu1.AdjustMenuObject("menuFrame", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0);
//  main display offset
infoMenu1.AddMenuObject("menuOffset", Menu3DModelTypes.EMPTY, "menuFrame");
infoMenu1.AdjustMenuObject("menuOffset", Menu3DTransformAdjustmentTypes.POSITION, 0, 0, 0.0125);
//text content
//  info content
infoMenu1.AddMenuText("menuOffset", "infoContent",
    "PLEASE NOTE:"+
    "\n\nSweetDreams.co is not liable for any physical or mental discomfort experienced during or after the use of the sleeping pod. Users acknowledge that individual reactions may vary and SweetDreams.co cannot guarantee specific results or outcomes."+
    "The SweetDreams.co sleeping pod may not be suitable for everyone, including but not limited to individuals who are pregnant, have a pacemaker or other medical implants, suffer from epilepsy, or have a history of heart conditions. Users with such conditions are advised to refrain from using the sleeping pod."+
    "SweetDreams.co does not guarantee the effectiveness of the sleeping pod in treating or curing any medical conditions, including but not limited to insomnia, sleep disorders, or mental health conditions."
    );
infoMenu1.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.POSITION, 0, 0.735, 0);
infoMenu1.AdjustTextObject("menuOffset", "infoContent", Menu3DTransformAdjustmentTypes.SCALE, 0.4, 0.4, 1);
infoMenu1.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.FONT, 2);
infoMenu1.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WIDTH, 6);
infoMenu1.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.WRAPPING, 1);
infoMenu1.AdjustTextDisplay("menuOffset", "infoContent", Menu3DDisplayAdjustmentTypes.ALIGNMENT, 0, 1);