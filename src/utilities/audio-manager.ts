import { AudioSource, Entity, Transform, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

/*      AUDIO MANAGER
    controls audio components in-scene, mainly lobby (game idle) and
    battle (during wave) music.

    Author: TheCryptoTrader69 (Alex Pazder)
    Contact: TheCryptoTrader69@gmail.com
*/
export class AudioManager
{
    //access pocketing
    private static instance:undefined|AudioManager;
    public static get Instance():AudioManager
    {
        //ensure instance is set
        if(AudioManager.instance === undefined)
        {
            AudioManager.instance = new AudioManager();
        }

        return AudioManager.instance;
    }

    parentEntity:Entity;

    //lobby music
    private audioObjectLobby:Entity;
    //sound effects (0:victory, 1:defeat)
    private audioObjectEndGame:Entity[];

    private endGameStrings:string[] = [
        "audio/GameVictory.wav",
        "audio/GameDefeat.wav",
    ];

    //constructor
    constructor()
    {
        //entity
        this.parentEntity = engine.addEntity();
        Transform.create(this.parentEntity,
        ({
            position: Vector3.create(0,0,0),
            scale: Vector3.create(1,1,1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));

        //initialize audio components
        //  lobby music
        this.audioObjectLobby = engine.addEntity();
        Transform.create(this.audioObjectLobby,
        ({
            position: Vector3.create(0,0,0),
            scale: Vector3.create(1,1,1),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        }));
        Transform.getMutable(this.audioObjectLobby).parent = this.parentEntity;
        //  audio source
        AudioSource.create(this.audioObjectLobby, {
            audioClipUrl: "audio/WhiteBatAudio_Floating.mp3",
            loop: true,
            playing: true
        });

        //  victory/defeat
        this.audioObjectEndGame = [];
        for (let i = 0; i < this.endGameStrings.length; i++) 
        {
            //create object
            this.audioObjectEndGame.push(engine.addEntity());
            Transform.create(this.audioObjectEndGame[i],
            ({
                position: Vector3.create(0,0,0),
                scale: Vector3.create(1,1,1),
                rotation: Quaternion.fromEulerDegrees(0, 0, 0)
            }));
            Transform.getMutable(this.audioObjectEndGame[i]).parent = this.parentEntity;
            //  audio source
            AudioSource.create(this.audioObjectEndGame[i], {
                audioClipUrl: this.endGameStrings[i],
                loop: false,
                playing: false
            });
        }
    }

    /**
     * 
     * @param state targeted music state (0=off, 1=lobby)
     */
    public PlayAudio(value:number)
    {
        //disable all tracks
        for (let i = 0; i < this.endGameStrings.length; i++) 
        {
            //  audio source
            AudioSource.getMutable(this.audioObjectEndGame[i]).playing = false;
        }

        //activate targeted audio
        AudioSource.getMutable(this.audioObjectEndGame[value]).playing = true;
    }
}