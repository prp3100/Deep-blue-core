import { createGameQuestionSet } from './gameQuestionFactory'
import { gameHardQuestionBankExtensions } from './gameHardExtensions'
import type { QuestionBankItem } from './quizModels'

export const gameHardQuestionBank: QuestionBankItem[] = [
  ...createGameQuestionSet('hard', 'roblox-lua', [
    {
      snippetText: `local TweenService = game:GetService("TweenService")
local tween = TweenService:Create(door, TweenInfo.new(0.5), { CFrame = target.CFrame })
tween:Play()`,
      hint: {
        th: 'มี service ของ Roblox และ TweenInfo.new',
        en: 'It uses a Roblox service and TweenInfo.new.',
      },
      signals: ['game:GetService', 'TweenService', 'TweenInfo.new', ':Create'],
    },
    {
      snippetText: `remoteEvent.OnServerEvent:Connect(function(player, score)
    leaderboard[player.UserId] = score
end)`,
      hint: {
        th: 'OnServerEvent และ player.UserId เป็นกลิ่นฝั่งเซิร์ฟเวอร์ของ Roblox',
        en: 'OnServerEvent and player.UserId are Roblox server-side clues.',
      },
      signals: ['OnServerEvent', 'player.UserId', ':Connect(function'],
    },
    {
      snippetText: `local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("BestScores")
local ok, result = pcall(function()
    return store:GetAsync(player.UserId)
end)`,
      hint: {
        th: 'DataStoreService กับ pcall ชี้มาทาง Roblox ชัดมาก',
        en: 'DataStoreService with pcall strongly points to Roblox.',
      },
      signals: ['DataStoreService', 'GetDataStore', 'GetAsync', 'pcall'],
    },
    {
      snippetText: `local RunService = game:GetService("RunService")
RunService.Heartbeat:Connect(function(deltaTime)
    part.CFrame *= CFrame.Angles(0, deltaTime, 0)
end)`,
      hint: {
        th: 'Heartbeat และ CFrame เป็นคำช่วยจำของ Roblox',
        en: 'Heartbeat and CFrame are memorable Roblox markers.',
      },
      signals: ['RunService', 'Heartbeat', 'CFrame.Angles'],
    },
    {
      snippetText: `local UserInputService = game:GetService("UserInputService")
UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end
    if input.KeyCode == Enum.KeyCode.E then openShop() end
end)`,
      hint: {
        th: 'InputBegan กับ Enum.KeyCode เป็นรูปแบบ input ของ Roblox',
        en: 'InputBegan with Enum.KeyCode matches Roblox input handling.',
      },
      signals: ['UserInputService', 'InputBegan', 'Enum.KeyCode', 'processed'],
    },
    {
      snippetText: `local CollectionService = game:GetService("CollectionService")
for _, tagged in CollectionService:GetTagged("Checkpoint") do
    tagged.Transparency = 0.5
end`,
      hint: {
        th: 'CollectionService กับ GetTagged เป็นกลิ่นของ Roblox object tagging',
        en: 'CollectionService and GetTagged fit Roblox object tagging.',
      },
      signals: ['CollectionService', 'GetTagged', 'Transparency'],
    },
  ]),
  ...createGameQuestionSet('hard', 'love2d-lua', [
    {
      snippetText: `function love.load()
    world = love.physics.newWorld(0, 900, true)
    player = love.physics.newBody(world, 120, 60, "dynamic")
end`,
      hint: {
        th: 'มี love.physics.newWorld และ newBody',
        en: 'It uses love.physics.newWorld and newBody.',
      },
      signals: ['love.physics.newWorld', 'love.physics.newBody', 'Love2D physics'],
    },
    {
      snippetText: `function love.load()
    canvas = love.graphics.newCanvas(400, 240)
    font = love.graphics.newFont(18)
end`,
      hint: {
        th: 'newCanvas และ newFont อยู่ใต้ love.graphics',
        en: 'newCanvas and newFont both live under love.graphics.',
      },
      signals: ['love.graphics.newCanvas', 'love.graphics.newFont', 'love.load'],
    },
    {
      snippetText: `function love.draw()
    love.graphics.setCanvas(canvas)
    love.graphics.clear(0.1, 0.1, 0.1)
    love.graphics.setCanvas()
end`,
      hint: {
        th: 'ระบบ canvas ของ Love2D โผล่มาชัดเจน',
        en: 'The Love2D canvas workflow is very visible here.',
      },
      signals: ['love.graphics.setCanvas', 'love.graphics.clear', 'love.draw'],
    },
    {
      snippetText: `function love.load()
    music = love.audio.newSource("loop.ogg", "stream")
    music:setLooping(true)
    music:play()
end`,
      hint: {
        th: 'love.audio.newSource กับ :play() เป็น API ของ Love2D',
        en: 'love.audio.newSource with :play() is Love2D API usage.',
      },
      signals: ['love.audio.newSource', ':setLooping', ':play()', 'stream'],
    },
    {
      snippetText: `batch = love.graphics.newSpriteBatch(image, 200)
for i = 1, 20 do
    batch:add(i * 16, 24)
end`,
      hint: {
        th: 'newSpriteBatch เป็นคำเฉพาะของ Love2D graphics',
        en: 'newSpriteBatch is a Love2D graphics-specific clue.',
      },
      signals: ['newSpriteBatch', 'batch:add', 'love.graphics'],
    },
    {
      snippetText: `function love.wheelmoved(x, y)
    zoom = math.max(1, zoom + y * 0.1)
end`,
      hint: {
        th: 'callback wheelmoved ที่ขึ้นต้นด้วย love. เป็นกลิ่น Love2D ชัด',
        en: 'A wheelmoved callback beginning with love. strongly suggests Love2D.',
      },
      signals: ['love.wheelmoved', 'zoom', 'love callback'],
    },
  ]),
  ...createGameQuestionSet('hard', 'godot-gdscript', [
    {
      snippetText: `extends CharacterBody2D

@export var speed := 220.0

func _physics_process(delta):
    velocity = Input.get_vector("left", "right", "up", "down") * speed
    move_and_slide()`,
      hint: {
        th: 'CharacterBody2D, _physics_process และ move_and_slide คือ marker หลักของ Godot',
        en: 'CharacterBody2D, _physics_process, and move_and_slide are major Godot markers.',
      },
      signals: ['extends CharacterBody2D', '_physics_process', 'Input.get_vector', 'move_and_slide'],
    },
    {
      snippetText: `@onready var anim: AnimationPlayer = %AnimationPlayer

func _ready():
    anim.play("intro")`,
      hint: {
        th: 'typed @onready กับ %AnimationPlayer เป็นรูปแบบของ Godot',
        en: 'Typed @onready with %AnimationPlayer is a Godot-style pattern.',
      },
      signals: ['@onready', 'AnimationPlayer', '%AnimationPlayer'],
    },
    {
      snippetText: `func _on_button_pressed():
    await get_tree().create_timer(1.0).timeout
    queue_free()`,
      hint: {
        th: 'await get_tree().create_timer(...).timeout เป็นกลิ่นของ Godot มาก',
        en: 'await get_tree().create_timer(...).timeout feels very Godot-specific.',
      },
      signals: ['_on_button_pressed', 'await', 'get_tree().create_timer', 'timeout'],
    },
    {
      snippetText: `func flash():
    var tween = create_tween()
    tween.tween_property(self, "modulate:a", 0.2, 0.1)
    tween.tween_property(self, "modulate:a", 1.0, 0.1)`,
      hint: {
        th: 'create_tween กับ tween_property เป็น pattern ของ Godot',
        en: 'create_tween and tween_property are Godot patterns.',
      },
      signals: ['create_tween', 'tween_property', 'modulate:a'],
    },
    {
      snippetText: `func spawn_panel():
    var panel = preload("res://ui/panel.tscn").instantiate()
    add_child(panel)`,
      hint: {
        th: 'preload + .tscn + add_child ชี้ไปทาง Godot ชัดเจน',
        en: 'preload + .tscn + add_child clearly points to Godot.',
      },
      signals: ['preload', '.tscn', '.instantiate()', 'add_child'],
    },
    {
      snippetText: `signal health_changed(current)

func take_damage(amount):
    health -= amount
    health_changed.emit(health)`,
      hint: {
        th: 'signal ... .emit เป็นกลิ่นของระบบ signal ใน Godot',
        en: 'signal with .emit matches the Godot signal system.',
      },
      signals: ['signal', '.emit(', 'GDScript signal'],
    },
  ]),
  ...createGameQuestionSet('hard', 'godot-shader', [
    {
      snippetText: `shader_type spatial;
render_mode unshaded, cull_disabled;

void fragment() {
    ALBEDO = vec3(0.9, 0.5, 0.2);
}`,
      hint: {
        th: 'shader_type spatial และ ALBEDO เป็น Godot shader ชัดมาก',
        en: 'shader_type spatial and ALBEDO are strong Godot shader clues.',
      },
      signals: ['shader_type spatial', 'render_mode', 'ALBEDO'],
    },
    {
      snippetText: `uniform sampler2D noise_tex;

void vertex() {
    VERTEX.y += texture(noise_tex, UV).r * 0.1;
}`,
      hint: {
        th: 'VERTEX แบบตัวใหญ่ใน vertex() เป็น dialect ของ Godot',
        en: 'Uppercase VERTEX inside vertex() fits Godot’s shader dialect.',
      },
      signals: ['vertex()', 'VERTEX', 'texture(noise_tex, UV)'],
    },
    {
      snippetText: `uniform vec4 edge_color : source_color;

void fragment() {
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), 3.0);
    ALBEDO = mix(ALBEDO, edge_color.rgb, fresnel);
}`,
      hint: {
        th: 'source_color กับ ALBEDO/NORMAL/VIEW เป็นคำของ Godot shader',
        en: 'source_color with ALBEDO/NORMAL/VIEW belongs to Godot shader language.',
      },
      signals: ['source_color', 'ALBEDO', 'NORMAL', 'VIEW'],
    },
    {
      snippetText: `void fragment() {
    float outline = step(0.48, abs(UV.x - 0.5));
    COLOR = vec4(vec3(outline), 1.0);
}`,
      hint: {
        th: 'แม้จะคล้าย shader ทั่วไป แต่ COLOR แบบตัวใหญ่ยังชี้ทางนี้',
        en: 'Even though it resembles a generic shader, uppercase COLOR still points here.',
      },
      signals: ['COLOR', 'UV.x', 'step('],
    },
    {
      snippetText: `void fragment() {
    vec2 warped = UV + vec2(0.02 * sin(TIME + UV.y * 8.0), 0.0);
    COLOR = texture(TEXTURE, warped);
}`,
      hint: {
        th: 'UV, TIME, TEXTURE ชุดนี้เป็น marker ที่จำได้ง่าย',
        en: 'UV, TIME, and TEXTURE together are easy-to-remember markers.',
      },
      signals: ['UV', 'TIME', 'TEXTURE', 'COLOR = texture'],
    },
    {
      snippetText: `void light() {
    DIFFUSE_LIGHT += LIGHT_COLOR * ATTENUATION;
}`,
      hint: {
        th: 'DIFFUSE_LIGHT, LIGHT_COLOR, ATTENUATION เป็น built-in ของ Godot shader',
        en: 'DIFFUSE_LIGHT, LIGHT_COLOR, and ATTENUATION are Godot shader built-ins.',
      },
      signals: ['light()', 'DIFFUSE_LIGHT', 'LIGHT_COLOR', 'ATTENUATION'],
    },
  ]),
  ...createGameQuestionSet('hard', 'unity-csharp', [
    {
      snippetText: `public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    private IEnumerator Start()
    {
        while (true)
        {
            Instantiate(enemyPrefab, transform.position, Quaternion.identity);
            yield return new WaitForSeconds(1f);
        }
    }
}`,
      hint: {
        th: 'MonoBehaviour, SerializeField, Instantiate และ WaitForSeconds รวมกันชัดมาก',
        en: 'MonoBehaviour, SerializeField, Instantiate, and WaitForSeconds together are very strong clues.',
      },
      signals: ['MonoBehaviour', 'SerializeField', 'Instantiate', 'WaitForSeconds'],
    },
    {
      snippetText: `private CharacterController controller;

void Update()
{
    var input = new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
    var direction = new Vector3(input.x, 0f, input.y);
    controller.Move(direction * speed * Time.deltaTime);
}`,
      hint: {
        th: 'CharacterController.Move กับ Input.GetAxisRaw เป็นกลิ่น Unity',
        en: 'CharacterController.Move and Input.GetAxisRaw fit Unity.',
      },
      signals: ['CharacterController', 'Input.GetAxisRaw', 'controller.Move', 'Time.deltaTime'],
    },
    {
      snippetText: `private void OnCollisionEnter(Collision other)
{
    if (other.gameObject.CompareTag("Player"))
    {
        score += 10;
    }
}`,
      hint: {
        th: 'OnCollisionEnter และ CompareTag เป็น callback/style ของ Unity',
        en: 'OnCollisionEnter and CompareTag are Unity callback/style clues.',
      },
      signals: ['OnCollisionEnter', 'Collision', 'CompareTag', 'gameObject'],
    },
    {
      snippetText: `using TMPro;

[SerializeField] private TMP_Text scoreLabel;

void LateUpdate()
{
    scoreLabel.text = score.ToString("00");
}`,
      hint: {
        th: 'TMP_Text กับ LateUpdate พาไปทาง Unity ชัดเจน',
        en: 'TMP_Text and LateUpdate point clearly to Unity.',
      },
      signals: ['using TMPro', 'TMP_Text', 'LateUpdate()', 'scoreLabel.text'],
    },
    {
      snippetText: `public void LoadNextScene()
{
    SceneManager.LoadSceneAsync(nextSceneName);
}`,
      hint: {
        th: 'LoadSceneAsync กับ SceneManager เป็น marker ของ Unity scene flow',
        en: 'LoadSceneAsync and SceneManager are Unity scene-flow markers.',
      },
      signals: ['SceneManager.LoadSceneAsync', 'scene flow', 'Unity'],
    },
    {
      snippetText: `private InputActionReference moveAction;

private void OnEnable()
{
    moveAction.action.Enable();
}`,
      hint: {
        th: 'InputActionReference และ OnEnable เป็นกลิ่นงาน Unity แบบ modern input',
        en: 'InputActionReference with OnEnable fits modern Unity input workflows.',
      },
      signals: ['InputActionReference', 'OnEnable()', 'action.Enable()'],
    },
  ]),
  ...createGameQuestionSet('hard', 'unity-shaderlab', [
    {
      snippetText: `Shader "Custom/Wave"
{
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
    }
    SubShader {
        Tags { "RenderType"="Opaque" }
        Pass {`,
      hint: {
        th: 'ShaderLab wrapper ครบทั้ง Shader, Properties, SubShader, Tags',
        en: 'The ShaderLab wrapper includes Shader, Properties, SubShader, and Tags.',
      },
      signals: ['Shader "Custom/Wave"', 'Properties', 'SubShader', 'Tags'],
    },
    {
      snippetText: `HLSLPROGRAM
struct appdata {
    float4 vertex : POSITION;
    float2 uv : TEXCOORD0;
};`,
      hint: {
        th: 'HLSLPROGRAM กับ semantic อย่าง POSITION/TEXCOORD0 เป็น pattern ของ Unity shader',
        en: 'HLSLPROGRAM with semantics like POSITION/TEXCOORD0 matches Unity shader code.',
      },
      signals: ['HLSLPROGRAM', 'POSITION', 'TEXCOORD0', 'appdata'],
    },
    {
      snippetText: `v2f vert(appdata v)
{
    v2f o;
    o.vertex = UnityObjectToClipPos(v.vertex);
    o.uv = TRANSFORM_TEX(v.uv, _MainTex);
    return o;
}`,
      hint: {
        th: 'UnityObjectToClipPos และ TRANSFORM_TEX เป็น helper ของ Unity',
        en: 'UnityObjectToClipPos and TRANSFORM_TEX are Unity helper macros.',
      },
      signals: ['UnityObjectToClipPos', 'TRANSFORM_TEX', 'v2f'],
    },
    {
      snippetText: `sampler2D _MainTex;
float4 _MainTex_ST;

half4 frag(v2f i) : SV_Target
{
    return tex2D(_MainTex, i.uv);
}`,
      hint: {
        th: 'ชื่อแปรแบบ _MainTex_ST กับ SV_Target เป็นกลิ่นของ Unity/HLSL',
        en: '_MainTex_ST with SV_Target fits Unity/HLSL style.',
      },
      signals: ['_MainTex_ST', 'SV_Target', 'tex2D(_MainTex, i.uv)'],
    },
    {
      snippetText: `Blend SrcAlpha OneMinusSrcAlpha
ZWrite Off`,
      hint: {
        th: 'คำสั่ง Blend และ ZWrite อยู่ในกรอบ ShaderLab',
        en: 'Blend and ZWrite directives live in the ShaderLab wrapper.',
      },
      signals: ['Blend SrcAlpha OneMinusSrcAlpha', 'ZWrite Off', 'ShaderLab directives'],
    },
    {
      snippetText: `Stencil {
    Ref 1
    Comp Equal
    Pass Keep
}`,
      hint: {
        th: 'Stencil block แบบนี้เป็นของ ShaderLab ชัดมาก',
        en: 'A Stencil block like this is a very clear ShaderLab clue.',
      },
      signals: ['Stencil', 'Ref 1', 'Comp Equal', 'Pass Keep'],
    },
  ]),
  ...createGameQuestionSet('hard', 'unreal-cpp', [
    {
      snippetText: `AQuizDoor::AQuizDoor()
{
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    DoorMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DoorMesh"));
    DoorMesh->SetupAttachment(RootComponent);
}`,
      hint: {
        th: 'CreateDefaultSubobject + TEXT + SetupAttachment เป็นชุดคำของ Unreal',
        en: 'CreateDefaultSubobject, TEXT, and SetupAttachment are classic Unreal terms.',
      },
      signals: ['CreateDefaultSubobject', 'TEXT("Root")', 'SetupAttachment', 'USceneComponent'],
    },
    {
      snippetText: `void AQuizDoor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    CurrentYaw = FMath::FInterpTo(CurrentYaw, TargetYaw, DeltaTime, 4.f);
}`,
      hint: {
        th: 'Tick(float DeltaTime), Super::Tick และ FMath เป็น Unreal ชัดมาก',
        en: 'Tick(float DeltaTime), Super::Tick, and FMath strongly suggest Unreal.',
      },
      signals: ['Tick(float DeltaTime)', 'Super::Tick', 'FMath::FInterpTo'],
    },
    {
      snippetText: `GetWorld()->GetTimerManager().SetTimer(OpenHandle, this, &AQuizDoor::FinishOpen, 0.35f, false);`,
      hint: {
        th: 'GetWorld()->GetTimerManager() เป็น API ของ Unreal',
        en: 'GetWorld()->GetTimerManager() is Unreal API.',
      },
      signals: ['GetWorld()', 'GetTimerManager', 'SetTimer', '&AQuizDoor::FinishOpen'],
    },
    {
      snippetText: `TriggerBox->OnComponentBeginOverlap.AddDynamic(this, &AQuizDoor::HandleOverlap);`,
      hint: {
        th: 'AddDynamic กับ OnComponentBeginOverlap บอก Unreal event system',
        en: 'AddDynamic with OnComponentBeginOverlap matches Unreal’s event system.',
      },
      signals: ['OnComponentBeginOverlap', 'AddDynamic', '&AQuizDoor::HandleOverlap'],
    },
    {
      snippetText: `TArray<AActor*> Targets;
UGameplayStatics::GetAllActorsOfClass(this, AEnemy::StaticClass(), Targets);`,
      hint: {
        th: 'TArray กับ UGameplayStatics เป็นคำที่ชี้ไป Unreal',
        en: 'TArray with UGameplayStatics points toward Unreal.',
      },
      signals: ['TArray<AActor*>', 'UGameplayStatics', 'StaticClass()'],
    },
    {
      snippetText: `UGameplayStatics::PlaySoundAtLocation(this, OpenSound, GetActorLocation());
UE_LOG(LogTemp, Display, TEXT("Door open"));`,
      hint: {
        th: 'PlaySoundAtLocation และ UE_LOG รวมกันชัดมาก',
        en: 'PlaySoundAtLocation and UE_LOG together are very strong clues.',
      },
      signals: ['UGameplayStatics::PlaySoundAtLocation', 'UE_LOG', 'GetActorLocation'],
    },
  ]),
  ...createGameQuestionSet('hard', 'glsl', [
    {
      snippetText: `#version 330 core
layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;`,
      hint: {
        th: 'layout(location = ...) และ mat4 หลายตัวเป็นภาพของ GLSL vertex shader',
        en: 'layout(location = ...) with several mat4 uniforms is typical GLSL vertex shader code.',
      },
      signals: ['#version 330 core', 'layout(location = 0)', 'uniform mat4', 'in vec3'],
    },
    {
      snippetText: `out vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projection * view * model * vec4(position, 1.0);
}`,
      hint: {
        th: 'gl_Position และ out vec2 vUv เป็น pattern GLSL ที่ชัด',
        en: 'gl_Position with out vec2 vUv is a clear GLSL pattern.',
      },
      signals: ['out vec2 vUv', 'gl_Position', 'vec4(position, 1.0)'],
    },
    {
      snippetText: `in vec2 vUv;
out vec4 FragColor;
uniform sampler2D uScene;

void main()
{
    FragColor = texture(uScene, vUv);
}`,
      hint: {
        th: 'in/out และ FragColor อยู่ในโลก GLSL แบบดิบ',
        en: 'in/out with FragColor belongs to raw GLSL.',
      },
      signals: ['in vec2', 'out vec4 FragColor', 'uniform sampler2D', 'texture(uScene, vUv)'],
    },
    {
      snippetText: `float edge = smoothstep(0.2, 0.8, vUv.x);
vec3 color = mix(vec3(0.1), vec3(1.0, 0.4, 0.2), edge);`,
      hint: {
        th: 'smoothstep, mix, vec3 เป็น vocabulary ของ GLSL มาก',
        en: 'smoothstep, mix, and vec3 are very GLSL-flavored vocabulary.',
      },
      signals: ['smoothstep', 'mix(', 'vec3'],
    },
    {
      snippetText: `mat3 normalMatrix = transpose(inverse(mat3(model)));
vec3 normal = normalize(normalMatrix * inNormal);`,
      hint: {
        th: 'transpose/inverse/mat3 ใน shader math แบบนี้มักเป็น GLSL',
        en: 'transpose/inverse/mat3 in shader math like this is often GLSL.',
      },
      signals: ['mat3 normalMatrix', 'transpose', 'inverse', 'normalize'],
    },
    {
      snippetText: `vec2 centered = vUv * 2.0 - 1.0;
float vignette = 1.0 - dot(centered, centered);
FragColor = vec4(vec3(vignette), 1.0);`,
      hint: {
        th: 'shader math ล้วน ๆ แบบนี้ไม่มีกรอบของ engine อื่นมาคั่น',
        en: 'This is pure shader math without any wrapper from another engine.',
      },
      signals: ['vUv * 2.0 - 1.0', 'dot(', 'FragColor = vec4'],
    },
  ]),
  ...createGameQuestionSet('hard', 'phaser-typescript', [
    {
      snippetText: `export class PlayScene extends Phaser.Scene {
    preload() {
        this.load.atlas("hero", "hero.png", "hero.json")
        this.load.audio("jump", "jump.wav")
    }
}`,
      hint: {
        th: 'scene class พร้อม preload และ this.load.* เป็นกลิ่น Phaser',
        en: 'A scene class with preload and this.load.* smells like Phaser.',
      },
      signals: ['extends Phaser.Scene', 'preload()', 'this.load.atlas', 'this.load.audio'],
    },
    {
      snippetText: `create() {
    this.player = this.physics.add.sprite(120, 90, "hero")
    this.platforms = this.physics.add.staticGroup()
    this.physics.add.collider(this.player, this.platforms)
}`,
      hint: {
        th: 'physics.add.sprite, staticGroup และ collider เป็น pattern ของ Phaser',
        en: 'physics.add.sprite, staticGroup, and collider are Phaser patterns.',
      },
      signals: ['this.physics.add.sprite', 'staticGroup', 'collider', 'create()'],
    },
    {
      snippetText: `this.tweens.add({
    targets: panel,
    alpha: 1,
    duration: 250,
})`,
      hint: {
        th: 'this.tweens.add ใน object config แบบนี้เจอบ่อยใน Phaser',
        en: 'this.tweens.add with this object config is common in Phaser.',
      },
      signals: ['this.tweens.add', 'targets', 'duration: 250'],
    },
    {
      snippetText: `this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => this.spawnCoin(),
})`,
      hint: {
        th: 'time.addEvent กับ callback arrow function เป็นรูปแบบของ Phaser + TS',
        en: 'time.addEvent with an arrow callback is a Phaser + TS pattern.',
      },
      signals: ['this.time.addEvent', 'loop: true', 'callback: () =>'],
    },
    {
      snippetText: `this.cameras.main.startFollow(this.player)
this.cameras.main.setZoom(2)`,
      hint: {
        th: 'cameras.main เป็น API เด่นของ Phaser scene',
        en: 'cameras.main is a standout Phaser scene API.',
      },
      signals: ['this.cameras.main', 'startFollow', 'setZoom'],
    },
    {
      snippetText: `const cursors = this.input.keyboard!.createCursorKeys()
if (cursors.left.isDown) {
    this.player.setVelocityX(-160)
}`,
      hint: {
        th: 'input.keyboard!.createCursorKeys กับ setVelocityX เป็นรูปแบบ Phaser',
        en: 'input.keyboard!.createCursorKeys with setVelocityX matches Phaser.',
      },
      signals: ['createCursorKeys()', 'cursors.left.isDown', 'setVelocityX'],
    },
  ]),
  ...createGameQuestionSet('hard', 'rpg-maker-js', [
    {
      snippetText: `PluginManager.registerCommand("Codex", "OpenMenu", () => {
    SceneManager.push(Scene_Codex)
})`,
      hint: {
        th: 'registerCommand กับ SceneManager.push เป็นกลิ่นปลั๊กอิน RPG Maker ชัดมาก',
        en: 'registerCommand with SceneManager.push is a strong RPG Maker plugin smell.',
      },
      signals: ['PluginManager.registerCommand', 'SceneManager.push(Scene_Codex)', 'plugin command'],
    },
    {
      snippetText: `const _Scene_Boot_start = Scene_Boot.prototype.start
Scene_Boot.prototype.start = function() {
    _Scene_Boot_start.call(this)
    if (!$gameSwitches.value(1)) SceneManager.push(Scene_Tutorial)
}`,
      hint: {
        th: 'การ hook Scene_Boot.prototype.start พร้อม $gameSwitches ชี้ไปทาง RPG Maker',
        en: 'Hooking Scene_Boot.prototype.start with $gameSwitches points toward RPG Maker.',
      },
      signals: ['Scene_Boot.prototype.start', '_Scene_Boot_start.call(this)', '$gameSwitches.value', 'SceneManager.push'],
    },
    {
      snippetText: `Window_MenuCommand.prototype.addOriginalCommands = function() {
    this.addCommand("Codex", "codex", true)
}`,
      hint: {
        th: 'Window_MenuCommand.prototype กับ addCommand เป็น pattern ของเมนู RPG Maker',
        en: 'Window_MenuCommand.prototype with addCommand is an RPG Maker menu pattern.',
      },
      signals: ['Window_MenuCommand.prototype', 'addOriginalCommands', 'this.addCommand'],
    },
    {
      snippetText: `const _DataManager_createGameObjects = DataManager.createGameObjects
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this)
    $gameTemp._codexSeen = false
}`,
      hint: {
        th: 'DataManager กับ $gameTemp แบบนี้คือการต่อ state เข้ากับ engine ของ RPG Maker',
        en: 'DataManager with $gameTemp like this means state is being wired into RPG Maker.',
      },
      signals: ['DataManager.createGameObjects', '$gameTemp', 'engine bootstrap override'],
    },
    {
      snippetText: `const rect = this.itemLineRect(index)
const item = $dataItems[this._data[index].itemId]
this.drawText(item.name, rect.x, rect.y, rect.width)`,
      hint: {
        th: '$dataItems กับ drawText ใน window method เป็นกลิ่น UI ของ RPG Maker',
        en: '$dataItems with drawText inside a window method smells like RPG Maker UI.',
      },
      signals: ['$dataItems', 'itemLineRect', 'drawText', 'window rendering'],
    },
    {
      snippetText: `Sprite_Gauge.prototype.currentValue = function() {
    return $gameParty.leader().mp
}`,
      hint: {
        th: 'Sprite_Gauge.prototype กับ $gameParty.leader().mp เป็น marker ตรงของ UI battle ใน RPG Maker',
        en: 'Sprite_Gauge.prototype with $gameParty.leader().mp is a direct RPG Maker battle UI marker.',
      },
      signals: ['Sprite_Gauge.prototype.currentValue', '$gameParty.leader().mp', 'battle UI'],
    },
  ]),
  ...createGameQuestionSet('hard', 'gamemaker-gml', [
    {
      snippetText: `var move_x = keyboard_check(ord("D")) - keyboard_check(ord("A"));
var move_y = keyboard_check(ord("S")) - keyboard_check(ord("W"));
x += move_x * speed;
y += move_y * speed;`,
      hint: {
        th: 'x/y ถูกแก้ตรง ๆ และ keyboard_check แบบนี้เป็นกลิ่นของ GameMaker',
        en: 'Direct x/y movement with keyboard_check in this style suggests GameMaker.',
      },
      signals: ['keyboard_check(ord("D"))', 'x +=', 'y +=', 'speed'],
    },
    {
      snippetText: `with (instance_create_layer(x, y, "Effects", obj_spark)) {
    image_alpha = 0.8;
    image_blend = c_yellow;
}`,
      hint: {
        th: 'with (...) และ instance_create_layer เป็น marker เกมของ GameMaker',
        en: 'with (...) and instance_create_layer are strong GameMaker markers.',
      },
      signals: ['with (instance_create_layer', 'image_alpha', 'image_blend'],
    },
    {
      snippetText: `if (ds_map_exists(profile, "best_score")) {
    best = profile[? "best_score"];
}`,
      hint: {
        th: 'ds_map_exists และ [ ? ] เป็นรูปแบบ data structure ของ GML',
        en: 'ds_map_exists and [ ? ] fit GML data-structure syntax.',
      },
      signals: ['ds_map_exists', '[? "best_score"]', 'GML data structure'],
    },
    {
      snippetText: `camera_set_view_pos(view_camera[0], x - 320, y - 180);
camera_set_view_size(view_camera[0], 640, 360);`,
      hint: {
        th: 'camera_set_view_* กับ view_camera เป็น API ของ GameMaker',
        en: 'camera_set_view_* with view_camera is GameMaker API.',
      },
      signals: ['camera_set_view_pos', 'view_camera[0]', 'camera_set_view_size'],
    },
    {
      snippetText: `function take_damage(amount) {
    hp = max(0, hp - amount);
    if (hp == 0) instance_destroy();
}`,
      hint: {
        th: 'แม้ syntax จะดูทั่วไป แต่ instance_destroy ทำให้กลิ่น GameMaker ชัด',
        en: 'Even though the syntax looks general, instance_destroy gives it a clear GameMaker smell.',
      },
      signals: ['function take_damage', 'instance_destroy()', 'hp == 0'],
    },
    {
      snippetText: `draw_set_color(c_white);
draw_text(x, y - 32, string(score));`,
      hint: {
        th: 'draw_text กับ string(score) ในบริบท x/y ชี้ไปทาง GameMaker',
        en: 'draw_text with string(score) in an x/y context points toward GameMaker.',
      },
      signals: ['draw_set_color', 'draw_text', 'string(score)', 'x, y - 32'],
    },
  ]),
  ...gameHardQuestionBankExtensions,
]
