import { createQuestionSet, type QuestionBankItem } from './quizModels'

export const gameEasyQuestionBankExtensions: QuestionBankItem[] = [
  ...createQuestionSet('easy', 'defold-lua', [
    {
      snippetText: `go.property("speed", 240)

function init(self)
  msg.post(".", "acquire_input_focus")
end`,
      distractors: ['love2d-lua', 'roblox-lua', 'godot-gdscript'],
      hint: {
        th: 'มี go.property กับ msg.post ซึ่งเป็นคำเฉพาะของ Defold',
        en: 'It uses go.property and msg.post, which are very Defold-specific.',
      },
      signals: ['go.property', 'msg.post', 'init(self)'],
    },
    {
      snippetText: `function update(self, dt)
  local position = go.get_position()
  position.x = position.x + self.speed * dt
  go.set_position(position)
end`,
      distractors: ['love2d-lua', 'roblox-lua', 'gamemaker-gml'],
      hint: {
        th: 'ดู go.get_position กับ go.set_position',
        en: 'Look at go.get_position and go.set_position.',
      },
      signals: ['update(self, dt)', 'go.get_position', 'go.set_position'],
    },
    {
      snippetText: `function on_input(self, action_id, action)
  if action_id == hash("fire") and action.pressed then
    msg.post("#weapon", "shoot")
  end
end`,
      distractors: ['roblox-lua', 'love2d-lua', 'godot-gdscript'],
      hint: {
        th: 'มี hash("fire") และ msg.post ไปยัง component path',
        en: 'It uses hash("fire") with msg.post to a component path.',
      },
      signals: ['on_input', 'hash("fire")', 'msg.post("#weapon", ...)'],
    },
    {
      snippetText: `local enemy_id = factory.create("#enemy_factory", vmath.vector3(32, 64, 0))
go.set_scale(vmath.vector3(1.2), enemy_id)`,
      distractors: ['love2d-lua', 'unity-csharp', 'gamemaker-gml'],
      hint: {
        th: 'มี factory.create กับ vmath.vector3',
        en: 'It uses factory.create with vmath.vector3.',
      },
      signals: ['factory.create', 'vmath.vector3', 'go.set_scale'],
    },
    {
      snippetText: `function on_message(self, message_id, message, sender)
  if message_id == hash("hit") then
    self.hp = self.hp - 1
  end
end`,
      distractors: ['roblox-lua', 'love2d-lua', 'rpg-maker-js'],
      hint: {
        th: 'on_message กับ hash("hit") เป็นกลิ่นของระบบ message ใน Defold',
        en: 'on_message with hash("hit") smells like Defold’s message system.',
      },
      signals: ['on_message', 'message_id', 'hash("hit")'],
    },
  ]),
  ...createQuestionSet('easy', 'cocos-typescript', [
    {
      snippetText: `import { _decorator, Component } from 'cc'
const { ccclass } = _decorator

@ccclass('Player')
export class Player extends Component {
  start() {
    console.log('ready')
  }
}`,
      distractors: ['phaser-typescript', 'typescript', 'unity-csharp'],
      hint: {
        th: 'มี _decorator, @ccclass และ extends Component',
        en: 'It uses _decorator, @ccclass, and extends Component.',
      },
      signals: ['from \'cc\'', '@ccclass', 'extends Component'],
    },
    {
      snippetText: `update(deltaTime: number) {
  const nextX = this.node.position.x + 120 * deltaTime
  this.node.setPosition(nextX, 0, 0)
}`,
      distractors: ['phaser-typescript', 'typescript', 'godot-gdscript'],
      hint: {
        th: 'มี this.node และ update(deltaTime: number)',
        en: 'It uses this.node with update(deltaTime: number).',
      },
      signals: ['update(deltaTime: number)', 'this.node.position', 'this.node.setPosition'],
    },
    {
      snippetText: `director.loadScene('main-menu')`,
      distractors: ['phaser-typescript', 'unity-csharp', 'rpg-maker-js'],
      hint: {
        th: 'director.loadScene เป็น API เปลี่ยนฉากของ Cocos',
        en: 'director.loadScene is a Cocos scene-loading API.',
      },
      signals: ['director.loadScene'],
    },
    {
      snippetText: `const bullet = instantiate(this.bulletPrefab)
this.node.addChild(bullet)`,
      distractors: ['phaser-typescript', 'unity-csharp', 'typescript'],
      hint: {
        th: 'มี instantiate กับ this.node.addChild',
        en: 'It uses instantiate with this.node.addChild.',
      },
      signals: ['instantiate', 'this.bulletPrefab', 'this.node.addChild'],
    },
    {
      snippetText: `input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)`,
      distractors: ['phaser-typescript', 'typescript', 'unity-csharp'],
      hint: {
        th: 'ดู input.on กับ Input.EventType.KEY_DOWN',
        en: 'Look at input.on with Input.EventType.KEY_DOWN.',
      },
      signals: ['input.on', 'Input.EventType.KEY_DOWN', 'this.onKeyDown'],
    },
  ]),
  ...createQuestionSet('easy', 'bevy-rust', [
    {
      snippetText: `fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Startup, setup)
        .run();
}`,
      distractors: ['rust', 'unreal-cpp', 'godot-gdscript'],
      hint: {
        th: 'มี App::new กับ add_systems(Startup, ...)',
        en: 'It uses App::new with add_systems(Startup, ...).',
      },
      signals: ['App::new()', 'DefaultPlugins', 'add_systems(Startup, setup)'],
    },
    {
      snippetText: `fn setup(mut commands: Commands) {
    commands.spawn(Camera2d);
}`,
      distractors: ['rust', 'unity-csharp', 'godot-gdscript'],
      hint: {
        th: 'มี Commands และ commands.spawn(...)',
        en: 'It uses Commands and commands.spawn(...).',
      },
      signals: ['Commands', 'commands.spawn', 'Camera2d'],
    },
    {
      snippetText: `fn move_player(
    mut query: Query<&mut Transform, With<Player>>,
    time: Res<Time>,
) {
    for mut transform in &mut query {
        transform.translation.x += 180.0 * time.delta_secs();
    }
}`,
      distractors: ['rust', 'unity-csharp', 'godot-gdscript'],
      hint: {
        th: 'มี Query<&mut Transform, With<Player>> กับ Res<Time>',
        en: 'It uses Query<&mut Transform, With<Player>> with Res<Time>.',
      },
      signals: ['Query<&mut Transform, With<Player>>', 'Res<Time>', 'time.delta_secs()'],
    },
    {
      snippetText: `fn fire(
    mut commands: Commands,
    keyboard: Res<ButtonInput<KeyCode>>,
) {
    if keyboard.just_pressed(KeyCode::Space) {
        commands.spawn(Bullet);
    }
}`,
      distractors: ['rust', 'unity-csharp', 'gamemaker-gml'],
      hint: {
        th: 'มี Res<ButtonInput<KeyCode>> และ commands.spawn(Bullet)',
        en: 'It uses Res<ButtonInput<KeyCode>> with commands.spawn(Bullet).',
      },
      signals: ['Res<ButtonInput<KeyCode>>', 'KeyCode::Space', 'commands.spawn(Bullet)'],
    },
    {
      snippetText: `#[derive(Component)]
struct Health(i32);`,
      distractors: ['rust', 'cpp', 'unreal-cpp'],
      hint: {
        th: 'มี derive(Component) ชัดมากในโลก ECS',
        en: 'derive(Component) is a very direct ECS clue.',
      },
      signals: ['#[derive(Component)]', 'struct Health(i32);'],
    },
  ]),
  ...createQuestionSet('easy', 'renpy-python', [
    {
      snippetText: `label start:
    scene bg classroom
    "Welcome to class."
    jump quiz_intro`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'มี label, scene และ jump ในสไตล์ visual novel',
        en: 'It uses label, scene, and jump in a visual-novel style.',
      },
      signals: ['label start:', 'scene bg', 'jump quiz_intro'],
    },
    {
      snippetText: `label quiz_intro:
    menu:
        "Start the quiz":
            jump question_one
        "Leave":
            return`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'menu: กับตัวเลือกบทสนทนาเป็นกลิ่นของ Ren\'Py',
        en: 'menu: with dialogue-style choices is a Ren\'Py smell.',
      },
      signals: ['menu:', '"Start the quiz":', 'jump question_one'],
    },
    {
      snippetText: `default score = 0

label bonus:
    $ score += 1
    "Current score: [score]"`,
      distractors: ['python', 'godot-gdscript', 'rpg-maker-js'],
      hint: {
        th: 'มี default score กับบทพูดที่แทรก [score]',
        en: 'It uses default score with dialogue interpolation like [score].',
      },
      signals: ['default score = 0', '$ score += 1', '"Current score: [score]"'],
    },
    {
      snippetText: `show eileen happy
e "Let's begin."
hide eileen`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'มี show/hide ตัวละครและบทพูดโดยตรง',
        en: 'It uses show/hide for characters with direct dialogue.',
      },
      signals: ['show eileen happy', 'e "..."', 'hide eileen'],
    },
    {
      snippetText: `call screen confirm_retry`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'call screen เป็นคำสั่งเฉพาะของระบบ UI ใน Ren\'Py',
        en: 'call screen is a Ren\'Py-specific UI command.',
      },
      signals: ['call screen'],
    },
  ]),
]
