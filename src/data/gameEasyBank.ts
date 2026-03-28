import { createGameQuestionSet } from './gameQuestionFactory'
import { gameEasyQuestionBankExtensions } from './gameEasyExtensions'
import type { QuestionBankItem } from './quizModels'

export const gameEasyQuestionBank: QuestionBankItem[] = [
  ...createGameQuestionSet('easy', 'roblox-lua', [
    {
      snippetText: `local Players = game:GetService("Players")
local player = Players.LocalPlayer
print(player.Name)`,
      hint: {
        th: 'มี game:GetService และ Players ซึ่งเป็นกลิ่นของแพลตฟอร์มนี้ชัดมาก',
        en: 'game:GetService and Players are strong platform-specific clues here.',
      },
      signals: ['game:GetService', 'Players', 'LocalPlayer'],
    },
    {
      snippetText: `local part = Instance.new("Part")
part.Parent = workspace
part.Anchored = true`,
      hint: {
        th: 'ดู Instance.new และ workspace',
        en: 'Look at Instance.new and workspace.',
      },
      signals: ['Instance.new', 'workspace', 'Anchored'],
    },
    {
      snippetText: `script.Parent.Touched:Connect(function(hit)
    print(hit.Name)
end)`,
      hint: {
        th: 'มี script.Parent และ event แบบ :Connect',
        en: 'It uses script.Parent and an event with :Connect.',
      },
      signals: ['script.Parent', 'Touched', ':Connect(function'],
    },
    {
      snippetText: `game.Players.PlayerAdded:Connect(function(player)
    print("Joined", player.Name)
end)`,
      hint: {
        th: 'ดู path game.Players.PlayerAdded',
        en: 'Look at the game.Players.PlayerAdded path.',
      },
      signals: ['game.Players', 'PlayerAdded', ':Connect(function'],
    },
    {
      snippetText: `local humanoid = character:WaitForChild("Humanoid")
humanoid.WalkSpeed = 20`,
      hint: {
        th: 'คำว่า Humanoid เป็น marker ที่คุ้นมากของที่นี่',
        en: 'Humanoid is a very familiar marker for this ecosystem.',
      },
      signals: ['WaitForChild', 'Humanoid', 'WalkSpeed'],
    },
    {
      snippetText: `remoteEvent:FireServer("startRound")
print("sent")`,
      hint: {
        th: 'มีคำว่า FireServer ซึ่งชี้ถึงระบบ event ของฝั่ง client/server',
        en: 'FireServer points to this platform’s client/server event model.',
      },
      signals: ['FireServer', 'remoteEvent', 'client/server event'],
    },
  ]),
  ...createGameQuestionSet('easy', 'love2d-lua', [
    {
      snippetText: `function love.load()
    message = "Ready"
end`,
      hint: {
        th: 'callback หลักขึ้นต้นด้วย love.',
        en: 'The main callback starts with love.',
      },
      signals: ['function love.load()', 'Lua callback', 'love.'],
    },
    {
      snippetText: `function love.draw()
    love.graphics.print(score, 40, 32)
end`,
      hint: {
        th: 'ดู love.graphics.print',
        en: 'Look at love.graphics.print.',
      },
      signals: ['love.draw', 'love.graphics.print', 'score'],
    },
    {
      snippetText: `function love.update(dt)
    if love.keyboard.isDown("right") then
        x = x + speed * dt
    end
end`,
      hint: {
        th: 'มี dt และ love.keyboard.isDown',
        en: 'It uses dt and love.keyboard.isDown.',
      },
      signals: ['love.update(dt)', 'love.keyboard.isDown', 'dt'],
    },
    {
      snippetText: `image = love.graphics.newImage("player.png")
scale = 2`,
      hint: {
        th: 'newImage ที่เรียกผ่าน love.graphics เป็นจุดสังเกตสำคัญ',
        en: 'newImage through love.graphics is a strong clue.',
      },
      signals: ['love.graphics.newImage', 'asset loading', 'love.'],
    },
    {
      snippetText: `love.window.setTitle("Arcade Quiz")
love.mouse.setVisible(false)`,
      hint: {
        th: 'window และ mouse ยังอยู่ใต้ prefix love.',
        en: 'window and mouse still live under the love. prefix.',
      },
      signals: ['love.window', 'love.mouse', 'prefix love.'],
    },
    {
      snippetText: `function love.keypressed(key)
    if key == "space" then
        jump()
    end
end`,
      hint: {
        th: 'ดูชื่อ callback และ event ของคีย์',
        en: 'Look at the callback name and key event.',
      },
      signals: ['love.keypressed', 'key == "space"', 'Lua callback'],
    },
  ]),
  ...createGameQuestionSet('easy', 'godot-gdscript', [
    {
      snippetText: `extends Node2D

func _ready():
    print("Ready")`,
      hint: {
        th: 'extends Node2D กับ _ready() เป็น marker หลัก',
        en: 'extends Node2D and _ready() are the main clues.',
      },
      signals: ['extends Node2D', '_ready()', 'func'],
    },
    {
      snippetText: `@onready var label = $CanvasLayer/Label
label.text = "Go"`,
      hint: {
        th: 'มี @onready และ path แบบ $Node',
        en: 'It uses @onready and a $Node-style path.',
      },
      signals: ['@onready', '$CanvasLayer/Label', 'scene tree path'],
    },
    {
      snippetText: `func _process(delta):
    position.x += speed * delta`,
      hint: {
        th: 'ดู _process(delta) และ position.x',
        en: 'Look at _process(delta) and position.x.',
      },
      signals: ['_process(delta)', 'position.x', 'func'],
    },
    {
      snippetText: `signal score_changed(value)
var score := 0`,
      hint: {
        th: 'มี signal และ syntax ที่ดูเหมือน Python แต่ไม่ใช่ Python ล้วน',
        en: 'It uses signal and looks Python-like without being plain Python.',
      },
      signals: ['signal', ':=', 'Godot-style script'],
    },
    {
      snippetText: `var panel_scene = preload("res://ui/panel.tscn")
var panel = panel_scene.instantiate()`,
      hint: {
        th: 'preload กับเส้นทาง res:// เป็นคำเฉพาะของ engine นี้',
        en: 'preload and res:// are engine-specific clues here.',
      },
      signals: ['preload', 'res://', '.instantiate()'],
    },
    {
      snippetText: `if Input.is_action_just_pressed("ui_accept"):
    queue_free()`,
      hint: {
        th: 'Input.is_action_just_pressed และ queue_free เป็นจุดสังเกตที่ดี',
        en: 'Input.is_action_just_pressed and queue_free are helpful markers.',
      },
      signals: ['Input.is_action_just_pressed', 'queue_free()', 'Godot input'],
    },
  ]),
  ...createGameQuestionSet('easy', 'godot-shader', [
    {
      snippetText: `shader_type canvas_item;

void fragment() {
    COLOR = texture(TEXTURE, UV);
}`,
      hint: {
        th: 'ดู shader_type และตัวแปรใหญ่ COLOR/TEXTURE/UV',
        en: 'Look at shader_type and the uppercase COLOR/TEXTURE/UV variables.',
      },
      signals: ['shader_type canvas_item', 'COLOR', 'TEXTURE', 'UV'],
    },
    {
      snippetText: `uniform vec4 tint : source_color;

void fragment() {
    COLOR *= tint;
}`,
      hint: {
        th: 'source_color เป็นคำใบ้ของ Godot shader',
        en: 'source_color is a useful Godot shader clue.',
      },
      signals: ['source_color', 'uniform vec4', 'COLOR'],
    },
    {
      snippetText: `void fragment() {
    COLOR.rgb *= 0.5;
}`,
      hint: {
        th: 'แม้จะคล้าย shader ทั่วไป แต่ COLOR แบบตัวใหญ่ช่วยได้มาก',
        en: 'Even though it looks like a generic shader, uppercase COLOR helps a lot.',
      },
      signals: ['COLOR.rgb', 'fragment()', 'Godot built-in'],
    },
    {
      snippetText: `void fragment() {
    float wave = sin(UV.x * 10.0 + TIME);
    COLOR.rgb += wave * 0.1;
}`,
      hint: {
        th: 'UV กับ TIME ในรูปแบบนี้เป็นกลิ่นของ shader dialect นี้',
        en: 'UV and TIME in this style hint at this shader dialect.',
      },
      signals: ['UV', 'TIME', 'COLOR.rgb'],
    },
    {
      snippetText: `void fragment() {
    COLOR.a = texture(TEXTURE, UV).a;
}`,
      hint: {
        th: 'TEXTURE กับ COLOR.a ช่วยแยกจาก GLSL ดิบได้',
        en: 'TEXTURE and COLOR.a help separate it from raw GLSL.',
      },
      signals: ['TEXTURE', 'COLOR.a', 'texture(TEXTURE, UV)'],
    },
    {
      snippetText: `void fragment() {
    vec2 offset = UV + vec2(0.0, 0.01);
    COLOR = texture(TEXTURE, offset);
}`,
      hint: {
        th: 'ยังคงใช้ UV และ TEXTURE แบบ Godot',
        en: 'It still uses UV and TEXTURE in the Godot style.',
      },
      signals: ['UV + vec2', 'TEXTURE', 'COLOR = texture'],
    },
  ]),
  ...createGameQuestionSet('easy', 'unity-csharp', [
    {
      snippetText: `public class PlayerMover : MonoBehaviour
{
    void Update()
    {
        transform.Translate(Vector3.right * Time.deltaTime);
    }
}`,
      hint: {
        th: 'MonoBehaviour, Update และ transform เป็น marker ตรงมาก',
        en: 'MonoBehaviour, Update, and transform are very direct markers.',
      },
      signals: ['MonoBehaviour', 'Update()', 'transform.Translate', 'Time.deltaTime'],
    },
    {
      snippetText: `[SerializeField] private float speed = 5f;
private int score = 0;`,
      hint: {
        th: 'SerializeField เป็นคำเฉพาะที่เจอใน Unity บ่อยมาก',
        en: 'SerializeField is a very common Unity-specific clue.',
      },
      signals: ['SerializeField', 'private float', 'Unity C#'],
    },
    {
      snippetText: `private Rigidbody body;

void Start()
{
    body = GetComponent<Rigidbody>();
}`,
      hint: {
        th: 'GetComponent เป็นกลิ่นของระบบ component ชัดมาก',
        en: 'GetComponent strongly points to a component-based Unity setup.',
      },
      signals: ['Start()', 'GetComponent', 'Rigidbody'],
    },
    {
      snippetText: `if (Input.GetKeyDown(KeyCode.Space))
{
    Jump();
}`,
      hint: {
        th: 'Input.GetKeyDown กับ KeyCode เป็น marker ใช้งานบ่อย',
        en: 'Input.GetKeyDown and KeyCode are common working markers.',
      },
      signals: ['Input.GetKeyDown', 'KeyCode.Space', 'Jump()'],
    },
    {
      snippetText: `Instantiate(projectilePrefab, firePoint.position, firePoint.rotation);`,
      hint: {
        th: 'Instantiate แบบนี้เป็นภาพจำของ Unity',
        en: 'Instantiate in this form is a classic Unity clue.',
      },
      signals: ['Instantiate', 'position', 'rotation'],
    },
    {
      snippetText: `SceneManager.LoadScene("MainMenu");`,
      hint: {
        th: 'SceneManager เป็นคำช่วยเดาได้เร็วมาก',
        en: 'SceneManager is a fast clue here.',
      },
      signals: ['SceneManager', 'LoadScene', 'Unity scene'],
    },
  ]),
  ...createGameQuestionSet('easy', 'unity-shaderlab', [
    {
      snippetText: `Shader "Custom/Tint"
{
    Properties {
        _Color ("Tint", Color) = (1,1,1,1)
    }
}`,
      hint: {
        th: 'มีกรอบ Shader และ Properties ชัดเจน',
        en: 'It clearly has a Shader wrapper and Properties section.',
      },
      signals: ['Shader "Custom/Tint"', 'Properties', '_Color ("Tint", Color)'],
    },
    {
      snippetText: `SubShader {
    Pass {
        CGPROGRAM
        #pragma vertex vert
        #pragma fragment frag`,
      hint: {
        th: 'SubShader, Pass, CGPROGRAM เป็นรูปแบบเฉพาะของ Unity',
        en: 'SubShader, Pass, and CGPROGRAM are specific Unity-style markers.',
      },
      signals: ['SubShader', 'Pass', 'CGPROGRAM', '#pragma vertex'],
    },
    {
      snippetText: `fixed4 frag(v2f i) : SV_Target
{
    return tex2D(_MainTex, i.uv) * _Color;
}`,
      hint: {
        th: 'SV_Target และ tex2D อยู่ในโลก shader ของ Unity บ่อยมาก',
        en: 'SV_Target and tex2D appear often in Unity shader code.',
      },
      signals: ['SV_Target', 'tex2D', '_MainTex', '_Color'],
    },
    {
      snippetText: `sampler2D _MainTex;
float4 _Color;`,
      hint: {
        th: 'ชื่อ property แบบขึ้นต้นด้วย _ เป็น pattern ที่เห็นบ่อย',
        en: 'Property names starting with _ are a common pattern here.',
      },
      signals: ['sampler2D _MainTex', 'float4 _Color', 'Unity shader variables'],
    },
    {
      snippetText: `Tags { "RenderType"="Opaque" }`,
      hint: {
        th: 'Tags แบบ key=value อยู่ในกรอบ ShaderLab',
        en: 'Tags in this key=value form live inside the ShaderLab wrapper.',
      },
      signals: ['Tags', '"RenderType"="Opaque"', 'ShaderLab'],
    },
    {
      snippetText: `ENDCG`,
      hint: {
        th: 'คำปิด block แบบนี้เป็นของ ShaderLab/CGPROGRAM',
        en: 'This closing token belongs to ShaderLab/CGPROGRAM.',
      },
      signals: ['ENDCG', 'ShaderLab wrapper', 'Unity shader'],
    },
  ]),
  ...createGameQuestionSet('easy', 'unreal-cpp', [
    {
      snippetText: `UCLASS()
class AQuizDoor : public AActor
{
    GENERATED_BODY()
};`,
      hint: {
        th: 'UCLASS และ GENERATED_BODY เป็น marker แรงมาก',
        en: 'UCLASS and GENERATED_BODY are extremely strong markers.',
      },
      signals: ['UCLASS()', 'AActor', 'GENERATED_BODY()'],
    },
    {
      snippetText: `UPROPERTY(EditAnywhere, BlueprintReadWrite)
float MoveSpeed = 250.f;`,
      hint: {
        th: 'UPROPERTY กับ BlueprintReadWrite เป็นคำเฉพาะของ Unreal',
        en: 'UPROPERTY and BlueprintReadWrite are Unreal-specific terms.',
      },
      signals: ['UPROPERTY', 'BlueprintReadWrite', '250.f'],
    },
    {
      snippetText: `virtual void BeginPlay() override;`,
      hint: {
        th: 'BeginPlay เป็น lifecycle ของ Unreal ที่เห็นบ่อย',
        en: 'BeginPlay is a common Unreal lifecycle method.',
      },
      signals: ['BeginPlay()', 'override', 'Unreal lifecycle'],
    },
    {
      snippetText: `PrimaryActorTick.bCanEverTick = true;`,
      hint: {
        th: 'ชื่อ property แบบ PrimaryActorTick บอก engine ชัดมาก',
        en: 'PrimaryActorTick is a very engine-specific property name.',
      },
      signals: ['PrimaryActorTick', 'bCanEverTick', 'Actor tick'],
    },
    {
      snippetText: `CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));`,
      hint: {
        th: 'TEXT("...") กับ CreateDefaultSubobject เป็นกลิ่น Unreal มาก',
        en: 'TEXT("...") and CreateDefaultSubobject strongly suggest Unreal.',
      },
      signals: ['CreateDefaultSubobject', 'UStaticMeshComponent', 'TEXT("Mesh")'],
    },
    {
      snippetText: `UE_LOG(LogTemp, Warning, TEXT("Door opened"));`,
      hint: {
        th: 'UE_LOG คือ marker ที่ตอบได้แทบจะทันที',
        en: 'UE_LOG is almost an instant-answer marker.',
      },
      signals: ['UE_LOG', 'LogTemp', 'TEXT("Door opened")'],
    },
  ]),
  ...createGameQuestionSet('easy', 'glsl', [
    {
      snippetText: `#version 330 core`,
      hint: {
        th: 'ถ้าเริ่มด้วย #version แบบนี้ ให้นึกถึง GLSL ก่อน',
        en: 'If it starts with #version like this, think of GLSL first.',
      },
      signals: ['#version 330 core', 'GLSL header'],
    },
    {
      snippetText: `uniform sampler2D uTexture;
in vec2 vUv;`,
      hint: {
        th: 'sampler2D และ in vec2 เป็น pattern ของ shader ทั่วไปฝั่ง GLSL',
        en: 'sampler2D and in vec2 are common raw GLSL patterns.',
      },
      signals: ['uniform sampler2D', 'in vec2', 'raw GLSL'],
    },
    {
      snippetText: `out vec4 FragColor;`,
      hint: {
        th: 'FragColor แบบนี้ชัดเจนมากใน fragment shader',
        en: 'FragColor in this form is very clear in fragment shaders.',
      },
      signals: ['out vec4 FragColor', 'fragment shader'],
    },
    {
      snippetText: `FragColor = texture(uTexture, vUv);`,
      hint: {
        th: 'ใช้ FragColor และ texture กับตัวแปรที่ตั้งชื่อเอง',
        en: 'It uses FragColor and texture with custom variable names.',
      },
      signals: ['FragColor', 'texture(uTexture, vUv)', 'GLSL output'],
    },
    {
      snippetText: `gl_Position = projection * view * model * vec4(position, 1.0);`,
      hint: {
        th: 'gl_Position เป็น marker ตรงมากของ vertex shader',
        en: 'gl_Position is a direct vertex-shader marker.',
      },
      signals: ['gl_Position', 'vec4(position, 1.0)', 'vertex shader'],
    },
    {
      snippetText: `vec3 normal = normalize(vNormal);`,
      hint: {
        th: 'รูปแบบ vec3 และ normalize แบบนี้เจอบ่อยใน GLSL',
        en: 'vec3 and normalize in this form are common in GLSL.',
      },
      signals: ['vec3', 'normalize', 'raw shader math'],
    },
  ]),
  ...createGameQuestionSet('easy', 'phaser-typescript', [
    {
      snippetText: `export class PlayScene extends Phaser.Scene {
    create() {
        this.add.text(40, 40, "Ready")
    }
}`,
      hint: {
        th: 'extends Phaser.Scene กับ this.add เป็นจุดสังเกตหลัก',
        en: 'extends Phaser.Scene and this.add are the main clues.',
      },
      signals: ['extends Phaser.Scene', 'this.add.text', 'scene class'],
    },
    {
      snippetText: `this.load.image("player", "assets/player.png")`,
      hint: {
        th: 'this.load.image เป็น API โหลด asset ของ Phaser',
        en: 'this.load.image is a Phaser asset-loading API.',
      },
      signals: ['this.load.image', 'asset loading', 'Phaser'],
    },
    {
      snippetText: `this.physics.add.sprite(100, 120, "player")`,
      hint: {
        th: 'this.physics.add เป็น marker ชัดของ framework นี้',
        en: 'this.physics.add is a clear framework marker here.',
      },
      signals: ['this.physics.add.sprite', 'physics', 'Phaser'],
    },
    {
      snippetText: `this.input.keyboard?.on("keydown-SPACE", () => jump())`,
      hint: {
        th: 'มี this.input.keyboard และ syntax แบบ TypeScript/JS',
        en: 'It uses this.input.keyboard with JS/TS-style syntax.',
      },
      signals: ['this.input.keyboard', 'keydown-SPACE', 'arrow function'],
    },
    {
      snippetText: `this.anims.create({ key: "run", frames: [] })`,
      hint: {
        th: 'anims.create กับ object literal เป็นภาพจำของ Phaser',
        en: 'anims.create with an object literal is a familiar Phaser pattern.',
      },
      signals: ['this.anims.create', 'key: "run"', 'Phaser animation'],
    },
    {
      snippetText: `this.scene.start("GameOverScene")`,
      hint: {
        th: 'this.scene.start เป็นการเปลี่ยนฉากของ Phaser',
        en: 'this.scene.start is a Phaser scene-switching call.',
      },
      signals: ['this.scene.start', 'scene switching', 'Phaser'],
    },
  ]),
  ...createGameQuestionSet('easy', 'rpg-maker-js', [
    {
      snippetText: `const params = PluginManager.parameters("QuestHud")`,
      hint: {
        th: 'PluginManager.parameters เป็น marker ของปลั๊กอิน RPG Maker ที่ชัดมาก',
        en: 'PluginManager.parameters is a very direct RPG Maker plugin marker.',
      },
      signals: ['PluginManager.parameters', 'QuestHud', 'plugin config'],
    },
    {
      snippetText: `if ($gameSwitches.value(12)) {
    $gameMessage.add("Gate is open.")
}`,
      hint: {
        th: '$gameSwitches กับ $gameMessage เป็น global ของ engine นี้',
        en: '$gameSwitches and $gameMessage are globals from this engine.',
      },
      signals: ['$gameSwitches.value', '$gameMessage.add', 'engine globals'],
    },
    {
      snippetText: `SceneManager.push(Scene_Item)`,
      hint: {
        th: 'SceneManager.push กับชื่อ Scene_* แบบนี้ชี้ไปทาง RPG Maker',
        en: 'SceneManager.push with a Scene_* class points toward RPG Maker.',
      },
      signals: ['SceneManager.push', 'Scene_Item', 'scene stack'],
    },
    {
      snippetText: `AudioManager.playSe({ name: "Bell1", volume: 90, pitch: 100, pan: 0 })`,
      hint: {
        th: 'AudioManager กับ object รูปแบบนี้เป็น API ที่คุ้นมากของ RPG Maker',
        en: 'AudioManager with this object shape is a familiar RPG Maker API.',
      },
      signals: ['AudioManager.playSe', 'name/volume/pitch/pan', 'engine audio'],
    },
    {
      snippetText: `const actor = $gameParty.leader()
console.log(actor.name())`,
      hint: {
        th: '$gameParty.leader() เป็น marker ตรงมากของระบบปาร์ตี้ใน RPG Maker',
        en: '$gameParty.leader() is a direct marker of RPG Maker party state.',
      },
      signals: ['$gameParty.leader()', 'actor.name()', 'party state'],
    },
    {
      snippetText: `const bitmap = ImageManager.loadSystem("IconSet")`,
      hint: {
        th: 'ImageManager.loadSystem เป็นตัวช่วยโหลด asset ของ engine นี้',
        en: 'ImageManager.loadSystem is an asset-loading helper from this engine.',
      },
      signals: ['ImageManager.loadSystem', 'IconSet', 'engine asset loader'],
    },
  ]),
  ...createGameQuestionSet('easy', 'gamemaker-gml', [
    {
      snippetText: `if (keyboard_check(vk_right)) {
    x += 4;
}`,
      hint: {
        th: 'x กับ keyboard_check เป็นกลิ่นของ GameMaker มาก',
        en: 'x and keyboard_check strongly suggest GameMaker.',
      },
      signals: ['keyboard_check', 'vk_right', 'x += 4'],
    },
    {
      snippetText: `instance_create_layer(x, y, "Bullets", obj_bullet);`,
      hint: {
        th: 'instance_create_layer แทบจะตอบได้ทันที',
        en: 'instance_create_layer is almost an instant answer.',
      },
      signals: ['instance_create_layer', 'x, y', 'obj_bullet'],
    },
    {
      snippetText: `alarm[0] = room_speed * 2;`,
      hint: {
        th: 'alarm[] กับ room_speed เป็นคำเฉพาะของ GameMaker',
        en: 'alarm[] and room_speed are GameMaker-specific terms.',
      },
      signals: ['alarm[0]', 'room_speed', 'GameMaker timing'],
    },
    {
      snippetText: `sprite_index = spr_player_idle;`,
      hint: {
        th: 'sprite_index เป็นคำช่วยจำที่ดีมาก',
        en: 'sprite_index is a very useful memory hook.',
      },
      signals: ['sprite_index', 'spr_player_idle', 'GameMaker resource'],
    },
    {
      snippetText: `show_debug_message("Start room");`,
      hint: {
        th: 'show_debug_message เป็นอีก marker ที่คุ้นมาก',
        en: 'show_debug_message is another familiar marker.',
      },
      signals: ['show_debug_message', 'room', 'GameMaker debug'],
    },
    {
      snippetText: `if (place_meeting(x, y + 1, obj_wall)) {
    vspeed = 0;
}`,
      hint: {
        th: 'place_meeting กับ vspeed ชี้ไปทาง GameMaker',
        en: 'place_meeting and vspeed point toward GameMaker.',
      },
      signals: ['place_meeting', 'vspeed', 'obj_wall'],
    },
  ]),
  ...gameEasyQuestionBankExtensions,
]
