import { Entity, Transform, engine, TextShape, GltfContainer, ColliderLayer, Font, PBTextShape, TextAlignMode } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color4 } from "@dcl/sdk/math";
import { Dictionary, List } from "../utilities/collections";

/** menu display types */
export enum Menu3DModelTypes
{
    //empty
    EMPTY = "",
    //panels
    PANEL_SQUARE = "models/utilities/Menu3D_Panel_Square.glb",
    PANEL_LONG = "models/utilities/Menu3D_Panel_Long.glb",
    //buttons
    BUTTON_SQUARE = "models/utilities/Menu3D_Button_Square.glb",
    BUTTON_LONG = "models/utilities/Menu3D_Button_Long.glb",
    BUTTON_NARROW ="models/utilities/Menu3D_Button_Narrow.glb",
}
/** menu object transform adjustment types */
export enum Menu3DTransformAdjustmentTypes
{
    POSITION,
    ROTATION,
    SCALE,
}
/** menu text display adjustment types */
export enum Menu3DDisplayAdjustmentTypes
{
    FONT,
    LINESPACING,
    ALIGNMENT,
    WIDTH,
    HEIGHT,
    WRAPPING
}

/*      MENU GROUP 3D
    used to create a 3d menu group in the game scene. menu objects can be created and 
    organized through an instance of this manager.

    the menu group and toggle button are placed as parents of the object given, all
    menu objects are parented onto the menu group, and all text shape entities are
    parented to those menu objects.

    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: TheCryptoTrader69@gmail.com
*/
export class MenuGroup3D  {
    /** parental object for menu group, holds all associated menu objects */
    public groupParent: Entity;
    
    /** menu's current colour */
    private textColour: Color4 = Color4.Black();

    /** list of all attached menu objects */
    private menuObjectList: List<MenuObject3D>;
    /** dict of all attached menu objects, key is object's name */
    private menuObjectDict: Dictionary<MenuObject3D>;

    //constructor
    constructor() {
        //create group parent
        this.groupParent = engine.addEntity();
        Transform.create(this.groupParent,
        ({
            position: Vector3.create(8, 1, 8), //defaults to center of parcel
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));

        //initialize collections
        this.menuObjectList = new List<MenuObject3D>();
        this.menuObjectDict = new Dictionary<MenuObject3D>();
    }
    
    /**
     * sets display state of the menu group
     * @param state new display state for menu
     */
    public SetMenuState(state: boolean) {
        //TODO: replace when you can hide/change visibility of entities again
        //enable menu
        if (state)
        {
            Transform.getMutable(this.groupParent).scale = Vector3.One(); 
        }
        //disable menu
        else 
        {
            Transform.getMutable(this.groupParent).scale = Vector3.Zero(); 
        }
    }

    /**
     * modifies the transform details of the menu group parent object
     * @param type type of adjustment to be made
     */
    public AdjustMenuParent(type: Menu3DTransformAdjustmentTypes, x: number, y: number, z: number) {
        //get transform mod
        const transform = Transform.getMutable(this.groupParent);
        //process adjustment
        switch (type) {
            case Menu3DTransformAdjustmentTypes.POSITION:
                transform.position.x = x;
                transform.position.y = y;
                transform.position.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.SCALE:
                transform.scale.x = x;
                transform.scale.y = y;
                transform.scale.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.ROTATION:
                transform.rotation = Quaternion.fromEulerDegrees(x, y, z);
                break;
        }
    }

    /**
     * returns menu object container based on indexing
     * @param objName name of targeted menu object
     * @returns menu object container
     */
    public GetMenuObject(objName: string): MenuObject3D {
        return this.menuObjectDict.getItem(objName);
    }

    /**
     * returns entity containing the targeted text mesh component based on indexing
     * @param objName name of targeted object
     * @param textName name of targeted text (child on targeted object)
     * @returns entity reference
     */
    public GetMenuTextObject(objName: string, textName: string): Entity {
        return this.GetMenuObject(objName).GetTextObject(textName);
    }

    /**
     * returns mutable text mesh component based on indexing
     * @param objName name of targeted object
     * @param textName name of targeted text (child on targeted object)
     * @returns mutable text shape reference
     */
    public GetMenuObjectText(objName: string, textName: string): PBTextShape {
        return this.GetMenuObject(objName).GetObjectText(textName);
    }

    /**
     * prepares a menu object of the given type, under the given parent
     * @param name requested name for new menu object (if menu object of name already exists then function fails)
     * @param type index of menu object to be used as base
     * @param parent target parent, if no value is given object becomes a child of the core menu group parent (if menu object of index doesn't exists then function fails)
     */
    public AddMenuObject(name: string, type: Menu3DModelTypes, parent: string = '') {
        //ensure menu object does not exist
        if(this.menuObjectDict.containsKey(name)) return Error("Menu Group 3D: ERROR - failed to add menu object, object name="+name+" already exists");
        //ensure targeted parent obj exists
        if(parent != '' && !this.menuObjectDict.containsKey(parent)) return Error("Menu Group 3D: ERROR - failed to add menu object, object parent="+parent+" doesn't exists");

        //create menu entity
        const tmp: MenuObject3D = new MenuObject3D(name, type);

        //process parent assignment
        //  new obj is parented under targeted parent
        if (parent != '') Transform.getMutable(tmp.entity).parent = this.GetMenuObject(parent).entity;
        //  new obj is parented under group parent
        else Transform.getMutable(tmp.entity).parent = this.groupParent;

        //register object to collections
        this.menuObjectList.addItem(tmp);
        this.menuObjectDict.addItem(name, tmp);

        return tmp
    }

    /**
     * modifies the transform details of the targeted menu object entity
     * @param name access label of targeted object
     * @param type type of adjustment to be made
     */
    public AdjustMenuObject(name: string, type: Menu3DTransformAdjustmentTypes, x: number, y: number, z: number) {
        //ensure menu object of the requested menu object exists
        if(!this.menuObjectDict.containsKey(name)) return Error("Menu Group 3D: ERROR - failed to adjust menu object, object name="+name+" doesn't exists");
        
        //get transform mod
        const transform = Transform.getMutable(this.GetMenuObject(name).entity);
        //process adjustment
        switch (type) {
            case Menu3DTransformAdjustmentTypes.POSITION:
                transform.position.x = x;
                transform.position.y = y;
                transform.position.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.SCALE:
                transform.scale.x = x;
                transform.scale.y = y;
                transform.scale.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.ROTATION:
                transform.rotation = Quaternion.fromEulerDegrees(x, y, z);
                break;
        }
    }

    /**
     * prepares a menu object of the given size/shape, with the given text
     * @param nameObj access label of targeted object
     * @param nameTxt access label for text object 
     * @param text text that will be displayed
     * @returns returns instance of entity containing new text mesh
     */
    public AddMenuText(nameObj: string, nameTxt: string, text: string): Entity {
        return this.GetMenuObject(nameObj).AddTextObject(nameTxt, text, this.textColour);
    }

    /**
     * sets a text object's display text
     * @param nameObj access label of targeted object
     * @param nameTxt access label for text object 
     * @param text new display text
     */
    public SetMenuText(nameObj: string, nameTxt: string, text: string) {
        this.menuObjectDict.getItem(nameObj).ChangeText(nameTxt, text);
    }

    /**
     * modifies the transform details of the targeted menu text object entity
     * @param nameObj access label of targeted object
     * @param nameTxt access label for text object 
     * @param type type of adjustment to be made
     */
    public AdjustTextObject(nameObj: string, nameTxt: string, type: Menu3DTransformAdjustmentTypes, x: number, y: number, z: number) {
        this.menuObjectDict.getItem(nameObj).AdjustTextObject(nameTxt, type, x, y, z);
    }

    /**
     * modifies the display settings of the targeted menu text object entity
     * @param nameObj access label of targeted object
     * @param nameTxt access label for text object 
     * @param type type of adjustment to be made
     */
    public AdjustTextDisplay(nameObj: string, nameTxt: string, type: Menu3DDisplayAdjustmentTypes, value: number, value1: number = 1) {
        this.menuObjectDict.getItem(nameObj).AdjustTextDisplay(nameTxt, type, value, value1);
    }

    /**
     * modifies the display colour of the entire menu 
     * @param colour new menu text colour
     */
    public SetColour(colour: Color4) {
        //change default colour
        this.textColour = colour;

        //apply change to all menu text objects
        for (var i: number = 0; i < this.menuObjectList.size(); i++) {
            for (var j: number = 0; j < this.menuObjectList.getItem(i).textList.size(); j++) {
                TextShape.getMutable(this.menuObjectList.getItem(i).textList.getItem(j)).textColor = this.textColour;
            }
        }
    }
}

/**
 * used to represent and manage a single 3D menu object
 * 
 * each 3D menu object consists of a single parent entity and
 * several children textshape entities.
 */
export class MenuObject3D {
    /** access label */
    public Name: string;

    /** entity reference */
    public entity: Entity;

    /** list of all attatched text entities*/ 
    textList: List<Entity>;
    /** dict of all attatched text entities*/
    textDict: Dictionary<Entity>;

    /** creates a new 3D menu object of the given name with the given display model */
    constructor(name: string, model: Menu3DModelTypes) {
        //set access name
        this.Name = name;

        //create display entity
        this.entity = engine.addEntity();
        Transform.create(this.entity,
        ({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));
        //if requested, add custom display object
        if (model != '')
        {
            GltfContainer.create(this.entity, {
                src: model,
                visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
                invisibleMeshesCollisionMask: undefined
            });
        }

        //add to collections
        this.textList = new List<Entity>();
        this.textDict = new Dictionary<Entity>();
    }

    /**
     * sets the menu object's display state
     * @param state new display state
     */
    public SetObjectState(state: boolean) {
        //TODO: replace when you can hide/soft remove entities again
        //enable menu
        if (state)
        {
            Transform.getMutable(this.entity).scale = Vector3.One(); 
        }
        //disable menu
        else 
        {
            Transform.getMutable(this.entity).scale = Vector3.Zero();
        }
    }

    /** returns text object's entity reference */
    public GetTextObject(name: string): Entity {
        return this.textDict.getItem(name);
    }

    /** returns text object's text shape reference */
    public GetObjectText(name: string): PBTextShape {
        return TextShape.getMutable(this.textDict.getItem(name));
    }

    //prepares a text object with the given text, 
    //  registered under the given name
    public AddTextObject(name: string, text: string, colour: Color4): Entity {
        //create texh mesh entity
        const tmp: Entity = engine.addEntity();
        Transform.create(tmp,
        ({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            parent: this.entity
        }));

        //add text shapre
        const tmpTS = TextShape.create(tmp,
        {
            text: text,
            textColor: colour,
            width: 0,
            height:0,
            textWrapping: false,
            fontSize: 9,
            font: Font.F_SANS_SERIF
        });

        //add to collections
        this.textList.addItem(tmp);
        this.textDict.addItem(name, tmp);

        return tmp;
    }

    //changes a targeted text object entity
    //  type: 0->position, 1->scale, 2->rotation
    public AdjustTextObject(name: string, type: Menu3DTransformAdjustmentTypes, x: number, y: number, z: number) {
        //get transform mod
        const transform = Transform.getMutable(this.textDict.getItem(name));
        //process adjustment
        switch (type) {
            case Menu3DTransformAdjustmentTypes.POSITION:
                transform.position.x = x;
                transform.position.y = y;
                transform.position.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.SCALE:
                transform.scale.x = x;
                transform.scale.y = y;
                transform.scale.z = z;
                break;
            case Menu3DTransformAdjustmentTypes.ROTATION:
                transform.rotation = Quaternion.fromEulerDegrees(x, y, z);
                break;
        }
    }

    /**
     * changes a targeted menu object entity
     * @param name access label for text object
     * @param type 0->font size, 1->line spacing, 2->align, 
     * @param value primary value to set
     * @param value1 used as secondary alignment value bc for some reason v/h alignments are NOT split...
     */
    public AdjustTextDisplay(name: string, type: Menu3DDisplayAdjustmentTypes, value: number, value1: number = 1) {
        const textShape:PBTextShape = TextShape.getMutable(this.textDict.getItem(name));
        switch (type) {
            case Menu3DDisplayAdjustmentTypes.FONT:
                textShape.fontSize = value;
                break;
            case Menu3DDisplayAdjustmentTypes.LINESPACING:
                textShape.lineSpacing = value;
                break;
            case Menu3DDisplayAdjustmentTypes.WIDTH:
                textShape.width = value;
                break;
            case Menu3DDisplayAdjustmentTypes.HEIGHT:
                textShape.height = value;
                break;
            case Menu3DDisplayAdjustmentTypes.WRAPPING:
                if(value == 1) textShape.textWrapping = true;
                else textShape.textWrapping = false;
                break;
            case Menu3DDisplayAdjustmentTypes.ALIGNMENT:
                //TODO: change this when the interface is fixed to support v/h seperately 
                switch (value) {
                    case 0:
                        switch (value1) {
                            case 0: textShape.textAlign = TextAlignMode.TAM_TOP_LEFT; break;
                            case 1: textShape.textAlign = TextAlignMode.TAM_TOP_CENTER; break;
                            case 2: textShape.textAlign = TextAlignMode.TAM_TOP_RIGHT; break;
                        }
                    break;
                    case 1:
                        switch (value1) {
                            case 0: textShape.textAlign = TextAlignMode.TAM_MIDDLE_LEFT; break;
                            case 1: textShape.textAlign = TextAlignMode.TAM_MIDDLE_CENTER; break;
                            case 2: textShape.textAlign = TextAlignMode.TAM_MIDDLE_RIGHT; break;
                        }
                    break;
                    case 2:
                        switch (value1) {
                            case 0: textShape.textAlign = TextAlignMode.TAM_BOTTOM_LEFT; break;
                            case 1: textShape.textAlign = TextAlignMode.TAM_BOTTOM_CENTER; break;
                            case 2: textShape.textAlign = TextAlignMode.TAM_BOTTOM_RIGHT; break;
                        }
                    break;
                }
                break;
        }
    }

    //changes the text of a targeted textshape
    public ChangeText(name: string, text: string) {
        TextShape.getMutable(this.textDict.getItem(name)).text = text;
    }
}