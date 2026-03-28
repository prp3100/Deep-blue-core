import { createQuestionSet, type Difficulty, type GameLanguageId, type LanguageId, type LocalizedText, type QuestionBankItem, type QuestionSeed } from './quizModels'

type GameQuestionSeed = {
  snippetText: string
  hint: LocalizedText
  signals: string[]
  distractors?: [LanguageId, LanguageId, LanguageId]
}

const topicDistractorSets: Record<GameLanguageId, [LanguageId, LanguageId, LanguageId][]> = {
  'roblox-lua': [
    ['love2d-lua', 'godot-gdscript', 'gamemaker-gml'],
    ['love2d-lua', 'phaser-typescript', 'unity-csharp'],
  ],
  'love2d-lua': [
    ['roblox-lua', 'phaser-typescript', 'gamemaker-gml'],
    ['roblox-lua', 'godot-gdscript', 'unity-csharp'],
  ],
  'godot-gdscript': [
    ['roblox-lua', 'unity-csharp', 'gamemaker-gml'],
    ['love2d-lua', 'unity-csharp', 'rpg-maker-js'],
  ],
  'godot-shader': [
    ['glsl', 'unity-shaderlab', 'godot-gdscript'],
    ['glsl', 'unity-shaderlab', 'unreal-cpp'],
  ],
  'unity-csharp': [
    ['unreal-cpp', 'phaser-typescript', 'godot-gdscript'],
    ['unreal-cpp', 'roblox-lua', 'phaser-typescript'],
  ],
  'unity-shaderlab': [
    ['glsl', 'godot-shader', 'unity-csharp'],
    ['glsl', 'godot-shader', 'unreal-cpp'],
  ],
  'unreal-cpp': [
    ['unity-csharp', 'cpp', 'glsl'],
    ['unity-csharp', 'godot-gdscript', 'glsl'],
  ],
  glsl: [
    ['godot-shader', 'unity-shaderlab', 'unreal-cpp'],
    ['godot-shader', 'unity-shaderlab', 'godot-gdscript'],
  ],
  'phaser-typescript': [
    ['unity-csharp', 'love2d-lua', 'gamemaker-gml'],
    ['unity-csharp', 'rpg-maker-js', 'love2d-lua'],
  ],
  'rpg-maker-js': [
    ['phaser-typescript', 'gamemaker-gml', 'godot-gdscript'],
    ['phaser-typescript', 'unity-csharp', 'gamemaker-gml'],
  ],
  'gamemaker-gml': [
    ['roblox-lua', 'love2d-lua', 'godot-gdscript'],
    ['roblox-lua', 'phaser-typescript', 'rpg-maker-js'],
  ],
  'defold-lua': [
    ['love2d-lua', 'roblox-lua', 'godot-gdscript'],
    ['love2d-lua', 'cocos-typescript', 'gamemaker-gml'],
  ],
  'cocos-typescript': [
    ['phaser-typescript', 'typescript', 'unity-csharp'],
    ['phaser-typescript', 'defold-lua', 'godot-gdscript'],
  ],
  'bevy-rust': [
    ['rust', 'unreal-cpp', 'godot-gdscript'],
    ['rust', 'unity-csharp', 'cocos-typescript'],
  ],
  'renpy-python': [
    ['python', 'rpg-maker-js', 'godot-gdscript'],
    ['python', 'love2d-lua', 'defold-lua'],
  ],
}

export const createGameQuestionSet = (
  difficulty: Difficulty,
  answer: GameLanguageId,
  seeds: GameQuestionSeed[],
): QuestionBankItem[] =>
  createQuestionSet(
    difficulty,
    answer,
    seeds.map<QuestionSeed>((seed, index) => ({
      ...seed,
      distractors: seed.distractors ?? topicDistractorSets[answer][index % topicDistractorSets[answer].length],
    })),
  )
