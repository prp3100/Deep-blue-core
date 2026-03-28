import { createQuestionSet, type QuestionBankItem } from './quizModels'

export const gameHardQuestionBankExtensions: QuestionBankItem[] = [
  ...createQuestionSet('hard', 'defold-lua', [
    {
      snippetText: `function init(self)
  self.velocity = vmath.vector3()
  sprite.play_flipbook("#sprite", "idle")
end`,
      distractors: ['love2d-lua', 'godot-gdscript', 'roblox-lua'],
      hint: {
        th: 'มี vmath.vector3 กับ sprite.play_flipbook',
        en: 'It uses vmath.vector3 with sprite.play_flipbook.',
      },
      signals: ['vmath.vector3()', 'sprite.play_flipbook', 'init(self)'],
    },
    {
      snippetText: `function on_input(self, action_id, action)
  if action_id == hash("jump") and action.pressed then
    msg.post("#controller", "jump")
  end
end`,
      distractors: ['roblox-lua', 'love2d-lua', 'godot-gdscript'],
      hint: {
        th: 'มี hash("jump") และ msg.post ไปหา component',
        en: 'It uses hash("jump") with msg.post to a component.',
      },
      signals: ['on_input', 'hash("jump")', 'msg.post("#controller", "jump")'],
    },
    {
      snippetText: `local position = go.get_position()
go.animate(".", "position.y", go.PLAYBACK_ONCE_FORWARD, position.y + 64, go.EASING_OUTBACK, 0.25)`,
      distractors: ['love2d-lua', 'godot-gdscript', 'gamemaker-gml'],
      hint: {
        th: 'go.animate กับ go.PLAYBACK_ONCE_FORWARD ชี้ชัดมาก',
        en: 'go.animate with go.PLAYBACK_ONCE_FORWARD is very direct.',
      },
      signals: ['go.animate', 'go.PLAYBACK_ONCE_FORWARD', 'go.EASING_OUTBACK'],
    },
    {
      snippetText: `function final(self)
  msg.post("@render:", "clear_color", { color = vmath.vector4(0.08, 0.1, 0.14, 1) })
end`,
      distractors: ['love2d-lua', 'godot-shader', 'unity-shaderlab'],
      hint: {
        th: 'มี @render: และ clear_color ผ่าน msg.post',
        en: 'It uses @render: with clear_color via msg.post.',
      },
      signals: ['final(self)', '@render:', 'msg.post', 'vmath.vector4'],
    },
    {
      snippetText: `function update(self, dt)
  self.timer = self.timer + dt
  if self.timer > 1 then
    msg.post("hud#gui", "set_score", { value = self.score })
    self.timer = 0
  end
end`,
      distractors: ['roblox-lua', 'love2d-lua', 'rpg-maker-js'],
      hint: {
        th: 'มี hud#gui กับ message payload แบบ engine นี้',
        en: 'It uses hud#gui with a Defold-style message payload.',
      },
      signals: ['update(self, dt)', 'msg.post("hud#gui"', '{ value = self.score }'],
    },
  ]),
  ...createQuestionSet('hard', 'cocos-typescript', [
    {
      snippetText: `import { _decorator, Component, Prefab } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Spawner')
export class Spawner extends Component {
  @property(Prefab)
  enemyPrefab: Prefab | null = null
}`,
      distractors: ['phaser-typescript', 'typescript', 'unity-csharp'],
      hint: {
        th: 'มี @property(Prefab) และ class extends Component',
        en: 'It uses @property(Prefab) with a class that extends Component.',
      },
      signals: ['from \'cc\'', '@property(Prefab)', 'Prefab | null', 'extends Component'],
    },
    {
      snippetText: `tween(this.node)
  .to(0.2, { position: new Vec3(0, 120, 0) })
  .union()
  .repeat(2)
  .start()`,
      distractors: ['phaser-typescript', 'typescript', 'godot-gdscript'],
      hint: {
        th: 'มี tween(this.node) กับ new Vec3',
        en: 'It uses tween(this.node) with new Vec3.',
      },
      signals: ['tween(this.node)', 'new Vec3', '.union()', '.repeat(2)'],
    },
    {
      snippetText: `resources.load('audio/hit', AudioClip, (error, clip) => {
  if (!error && clip) {
    this.audioSource.playOneShot(clip)
  }
})`,
      distractors: ['phaser-typescript', 'typescript', 'unity-csharp'],
      hint: {
        th: 'resources.load กับ AudioClip เป็น API ของ Cocos',
        en: 'resources.load with AudioClip is a Cocos API clue.',
      },
      signals: ['resources.load', 'AudioClip', 'playOneShot'],
    },
    {
      snippetText: `scheduleOnce(() => {
  director.loadScene('result')
}, 1.2)`,
      distractors: ['phaser-typescript', 'typescript', 'rpg-maker-js'],
      hint: {
        th: 'มี scheduleOnce แล้วค่อย director.loadScene',
        en: 'It uses scheduleOnce before director.loadScene.',
      },
      signals: ['scheduleOnce', 'director.loadScene', '=>'],
    },
    {
      snippetText: `const ui = find('Canvas/Hud')
ui?.getComponent(UITransform)?.setContentSize(320, 80)`,
      distractors: ['phaser-typescript', 'typescript', 'godot-gdscript'],
      hint: {
        th: 'มี find("Canvas/Hud") และ UITransform',
        en: 'It uses find("Canvas/Hud") with UITransform.',
      },
      signals: ['find(\'Canvas/Hud\')', 'getComponent(UITransform)', 'setContentSize'],
    },
  ]),
  ...createQuestionSet('hard', 'bevy-rust', [
    {
      snippetText: `App::new()
    .add_plugins(DefaultPlugins)
    .add_systems(Update, (move_player, animate_enemies).chain())
    .run();`,
      distractors: ['rust', 'unreal-cpp', 'godot-gdscript'],
      hint: {
        th: 'มี add_systems(Update, ...).chain() แบบ ECS',
        en: 'It uses add_systems(Update, ...).chain() in an ECS style.',
      },
      signals: ['App::new()', 'add_systems(Update, ...)', '.chain()'],
    },
    {
      snippetText: `fn read_collisions(
    mut events: EventReader<CollisionEvent>,
    mut damage_writer: EventWriter<DamageEvent>,
) {
    for event in events.read() {
        damage_writer.send(DamageEvent::from(event));
    }
}`,
      distractors: ['rust', 'unreal-cpp', 'godot-gdscript'],
      hint: {
        th: 'มี EventReader กับ EventWriter',
        en: 'It uses EventReader with EventWriter.',
      },
      signals: ['EventReader<CollisionEvent>', 'EventWriter<DamageEvent>', 'events.read()'],
    },
    {
      snippetText: `fn finish_round(
    mut next_state: ResMut<NextState<GameState>>,
    keyboard: Res<ButtonInput<KeyCode>>,
) {
    if keyboard.just_pressed(KeyCode::Enter) {
        next_state.set(GameState::Results);
    }
}`,
      distractors: ['rust', 'godot-gdscript', 'unity-csharp'],
      hint: {
        th: 'มี ResMut<NextState<GameState>> กับ set(GameState::Results)',
        en: 'It uses ResMut<NextState<GameState>> with set(GameState::Results).',
      },
      signals: ['ResMut<NextState<GameState>>', 'KeyCode::Enter', 'next_state.set(...)'],
    },
    {
      snippetText: `fn chase_target(
    mut query: Query<(&Transform, &mut Velocity), (With<Enemy>, Without<Player>)>,
) {
    for (_transform, mut velocity) in &mut query {
        velocity.x = 120.0;
    }
}`,
      distractors: ['rust', 'unity-csharp', 'unreal-cpp'],
      hint: {
        th: 'มี Query หลายชนิดพร้อม With/Without filter',
        en: 'It uses a multi-type Query with With/Without filters.',
      },
      signals: ['Query<(&Transform, &mut Velocity), ...>', 'With<Enemy>', 'Without<Player>'],
    },
    {
      snippetText: `#[derive(Component)]
struct Lifetime {
    timer: Timer,
}

fn tick_lifetime(mut query: Query<&mut Lifetime>, time: Res<Time>) {
    for mut lifetime in &mut query {
        lifetime.timer.tick(time.delta());
    }
}`,
      distractors: ['rust', 'godot-gdscript', 'unity-csharp'],
      hint: {
        th: 'มี Timer กับ time.delta() ใน system ของ Bevy',
        en: 'It uses Timer with time.delta() inside a Bevy system.',
      },
      signals: ['Timer', 'Query<&mut Lifetime>', 'time.delta()', '#[derive(Component)]'],
    },
  ]),
  ...createQuestionSet('hard', 'renpy-python', [
    {
      snippetText: `screen inventory():
    frame:
        vbox:
            text "Inventory"
            textbutton "Close" action Hide("inventory")`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'screen language มี textbutton กับ action Hide(...)',
        en: 'The screen language uses textbutton with action Hide(...).',
      },
      signals: ['screen inventory():', 'vbox', 'textbutton', 'Hide("inventory")'],
    },
    {
      snippetText: `init python:
    def add_points(amount):
        store.score += amount`,
      distractors: ['python', 'godot-gdscript', 'rpg-maker-js'],
      hint: {
        th: 'มี init python: และ store.score',
        en: 'It uses init python: with store.score.',
      },
      signals: ['init python:', 'def add_points(amount):', 'store.score'],
    },
    {
      snippetText: `label result_screen:
    if score >= 3:
        jump good_end
    else:
        jump retry_end`,
      distractors: ['python', 'godot-gdscript', 'rpg-maker-js'],
      hint: {
        th: 'เป็น flow ของ label ที่ใช้ jump เปลี่ยนฉากเรื่อง',
        en: 'It uses label flow with jump to branch the story.',
      },
      signals: ['label result_screen:', 'if score >= 3:', 'jump good_end'],
    },
    {
      snippetText: `transform bounce_in:
    yoffset 30
    linear 0.2 yoffset 0`,
      distractors: ['python', 'godot-gdscript', 'love2d-lua'],
      hint: {
        th: 'มี transform กับ linear ใน DSL ของ Ren\'Py',
        en: 'It uses transform with linear in Ren\'Py’s DSL.',
      },
      signals: ['transform bounce_in:', 'yoffset 30', 'linear 0.2 yoffset 0'],
    },
    {
      snippetText: `screen choice_panel(items):
    for item in items:
        textbutton item.caption action Jump(item.target)`,
      distractors: ['python', 'rpg-maker-js', 'godot-gdscript'],
      hint: {
        th: 'screen language วนลูปสร้าง textbutton พร้อม Jump(...)',
        en: 'The screen language loops over items to build textbutton actions with Jump(...).',
      },
      signals: ['screen choice_panel(items):', 'for item in items:', 'textbutton', 'Jump(item.target)'],
    },
  ]),
]
