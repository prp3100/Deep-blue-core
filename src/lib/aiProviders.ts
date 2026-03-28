export type LocalizedText = {
  th: string
  en: string
}

export type ArenaAiProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'huggingface'
  | 'meta'
  | 'xai'
  | 'mistral'
  | 'groq'
  | 'together'
  | 'fireworks'
  | 'perplexity'
  | 'deepseek'
  | 'sambanova'
  | 'cerebras'
  | 'cloudflare'
  | 'ai21'
  | 'deepinfra'
  | 'nebius'
  | 'moonshot'
  | 'hyperbolic'
  | 'alibaba'

type AiProviderProtocol = 'openai' | 'anthropic' | 'google'

export type ArenaAiProviderTier = 'verified' | 'beta'

export type ArenaAiBrowserSupport = 'good' | 'mixed'

export type ArenaModelTag = 'general' | 'reasoning' | 'coding' | 'preview'

type ArenaModelDiscoveryStrategy = 'openai-models' | 'anthropic-models' | 'google-models'

export type ArenaModelOption = {
  id: string
  label: string
  description: LocalizedText
}

export type ArenaDiscoveredModel = ArenaModelOption & {
  tag: ArenaModelTag
}

type ProviderExtraField = {
  key: 'accountId'
  label: LocalizedText
  placeholder: LocalizedText
}

type ArenaAiResponseStrategy = 'compact-json'

export type ArenaAiProviderRuntimeProfile = {
  arenaAnswer: {
    temperature: number
    topP: number
    maxTokens: number
    timeoutBudgetMs: number
    retryCount: number
    transientRetryCount: number
    transientRetryBackoffMs: number
    responseStrategy: ArenaAiResponseStrategy
  }
  capabilityProbe: {
    enabled: boolean
    temperature: number
    maxTokens: number
    timeoutBudgetMs: number
  }
}

type ArenaModelCapability = 'yes' | 'maybe' | 'no'

type ArenaModelDiscoveryRecord = {
  id: string
  label?: string
  description?: string
  tag?: ArenaModelTag
  capability?: ArenaModelCapability
}

export type ArenaAiProviderDefinition = {
  id: ArenaAiProviderId
  label: string
  docsUrl: string
  protocol: AiProviderProtocol
  tier: ArenaAiProviderTier
  browserSupport: ArenaAiBrowserSupport
  supportsArena: boolean
  supportsCoach: boolean
  requiresExtraField: boolean
  supportsModelDiscovery: boolean
  modelDiscoveryStrategy?: ArenaModelDiscoveryStrategy
  defaultBaseUrl: string
  baseUrlLabel: LocalizedText
  keyLabel: LocalizedText
  keyPlaceholder: LocalizedText
  note: LocalizedText
  recommendedModels: ArenaModelOption[]
  defaultModelId: string
  runtimeProfile: ArenaAiProviderRuntimeProfile
  extraField?: ProviderExtraField
}

type ArenaAiProviderDefinitionBase = Omit<
  ArenaAiProviderDefinition,
  'tier' | 'browserSupport' | 'supportsArena' | 'supportsCoach' | 'requiresExtraField' | 'supportsModelDiscovery' | 'runtimeProfile'
>

type ArenaAiProviderCapabilities = Pick<
  ArenaAiProviderDefinition,
  'tier' | 'browserSupport' | 'supportsArena' | 'supportsCoach' | 'supportsModelDiscovery' | 'runtimeProfile'
>

export type ArenaAiSettings = {
  providerId: ArenaAiProviderId
  apiBaseUrl: string
  modelId: string
  extraFieldValue: string
}

export type ArenaAiClientConfig = ArenaAiSettings & {
  apiKey: string
}

type ArenaModelDiscoveryConfig = Pick<ArenaAiClientConfig, 'providerId' | 'apiBaseUrl' | 'extraFieldValue' | 'apiKey'>

type ArenaAiJsonSchema = Record<string, unknown>

export type RequestAiStructuredOutput = {
  name: string
  description?: string
  schema: ArenaAiJsonSchema
}

export type RequestAiTextOptions = {
  config: ArenaAiClientConfig
  system: string
  user: string
  maxTokens?: number
  temperature?: number
  topP?: number
  structuredOutput?: RequestAiStructuredOutput
  retryCount?: number
  retryBackoffMs?: number
  signal?: AbortSignal
}

const text = (th: string, en: string): LocalizedText => ({ th, en })

const model = (id: string, label: string, th: string, en: string): ArenaModelOption => ({
  id,
  label,
  description: text(th, en),
})

const createRuntimeProfile = (
  overrides?: {
    arenaAnswer?: Partial<ArenaAiProviderRuntimeProfile['arenaAnswer']>
    capabilityProbe?: Partial<ArenaAiProviderRuntimeProfile['capabilityProbe']>
  },
): ArenaAiProviderRuntimeProfile => ({
  arenaAnswer: {
    temperature: 0,
    topP: 0.9,
    maxTokens: 88,
    timeoutBudgetMs: 12000,
    retryCount: 1,
    transientRetryCount: 1,
    transientRetryBackoffMs: 650,
    responseStrategy: 'compact-json',
    ...overrides?.arenaAnswer,
  },
  capabilityProbe: {
    enabled: true,
    temperature: 0,
    maxTokens: 6,
    timeoutBudgetMs: 4200,
    ...overrides?.capabilityProbe,
  },
})

const ARENA_AI_PROVIDER_BASES: ArenaAiProviderDefinitionBase[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    docsUrl: 'https://platform.openai.com/docs/api-reference/chat',
    protocol: 'openai',
    modelDiscoveryStrategy: 'openai-models',
    defaultBaseUrl: 'https://api.openai.com/v1',
    baseUrlLabel: text('OpenAI Base URL', 'OpenAI base URL'),
    keyLabel: text('OpenAI API Key', 'OpenAI API key'),
    keyPlaceholder: text('วาง OpenAI key', 'Paste your OpenAI key'),
    note: text('เร็วและเหมาะกับงานสรุปหรือวิเคราะห์หลังจบเกม', 'Fast and reliable for match answers and post-run coaching.'),
    recommendedModels: [
      model('gpt-5.2', 'GPT-5.2', 'เรือธงล่าสุด', 'Latest flagship'),
      model('gpt-5.2-pro', 'GPT-5.2 Pro', 'เวอร์ชันแม่นยำขึ้นของ 5.2', 'Smarter GPT-5.2 variant'),
      model('gpt-5.1', 'GPT-5.1', 'เรือธงรุ่นก่อนหน้า', 'Previous flagship'),
      model('gpt-5.1-mini', 'GPT-5.1 mini', 'รุ่นเล็กของ 5.1', 'Smaller GPT-5.1 option'),
      model('gpt-5-mini', 'GPT-5 mini', 'GPT-5 สายเร็วคุ้ม', 'Fast GPT-5 option'),
      model('gpt-4.1', 'GPT-4.1', 'รุ่น non-reasoning คุณภาพสูง', 'High-end non-reasoning model'),
      model('gpt-4.1-mini', 'GPT-4.1 mini', 'บาลานซ์ดีสำหรับอารีนา', 'Balanced 4.1 option'),
      model('gpt-5-nano', 'GPT-5 nano', 'เร็วและประหยัดสุด', 'Fastest GPT-5'),
      model('gpt-4.1-nano', 'GPT-4.1 nano', 'เบาสุดในสาย 4.1', 'Smallest 4.1 option'),
    ],
    defaultModelId: 'gpt-5.2',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    docsUrl: 'https://docs.anthropic.com/en/api/messages',
    protocol: 'anthropic',
    modelDiscoveryStrategy: 'anthropic-models',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    baseUrlLabel: text('Anthropic Base URL', 'Anthropic base URL'),
    keyLabel: text('Anthropic API Key', 'Anthropic API key'),
    keyPlaceholder: text('วาง Anthropic key', 'Paste your Anthropic key'),
    note: text('เหมาะกับคำอธิบายและ feedback ที่อ่านง่าย', 'Great for readable explanations and coaching.'),
    recommendedModels: [
      model('claude-sonnet-4-20250514', 'Claude Sonnet 4', 'รุ่นสมดุลล่าสุด', 'Latest balanced Claude'),
      model('claude-opus-4-1-20250805', 'Claude Opus 4.1', 'ตัวท็อปล่าสุด', 'Latest top-tier Claude'),
      model('claude-opus-4-20250514', 'Claude Opus 4', 'รุ่นท็อปก่อนหน้า', 'Previous flagship'),
      model('claude-3-7-sonnet-latest', 'Claude Sonnet 3.7', 'คิดเป็นขั้นตอนดี', 'Strong extended-thinking option'),
      model('claude-3-5-sonnet-latest', 'Claude Sonnet 3.5', 'รุ่นเก่าที่ยังนิยม', 'Reliable previous generation'),
      model('claude-3-5-haiku-latest', 'Claude Haiku 3.5', 'เร็วมาก', 'Very fast'),
      model('claude-3-haiku-20240307', 'Claude Haiku 3', 'รุ่นเล็กเก่าสุดในลิสต์', 'Legacy compact option'),
    ],
    defaultModelId: 'claude-sonnet-4-20250514',
  },
  {
    id: 'google',
    label: 'Google Gemini',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    protocol: 'google',
    modelDiscoveryStrategy: 'google-models',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    baseUrlLabel: text('Gemini Base URL', 'Gemini base URL'),
    keyLabel: text('Google AI API Key', 'Google AI API key'),
    keyPlaceholder: text('วาง Google AI key', 'Paste your Google AI key'),
    note: text('ดีสำหรับคำตอบเร็วและสรุปแนวอ่านต่อ', 'Good for quick answers and study guidance.'),
    recommendedModels: [
      model('gemini-2.5-flash', 'Gemini 2.5 Flash', 'รุ่นหลักที่คุ้มสุด', 'Best value mainstream Gemini'),
      model('gemini-2.5-pro', 'Gemini 2.5 Pro', 'ตัวคิดวิเคราะห์หลัก', 'Main advanced reasoning model'),
      model('gemini-2.5-flash-lite', 'Gemini 2.5 Flash-Lite', 'เร็วและประหยัด', 'Fast cost-efficient option'),
      model('gemini-3-flash-preview', 'Gemini 3 Flash Preview', 'แฟลชรุ่นใหม่แบบพรีวิว', 'Newest Flash preview'),
      model('gemini-3-pro-preview', 'Gemini 3 Pro Preview', 'โปรรุ่นใหม่แบบพรีวิว', 'Newest Pro preview'),
      model('gemini-2.0-flash', 'Gemini 2.0 Flash', 'รุ่นเวิร์กฮอร์สก่อนหน้า', 'Previous workhorse'),
      model('gemini-2.0-flash-lite', 'Gemini 2.0 Flash-Lite', 'รุ่นเล็กก่อนหน้า', 'Previous lite option'),
    ],
    defaultModelId: 'gemini-2.5-flash',
  },
  {
    id: 'huggingface',
    label: 'Hugging Face',
    docsUrl: 'https://huggingface.co/docs/hub/models-inference',
    protocol: 'openai',
    modelDiscoveryStrategy: 'openai-models',
    defaultBaseUrl: 'https://router.huggingface.co/v1',
    baseUrlLabel: text('Hugging Face Base URL', 'Hugging Face base URL'),
    keyLabel: text('Hugging Face User Access Token', 'Hugging Face user access token'),
    keyPlaceholder: text('วาง HF token ของบัญชีฟรีหรือ Pro', 'Paste your HF token from a free or Pro account'),
    note: text(
      'ใช้บัญชี Hugging Face ฟรีเพื่อทดลอง Arena ได้ผ่าน monthly credits บน Inference Providers โดยไม่ต้องตั้ง backend เพิ่ม',
      'Use a free Hugging Face account to try Arena with monthly Inference Providers credits and no extra backend.',
    ),
    recommendedModels: [
      model('Qwen/Qwen2.5-7B-Instruct', 'Qwen2.5 7B Instruct', 'ตัวกลางที่คุยหลายภาษาได้ดีและคุม JSON ค่อนข้างนิ่ง', 'Balanced multilingual chat model with solid JSON obedience'),
      model('meta-llama/Llama-3.1-8B-Instruct', 'Llama 3.1 8B Instruct', 'โมเดลกลางที่ตอบไวและหาง่ายใน ecosystem ของ HF', 'Fast mid-tier model that is widely available on HF'),
      model('google/gemma-2-9b-it', 'Gemma 2 9B IT', 'อีกตัวเลือกกลาง ๆ ที่ค่อนข้างประหยัดและตอบสั้นดี', 'Another mid-tier option that is efficient and concise'),
      model('microsoft/Phi-4-mini-instruct', 'Phi 4 Mini Instruct', 'ตัวเล็กกว่าแต่ยังพอใช้ซ้อม Arena ได้', 'Smaller model that is still usable for Arena practice'),
    ],
    defaultModelId: 'Qwen/Qwen2.5-7B-Instruct',
  },
  {
    id: 'meta',
    label: 'Meta Llama',
    docsUrl: 'https://llama.developer.meta.com/',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.llama.com/compat/v1',
    baseUrlLabel: text('Meta Llama Base URL', 'Meta Llama base URL'),
    keyLabel: text('Meta Llama API Key', 'Meta Llama API key'),
    keyPlaceholder: text('วาง Meta Llama key', 'Paste your Meta Llama key'),
    note: text('รอบนี้เปิดแบบ beta และใช้ลิสต์แชตโมเดลที่คัดไว้ก่อน', 'Beta support for Meta Llama with a curated chat-model list first.'),
    recommendedModels: [
      model('Llama-4-Maverick-17B-128E-Instruct-FP8', 'Llama 4 Maverick', 'Llama 4 รุ่นหลักสำหรับแชต', 'Primary Llama 4 chat model'),
      model('Llama-4-Scout-17B-16E-Instruct-FP8', 'Llama 4 Scout', 'Llama 4 รุ่นเร็วกว่า', 'Faster Llama 4 option'),
      model('Llama-3.3-70B-Instruct', 'Llama 3.3 70B Instruct', 'รุ่นสมดุลก่อนหน้า', 'Balanced previous generation'),
      model('Llama-3.2-11B-Vision-Instruct', 'Llama 3.2 11B Instruct', 'ตัวเลือกขนาดกลางที่เบากว่า', 'Lighter mid-size option'),
    ],
    defaultModelId: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
  },
  {
    id: 'xai',
    label: 'xAI',
    docsUrl: 'https://docs.x.ai/docs/api-reference',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.x.ai/v1',
    baseUrlLabel: text('xAI Base URL', 'xAI base URL'),
    keyLabel: text('xAI API Key', 'xAI API key'),
    keyPlaceholder: text('วาง xAI key', 'Paste your xAI key'),
    note: text('เหมาะกับการแข่งตอบไวแบบตรงประเด็น', 'Great for quick direct answers in Arena.'),
    recommendedModels: [
      model('grok-4-fast-non-reasoning', 'Grok 4 Fast Non-Reasoning', 'เร็วมากสำหรับงานแชต', 'Low-latency chat mode'),
      model('grok-4-fast-reasoning', 'Grok 4 Fast Reasoning', 'คิดเป็นขั้นตอนแต่ยังเร็ว', 'Fast reasoning variant'),
      model('grok-4-0709', 'Grok 4 0709', 'รุ่น Grok 4 แบบสแนปช็อต', 'Pinned Grok 4 snapshot'),
      model('grok-3', 'Grok 3', 'รุ่นหลักสายเสถียร', 'Stable Grok 3 default'),
      model('grok-3-fast', 'Grok 3 Fast', 'alias สายตอบไว', 'Fast Grok 3 alias'),
      model('grok-3-mini', 'Grok 3 mini', 'ตัวเล็กและเบา', 'Smaller Grok option'),
    ],
    defaultModelId: 'grok-4-fast-non-reasoning',
  },
  {
    id: 'mistral',
    label: 'Mistral',
    docsUrl: 'https://docs.mistral.ai/api/',
    protocol: 'openai',
    modelDiscoveryStrategy: 'openai-models',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    baseUrlLabel: text('Mistral Base URL', 'Mistral base URL'),
    keyLabel: text('Mistral API Key', 'Mistral API key'),
    keyPlaceholder: text('วาง Mistral key', 'Paste your Mistral key'),
    note: text('โทนยุโรป ใช้ง่าย และตอบเร็วดี', 'Fast, practical, and easy to wire in.'),
    recommendedModels: [
      model('mistral-small-latest', 'Mistral Small 3.2', 'เร็วและคุ้ม', 'Fast and efficient'),
      model('mistral-medium-latest', 'Mistral Medium 3.1', 'สมดุลขึ้น', 'Balanced mid-tier option'),
      model('mistral-large-latest', 'Mistral Large 3', 'เน้นคุณภาพ', 'Higher quality'),
      model('magistral-small-latest', 'Magistral Small 1.2', 'สาย reasoning ขนาดเล็ก', 'Smaller reasoning line'),
      model('magistral-medium-latest', 'Magistral Medium 1.2', 'reasoning รุ่นกลาง', 'Mid-tier reasoning line'),
      model('ministral-14b-latest', 'Ministral 14B', 'บริบทกว้างแต่ยังประหยัด', 'Efficient 14B option'),
      model('ministral-8b-latest', 'Ministral 8B', 'รุ่น 8B ประหยัด', 'Compact 8B option'),
      model('ministral-3b-latest', 'Ministral 3B', 'รุ่นเล็กสุด', 'Smallest Ministral'),
    ],
    defaultModelId: 'mistral-small-latest',
  },
  {
    id: 'groq',
    label: 'Groq',
    docsUrl: 'https://console.groq.com/docs/api-reference',
    protocol: 'openai',
    modelDiscoveryStrategy: 'openai-models',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    baseUrlLabel: text('Groq Base URL', 'Groq base URL'),
    keyLabel: text('Groq API Key', 'Groq API key'),
    keyPlaceholder: text('วาง Groq key', 'Paste your Groq key'),
    note: text('จุดเด่นคือ latency ต่ำ เหมาะกับแข่งขันสด', 'Ultra-low latency and ideal for live Arena play.'),
    recommendedModels: [
      model('llama-3.3-70b-versatile', 'Llama 3.3 70B Versatile', 'เร็วมาก', 'Very fast'),
      model('llama-3.1-8b-instant', 'Llama 3.1 8B Instant', 'เบาและเร็วสุด', 'Lightest and fastest'),
      model('openai/gpt-oss-120b', 'GPT-OSS 120B', 'โอเพ่นเวตสาย reasoning', 'Open-weight high reasoning model'),
      model('openai/gpt-oss-20b', 'GPT-OSS 20B', 'โอเพ่นเวตรุ่นเล็กกว่า', 'Smaller open-weight option'),
      model('meta-llama/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 'รุ่นใหม่สาย multimodal', 'Newer Llama 4 chat model'),
      model('moonshotai/kimi-k2-instruct-0905', 'Kimi K2 0905', 'Kimi บน Groq', 'Kimi served on Groq'),
      model('qwen/qwen3-32b', 'Qwen3 32B', 'Qwen รุ่น reasoning ไฮบริด', 'Hybrid reasoning Qwen'),
      model('groq/compound-mini', 'Compound Mini', 'ระบบตอบพร้อมเครื่องมือแบบเบา', 'Lightweight Groq system'),
      model('groq/compound', 'Compound', 'ระบบตอบพร้อมเครื่องมือเต็ม', 'Full Groq system'),
    ],
    defaultModelId: 'llama-3.3-70b-versatile',
  },
  {
    id: 'together',
    label: 'Together AI',
    docsUrl: 'https://docs.together.ai/reference/chat-completions-1',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.together.xyz/v1',
    baseUrlLabel: text('Together Base URL', 'Together base URL'),
    keyLabel: text('Together API Key', 'Together API key'),
    keyPlaceholder: text('วาง Together key', 'Paste your Together key'),
    note: text('มีตัวเลือก open model เยอะ เหมาะกับคนชอบลองหลายโมเดล', 'Great when you want many open-model options.'),
    recommendedModels: [
      model('moonshotai/Kimi-K2.5', 'Kimi K2.5', 'Kimi รุ่นล่าสุดใน Together', 'Latest Kimi on Together'),
      model('moonshotai/Kimi-K2-Instruct-0905', 'Kimi K2 0905', 'Kimi snapshot ล่าสุดสาย instruct', 'Latest instruct snapshot'),
      model('moonshotai/Kimi-K2-Thinking', 'Kimi K2 Thinking', 'สายคิดเป็นขั้นตอน', 'Reasoning-first Kimi'),
      model('Qwen/Qwen3.5-397B-A17B', 'Qwen3.5 397B A17B', 'Qwen รุ่นใหญ่ล่าสุด', 'Latest large Qwen'),
      model('Qwen/Qwen3-235B-A22B-Instruct-2507-tput', 'Qwen3 235B Instruct 2507', 'Qwen รุ่นใหญ่สายแชต', 'Large Qwen chat model'),
      model('Qwen/Qwen3-235B-A22B-Thinking-2507', 'Qwen3 235B Thinking 2507', 'Qwen สาย reasoning', 'Large Qwen reasoning model'),
      model('Qwen/Qwen3-Next-80B-A3B-Instruct', 'Qwen3 Next 80B Instruct', 'เร็วกว่า Qwen ตัวใหญ่', 'Faster next-gen Qwen'),
      model('Qwen/Qwen3-Coder-Next-FP8', 'Qwen3 Coder Next', 'คุยงาน dev ได้เก่ง', 'Strong coding chat option'),
      model('deepseek-ai/DeepSeek-V3.1', 'DeepSeek V3.1', 'DeepSeek รุ่นแชตล่าสุด', 'Latest DeepSeek chat model'),
      model('deepseek-ai/DeepSeek-R1', 'DeepSeek R1', 'DeepSeek สาย reasoning', 'Reasoning DeepSeek'),
      model('meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', 'Llama 4 Maverick', 'Llama 4 รุ่นใหญ่', 'Large Llama 4 model'),
      model('meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Llama 3.3 70B Turbo', 'บาลานซ์ดี', 'Balanced fast choice'),
    ],
    defaultModelId: 'moonshotai/Kimi-K2.5',
  },
  {
    id: 'fireworks',
    label: 'Fireworks AI',
    docsUrl: 'https://fireworks.ai/docs/api-reference/post-chatcompletions',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.fireworks.ai/inference/v1',
    baseUrlLabel: text('Fireworks Base URL', 'Fireworks base URL'),
    keyLabel: text('Fireworks API Key', 'Fireworks API key'),
    keyPlaceholder: text('วาง Fireworks key', 'Paste your Fireworks key'),
    note: text('เหมาะกับสาย inference เร็วบน open model', 'Good for fast open-model inference.'),
    recommendedModels: [
      model('accounts/fireworks/models/deepseek-v3p1', 'DeepSeek V3.1', 'ตัวเด่นล่าสุดบน Fireworks', 'Latest featured DeepSeek'),
      model('accounts/fireworks/models/llama-v4-scout-instruct-basic', 'Llama 4 Scout', 'Llama 4 รุ่นใหม่', 'Newer Llama 4 option'),
      model('accounts/fireworks/models/llama-v3p3-70b-instruct', 'Llama 3.3 70B', 'เร็วและแม่นใช้ได้', 'Fast and solid'),
      model('accounts/fireworks/models/qwen2p5-72b-instruct', 'Qwen 2.5 72B', 'เด่นด้านภาษา', 'Strong on language nuance'),
      model('accounts/fireworks/models/qwen2p5-7b-instruct', 'Qwen 2.5 7B', 'ตัวเล็กและตอบไว', 'Smaller fast option'),
    ],
    defaultModelId: 'accounts/fireworks/models/deepseek-v3p1',
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    docsUrl: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.perplexity.ai',
    baseUrlLabel: text('Perplexity Base URL', 'Perplexity base URL'),
    keyLabel: text('Perplexity API Key', 'Perplexity API key'),
    keyPlaceholder: text('วาง Perplexity key', 'Paste your Perplexity key'),
    note: text('เหมาะกับคำตอบสั้น ๆ ตรงประเด็นและมีบุคลิกชัด', 'Good for concise, high-tempo answers.'),
    recommendedModels: [
      model('sonar-pro', 'Sonar Pro', 'ค้นหาเก่งและตอบแน่นขึ้น', 'Higher quality grounded search'),
      model('sonar', 'Sonar', 'เน้นเร็ว', 'Fast grounded search'),
      model('sonar-reasoning-pro', 'Sonar Reasoning Pro', 'คิดหลายขั้นพร้อมค้นหา', 'Reasoning with search'),
      model('sonar-deep-research', 'Sonar Deep Research', 'ค้นลึกและสรุปรายงานยาว', 'Deep research report model'),
    ],
    defaultModelId: 'sonar-pro',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    docsUrl: 'https://api-docs.deepseek.com/',
    protocol: 'openai',
    modelDiscoveryStrategy: 'openai-models',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    baseUrlLabel: text('DeepSeek Base URL', 'DeepSeek base URL'),
    keyLabel: text('DeepSeek API Key', 'DeepSeek API key'),
    keyPlaceholder: text('วาง DeepSeek key', 'Paste your DeepSeek key'),
    note: text('แรงเรื่องวิเคราะห์เชิงโค้ดและราคาคุ้ม', 'Strong on code reasoning with efficient pricing.'),
    recommendedModels: [
      model('deepseek-chat', 'DeepSeek Chat', 'ชี้ไป DeepSeek-V3.2 โหมดไม่คิด', 'General chat alias'),
      model('deepseek-reasoner', 'DeepSeek Reasoner', 'ชี้ไป DeepSeek-V3.2 โหมดคิด', 'Reasoning alias'),
    ],
    defaultModelId: 'deepseek-chat',
  },
  {
    id: 'sambanova',
    label: 'SambaNova',
    docsUrl: 'https://docs.sambanova.ai/cloud/docs/get-started/overview',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.sambanova.ai/v1',
    baseUrlLabel: text('SambaNova Base URL', 'SambaNova base URL'),
    keyLabel: text('SambaNova API Key', 'SambaNova API key'),
    keyPlaceholder: text('วาง SambaNova key', 'Paste your SambaNova key'),
    note: text('เหมาะกับสาย open model latency ดี', 'Fast hosted open-model option.'),
    recommendedModels: [
      model('DeepSeek-V3.1', 'DeepSeek V3.1', 'รุ่นแชตล่าสุดใน SambaCloud', 'Latest chat model on SambaCloud'),
      model('DeepSeek-R1-0528', 'DeepSeek R1 0528', 'สาย reasoning ล่าสุด', 'Latest reasoning release'),
      model('DeepSeek-V3-0324', 'DeepSeek V3 0324', 'รุ่นก่อนหน้าที่ยังอยู่ในลิสต์', 'Previous DeepSeek release'),
      model('DeepSeek-R1-Distill-Llama-70B', 'DeepSeek R1 Distill Llama 70B', 'reasoning แบบ distill', 'Distilled reasoning model'),
      model('Meta-Llama-3.3-70B-Instruct', 'Meta Llama 3.3 70B', 'ค่ากลางที่ดี', 'Reliable default'),
      model('Llama-4-Maverick-17B-128E-Instruct', 'Llama 4 Maverick', 'พรีวิว Llama 4 รุ่นใหญ่', 'Preview Llama 4 option'),
      model('Qwen3-32B', 'Qwen3 32B', 'Qwen พรีวิว', 'Preview Qwen option'),
      model('Meta-Llama-3.1-8B-Instruct', 'Meta Llama 3.1 8B', 'ตัวเล็กและเร็ว', 'Small fast option'),
    ],
    defaultModelId: 'DeepSeek-V3.1',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    docsUrl: 'https://inference-docs.cerebras.ai/api-reference/chat-completions',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.cerebras.ai/v1',
    baseUrlLabel: text('Cerebras Base URL', 'Cerebras base URL'),
    keyLabel: text('Cerebras API Key', 'Cerebras API key'),
    keyPlaceholder: text('วาง Cerebras key', 'Paste your Cerebras key'),
    note: text('จุดเด่นคือ inference เร็วมาก', 'Known for extremely fast inference.'),
    recommendedModels: [
      model('gpt-oss-120b', 'GPT-OSS 120B', 'production model สาย reasoning', 'Production reasoning model'),
      model('llama3.1-8b', 'Llama 3.1 8B', 'เบาและไว', 'Light and speedy'),
      model('qwen-3-235b-a22b-instruct-2507', 'Qwen3 235B Instruct 2507', 'Qwen พรีวิวขนาดใหญ่', 'Large preview Qwen'),
      model('zai-glm-4.7', 'GLM 4.7', 'พรีวิว GLM ล่าสุด', 'Latest preview GLM'),
    ],
    defaultModelId: 'gpt-oss-120b',
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare Workers AI',
    docsUrl: 'https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/v1',
    baseUrlLabel: text('Cloudflare Base URL', 'Cloudflare base URL'),
    keyLabel: text('Cloudflare API Token', 'Cloudflare API token'),
    keyPlaceholder: text('วาง Cloudflare token', 'Paste your Cloudflare token'),
    note: text('ต้องใส่ Account ID เพิ่มด้วย แต่เหมาะกับคนมี infra อยู่แล้ว', 'Requires an Account ID, but works well if you already live in Cloudflare.'),
    recommendedModels: [
      model('@cf/meta/llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 'Llama 4 รุ่นใหม่', 'Newer Llama 4 option'),
      model('@cf/openai/gpt-oss-120b', 'GPT-OSS 120B', 'โอเพ่นเวต reasoning ตัวใหญ่', 'Large open-weight reasoning model'),
      model('@cf/openai/gpt-oss-20b', 'GPT-OSS 20B', 'โอเพ่นเวตรุ่นเล็กกว่า', 'Smaller open-weight option'),
      model('@cf/meta/llama-3.3-70b-instruct-fp8-fast', 'Llama 3.3 70B Fast', 'เร็วและใช้ง่าย', 'Fast default'),
      model('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', 'DeepSeek R1 Distill Qwen 32B', 'สาย reasoning แบบ distill', 'Distilled reasoning option'),
      model('@cf/meta/llama-3.1-8b-instruct-fast', 'Llama 3.1 8B Fast', 'ตัวเล็ก latency ต่ำ', 'Small low-latency model'),
    ],
    defaultModelId: '@cf/meta/llama-4-scout-17b-16e-instruct',
    extraField: {
      key: 'accountId',
      label: text('Cloudflare Account ID', 'Cloudflare account ID'),
      placeholder: text('ใส่ Account ID ของ Cloudflare', 'Enter your Cloudflare account ID'),
    },
  },
  {
    id: 'ai21',
    label: 'AI21 Labs',
    docsUrl: 'https://docs.ai21.com/reference/chat-completions',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.ai21.com/studio/v1',
    baseUrlLabel: text('AI21 Base URL', 'AI21 base URL'),
    keyLabel: text('AI21 API Key', 'AI21 API key'),
    keyPlaceholder: text('วาง AI21 key', 'Paste your AI21 key'),
    note: text('โทนอธิบายอ่านง่ายและเหมาะกับ summary', 'Comfortable for summaries and feedback writing.'),
    recommendedModels: [
      model('jamba-mini', 'Jamba Mini', 'alias ล่าสุดของ Jamba Mini', 'Latest mini alias'),
      model('jamba-mini-2', 'Jamba Mini 2', 'alias ระบุเวอร์ชัน', 'Versioned mini alias'),
      model('jamba-mini-2-2026-01', 'Jamba Mini 2 2026-01', 'snapshot ล่าสุด', 'Pinned latest mini snapshot'),
      model('jamba-large', 'Jamba Large', 'alias ล่าสุดของ Jamba Large', 'Latest large alias'),
      model('jamba-large-1.7', 'Jamba Large 1.7', 'alias ระบุเวอร์ชัน', 'Versioned large alias'),
      model('jamba-large-1.7-2025-07', 'Jamba Large 1.7 2025-07', 'snapshot ล่าสุดของ large', 'Pinned latest large snapshot'),
    ],
    defaultModelId: 'jamba-mini',
  },
  {
    id: 'deepinfra',
    label: 'DeepInfra',
    docsUrl: 'https://deepinfra.com/docs/openai_api',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.deepinfra.com/v1/openai',
    baseUrlLabel: text('DeepInfra Base URL', 'DeepInfra base URL'),
    keyLabel: text('DeepInfra API Key', 'DeepInfra API key'),
    keyPlaceholder: text('วาง DeepInfra key', 'Paste your DeepInfra key'),
    note: text('เหมาะกับคนชอบ open model หลายตระกูลใน endpoint เดียว', 'Great when you want many open-model families behind one endpoint.'),
    recommendedModels: [
      model('deepseek-ai/DeepSeek-V3.1', 'DeepSeek V3.1', 'รุ่นแชตล่าสุด', 'Latest chat model'),
      model('openai/gpt-oss-120b', 'GPT-OSS 120B', 'โอเพ่นเวต reasoning ตัวใหญ่', 'Large open-weight reasoning model'),
      model('deepseek-ai/DeepSeek-V3.1-Terminus', 'DeepSeek V3.1 Terminus', 'สายสรุป/terminus', 'Alternate V3.1 deployment'),
      model('deepseek-ai/DeepSeek-V3-0324-Turbo', 'DeepSeek V3 0324 Turbo', 'รุ่น turbo ก่อนหน้า', 'Previous turbo release'),
      model('deepseek-ai/DeepSeek-R1-0528', 'DeepSeek R1 0528', 'รุ่น reasoning ล่าสุด', 'Latest reasoning release'),
      model('Qwen/Qwen3-235B-A22B-Instruct-2507', 'Qwen3 235B Instruct 2507', 'Qwen รุ่นใหญ่', 'Large Qwen chat model'),
      model('Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo', 'Qwen3 Coder 480B Turbo', 'คุยงาน dev ได้เก่ง', 'Large coding chat model'),
      model('zai-org/GLM-4.6', 'GLM 4.6', 'GLM รุ่นล่าสุดใน status page', 'Current GLM option'),
      model('meta-llama/Llama-4-Scout-17B-16E-Instruct', 'Llama 4 Scout', 'Llama 4 รุ่นเล็กกว่า', 'Smaller Llama 4 option'),
      model('meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', 'Llama 4 Maverick', 'Llama 4 รุ่นใหญ่', 'Larger Llama 4 option'),
    ],
    defaultModelId: 'deepseek-ai/DeepSeek-V3.1',
  },
  {
    id: 'nebius',
    label: 'Nebius AI Studio',
    docsUrl: 'https://docs.nebius.com/studio/inference/api-reference/openai-chat-completions',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.studio.nebius.com/v1',
    baseUrlLabel: text('Nebius Base URL', 'Nebius base URL'),
    keyLabel: text('Nebius API Key', 'Nebius API key'),
    keyPlaceholder: text('วาง Nebius key', 'Paste your Nebius key'),
    note: text('อีกตัวเลือกของ open model ที่ดีสำหรับแข่งสด', 'Another solid hosted open-model option for live play.'),
    recommendedModels: [
      model('deepseek-ai/DeepSeek-V3.1', 'DeepSeek V3.1', 'ตัวอย่าง open model ที่นิยม deploy', 'Popular self-deploy chat model'),
      model('Qwen/Qwen3-32B', 'Qwen3 32B', 'Qwen reasoning ไฮบริด', 'Hybrid reasoning Qwen'),
      model('Qwen/Qwen3-235B-A22B-Instruct-2507', 'Qwen3 235B Instruct 2507', 'Qwen รุ่นใหญ่', 'Large Qwen chat model'),
      model('deepseek-ai/DeepSeek-R1-0528', 'DeepSeek R1 0528', 'สาย reasoning', 'Reasoning-first option'),
      model('meta-llama/Llama-4-Scout-17B-16E-Instruct', 'Llama 4 Scout', 'Llama 4 รุ่นใหม่', 'Newer Llama 4 option'),
      model('meta-llama/Llama-4-Maverick-17B-128E-Instruct', 'Llama 4 Maverick', 'Llama 4 รุ่นใหญ่', 'Large Llama 4 option'),
      model('moonshotai/Kimi-K2.5', 'Kimi K2.5', 'Kimi แบบ deploy เอง', 'Self-deployed Kimi option'),
      model('Qwen/Qwen3-0.6B', 'Qwen3 0.6B', 'รุ่นเล็กมากสำหรับทดลอง', 'Tiny low-cost option'),
    ],
    defaultModelId: 'deepseek-ai/DeepSeek-V3.1',
  },
  {
    id: 'moonshot',
    label: 'Moonshot AI',
    docsUrl: 'https://platform.moonshot.ai/docs/introduction',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.moonshot.ai/v1',
    baseUrlLabel: text('Moonshot Base URL', 'Moonshot base URL'),
    keyLabel: text('Moonshot API Key', 'Moonshot API key'),
    keyPlaceholder: text('วาง Moonshot key', 'Paste your Moonshot key'),
    note: text('เหมาะกับงานอธิบายยาวและ feedback เป็นขั้นตอน', 'Useful for step-by-step explanations.'),
    recommendedModels: [
      model('kimi-latest', 'Kimi Latest', 'โมเดลแชตอัปเดตตามแอป Kimi', 'Rolling latest Kimi chat model'),
      model('kimi-k2-thinking', 'Kimi K2 Thinking', 'สาย reasoning ล่าสุด', 'Latest reasoning Kimi'),
      model('kimi-k2-thinking-turbo', 'Kimi K2 Thinking Turbo', 'thinking ที่ไวขึ้น', 'Faster reasoning Kimi'),
      model('kimi-k2-0905-preview', 'Kimi K2 0905 Preview', 'snapshot พรีวิวล่าสุด', 'Latest preview snapshot'),
      model('kimi-k2-turbo-preview', 'Kimi K2 Turbo Preview', 'preview เน้นเร็ว', 'Fast preview model'),
      model('moonshot-v1-128k', 'Moonshot v1 128K', 'ซีรีส์ v1 บริบทยาวสุด', 'Longest-context v1 model'),
      model('moonshot-v1-32k', 'Moonshot v1 32K', 'บริบทยาวขึ้น', 'Mid-context v1 model'),
      model('moonshot-v1-8k', 'Moonshot v1 8K', 'ซีรีส์ v1 ที่เร็วสุด', 'Fastest v1 model'),
    ],
    defaultModelId: 'kimi-latest',
  },
  {
    id: 'hyperbolic',
    label: 'Hyperbolic',
    docsUrl: 'https://docs.hyperbolic.xyz/docs/inference-api',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.hyperbolic.xyz/v1',
    baseUrlLabel: text('Hyperbolic Base URL', 'Hyperbolic base URL'),
    keyLabel: text('Hyperbolic API Key', 'Hyperbolic API key'),
    keyPlaceholder: text('วาง Hyperbolic key', 'Paste your Hyperbolic key'),
    note: text('เหมาะกับคนอยากลอง open model จากผู้ให้บริการอีกสาย', 'Useful for experimenting with another open-model host.'),
    recommendedModels: [
      model('openai/gpt-oss-120b', 'GPT-OSS 120B', 'โอเพ่นเวต reasoning ตัวใหญ่', 'Large open-weight reasoning model'),
      model('openai/gpt-oss-20b', 'GPT-OSS 20B', 'โอเพ่นเวตรุ่นเล็กกว่า', 'Smaller open-weight option'),
      model('meta-llama/Meta-Llama-3.3-70B-Instruct', 'Llama 3.3 70B', 'รุ่นกลางที่นิ่ง', 'Reliable mid-tier option'),
      model('meta-llama/Meta-Llama-3.1-405B-Instruct', 'Llama 3.1 405B', 'รุ่นใหญ่มาก', 'Very large Llama option'),
      model('meta-llama/Meta-Llama-3.1-70B-Instruct', 'Llama 3.1 70B', 'ค่ากลางที่ดี', 'Safe default'),
      model('Qwen/Qwen3-Next-80B-A3B-Instruct', 'Qwen3 Next 80B Instruct', 'Qwen รุ่นใหม่', 'Newer Qwen chat model'),
      model('Qwen/Qwen3-Next-80B-A3B-Thinking', 'Qwen3 Next 80B Thinking', 'Qwen สายคิดเป็นขั้นตอน', 'Newer Qwen reasoning model'),
      model('Qwen/Qwen3-235B-A22B-Instruct-2507', 'Qwen3 235B Instruct 2507', 'Qwen รุ่นใหญ่', 'Large Qwen chat model'),
      model('Qwen/QwQ-32B', 'QwQ 32B', 'Qwen reasoning ขนาดกลาง', 'Mid-size reasoning Qwen'),
      model('deepseek-ai/DeepSeek-V3', 'DeepSeek V3', 'DeepSeek สายแชต', 'DeepSeek chat model'),
      model('deepseek-ai/DeepSeek-R1', 'DeepSeek R1', 'DeepSeek สาย reasoning', 'DeepSeek reasoning model'),
      model('moonshotai/Kimi-K2', 'Kimi K2', 'Kimi บน Hyperbolic', 'Kimi served on Hyperbolic'),
    ],
    defaultModelId: 'openai/gpt-oss-120b',
  },
  {
    id: 'alibaba',
    label: 'Alibaba DashScope',
    docsUrl: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/compatibility-of-openai-with-dashscope',
    protocol: 'openai',
    defaultBaseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    baseUrlLabel: text('DashScope Base URL', 'DashScope base URL'),
    keyLabel: text('DashScope API Key', 'DashScope API key'),
    keyPlaceholder: text('วาง DashScope key', 'Paste your DashScope key'),
    note: text('เหมาะกับคนอยากใช้สาย Qwen โดยตรง', 'A direct path for Qwen-family models.'),
    recommendedModels: [
      model('qwen3-max', 'Qwen3 Max', 'เรือธงล่าสุด', 'Latest flagship'),
      model('qwen3-max-preview', 'Qwen3 Max Preview', 'พรีวิวเรือธง', 'Flagship preview'),
      model('qwen3.5-plus', 'Qwen3.5 Plus', 'พลัสรุ่นใหม่', 'Newest Plus line'),
      model('qwen-plus', 'Qwen Plus', 'สมดุลดี', 'Balanced'),
      model('qwen-plus-latest', 'Qwen Plus Latest', 'alias ล่าสุดของ Plus', 'Rolling Plus alias'),
      model('qwen-flash', 'Qwen Flash', 'เร็วกว่า Plus', 'Faster than Plus'),
      model('qwen-turbo', 'Qwen Turbo', 'เร็วกว่า', 'Faster'),
      model('qwen-turbo-latest', 'Qwen Turbo Latest', 'alias ล่าสุดของ Turbo', 'Rolling Turbo alias'),
      model('qwen3-coder-plus', 'Qwen3 Coder Plus', 'เด่นงาน dev และแชต', 'High-end coder chat model'),
      model('qwen3-coder-flash', 'Qwen3 Coder Flash', 'สาย coder ที่เร็วกว่า', 'Faster coder model'),
      model('qwq-plus', 'QwQ Plus', 'สาย reasoning เชิงลึก', 'Deep reasoning commercial model'),
      model('qwen3-next-80b-a3b-thinking', 'Qwen3 Next 80B Thinking', 'โอเพ่นซอร์ซสายคิด', 'Open-source reasoning model'),
      model('qwen3-next-80b-a3b-instruct', 'Qwen3 Next 80B Instruct', 'โอเพ่นซอร์ซสายแชต', 'Open-source instruct model'),
      model('qwen3-235b-a22b-thinking-2507', 'Qwen3 235B Thinking 2507', 'Qwen reasoning รุ่นใหญ่', 'Large reasoning Qwen'),
      model('qwen3-235b-a22b-instruct-2507', 'Qwen3 235B Instruct 2507', 'Qwen แชตรุ่นใหญ่', 'Large chat Qwen'),
      model('qwen3-32b', 'Qwen3 32B', 'Qwen reasoning ไฮบริด', 'Hybrid reasoning Qwen'),
      model('qwen3-30b-a3b', 'Qwen3 30B A3B', 'Qwen ขนาดกลาง', 'Mid-size Qwen'),
      model('qwen2.5-72b-instruct', 'Qwen2.5 72B Instruct', 'รุ่นก่อนหน้าที่ยังนิยม', 'Reliable previous generation'),
      model('qwen2.5-32b-instruct', 'Qwen2.5 32B Instruct', 'รุ่นกลางของ 2.5', 'Mid-size previous generation'),
    ],
    defaultModelId: 'qwen-plus',
  },
]

const verifiedProviderDefaults = {
  tier: 'verified',
  browserSupport: 'good',
  supportsArena: true,
  supportsCoach: true,
  supportsModelDiscovery: true,
  runtimeProfile: createRuntimeProfile(),
} satisfies ArenaAiProviderCapabilities

const betaProviderDefaults = {
  tier: 'beta',
  browserSupport: 'mixed',
  supportsArena: true,
  supportsCoach: true,
  supportsModelDiscovery: false,
  runtimeProfile: createRuntimeProfile({
    arenaAnswer: {
      timeoutBudgetMs: 12000,
    },
  }),
} satisfies ArenaAiProviderCapabilities

const ARENA_AI_PROVIDER_CAPABILITIES: Record<ArenaAiProviderId, ArenaAiProviderCapabilities> = {
  openai: verifiedProviderDefaults,
  anthropic: verifiedProviderDefaults,
  google: verifiedProviderDefaults,
  huggingface: {
    tier: 'verified',
    browserSupport: 'good',
    supportsArena: true,
    supportsCoach: true,
    supportsModelDiscovery: true,
    runtimeProfile: createRuntimeProfile({
      arenaAnswer: {
        maxTokens: 96,
        timeoutBudgetMs: 12000,
      },
    }),
  },
  meta: betaProviderDefaults,
  xai: betaProviderDefaults,
  mistral: verifiedProviderDefaults,
  groq: verifiedProviderDefaults,
  together: betaProviderDefaults,
  fireworks: betaProviderDefaults,
  perplexity: betaProviderDefaults,
  deepseek: verifiedProviderDefaults,
  sambanova: betaProviderDefaults,
  cerebras: betaProviderDefaults,
  cloudflare: betaProviderDefaults,
  ai21: betaProviderDefaults,
  deepinfra: betaProviderDefaults,
  nebius: betaProviderDefaults,
  moonshot: betaProviderDefaults,
  hyperbolic: betaProviderDefaults,
  alibaba: betaProviderDefaults,
}

export const ARENA_AI_PROVIDERS: ArenaAiProviderDefinition[] = ARENA_AI_PROVIDER_BASES.map((provider) => ({
  ...provider,
  ...ARENA_AI_PROVIDER_CAPABILITIES[provider.id],
  requiresExtraField: Boolean(provider.extraField),
}))

const providerMap = new Map(ARENA_AI_PROVIDERS.map((provider) => [provider.id, provider]))

const getOpenAiText = (content: unknown): string => {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
        return part.text
      }

      return ''
    })
    .join('\n')
    .trim()
}

class ArenaAiRequestError extends Error {
  status: number | null
  retryAfterMs: number | null
  retryable: boolean

  constructor(message: string, options?: { status?: number | null; retryAfterMs?: number | null; retryable?: boolean }) {
    super(message)
    this.name = 'ArenaAiRequestError'
    this.status = options?.status ?? null
    this.retryAfterMs = options?.retryAfterMs ?? null
    this.retryable = options?.retryable ?? false
  }
}

const parseRetryAfterMs = (value: string | null) => {
  if (!value) {
    return null
  }

  const asSeconds = Number(value)
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.round(asSeconds * 1000)
  }

  const asDate = Date.parse(value)
  if (Number.isNaN(asDate)) {
    return null
  }

  return Math.max(0, asDate - Date.now())
}

const isRetryableAiError = (status: number | null, message: string) => {
  if (status !== null && [408, 409, 425, 429, 500, 502, 503, 504].includes(status)) {
    return true
  }

  return /(high demand|try again later|temporar(?:y|ily) unavailable|overloaded|over capacity|rate limit|too many requests|service unavailable)/i.test(message)
}

const waitForRetryDelay = (delayMs: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (delayMs <= 0) {
      resolve()
      return
    }

    const timeoutId = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, delayMs)

    const handleAbort = () => {
      globalThis.clearTimeout(timeoutId)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (signal) {
      if (signal.aborted) {
        handleAbort()
        return
      }

      signal.addEventListener('abort', handleAbort, { once: true })
    }
  })

const cloneJsonValue = <T,>(value: T): T => {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

const withPropertyOrdering = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => withPropertyOrdering(entry))
  }

  const record = { ...(value as Record<string, unknown>) }

  if (record.properties && typeof record.properties === 'object' && !Array.isArray(record.properties)) {
    const propertyEntries = Object.entries(record.properties as Record<string, unknown>).map(([key, entry]) => [key, withPropertyOrdering(entry)])
    record.properties = Object.fromEntries(propertyEntries)
    record.propertyOrdering = propertyEntries.map(([key]) => key)
  }

  if (record.items) {
    record.items = withPropertyOrdering(record.items)
  }

  if (Array.isArray(record.prefixItems)) {
    record.prefixItems = record.prefixItems.map((entry) => withPropertyOrdering(entry))
  }

  if (record.additionalProperties && typeof record.additionalProperties === 'object' && !Array.isArray(record.additionalProperties)) {
    record.additionalProperties = withPropertyOrdering(record.additionalProperties)
  }

  if (Array.isArray(record.anyOf)) {
    record.anyOf = record.anyOf.map((entry) => withPropertyOrdering(entry))
  }

  if (Array.isArray(record.oneOf)) {
    record.oneOf = record.oneOf.map((entry) => withPropertyOrdering(entry))
  }

  return record
}

const normalizeGoogleJsonSchema = (schema: ArenaAiJsonSchema) => withPropertyOrdering(cloneJsonValue(schema)) as ArenaAiJsonSchema

const isStructuredOutputUnsupportedError = (error: unknown) => {
  if (!(error instanceof ArenaAiRequestError)) {
    return false
  }

  if (error.status !== null && ![400, 404, 405, 415, 422, 501].includes(error.status)) {
    return false
  }

  return /(response_format|json_schema|json object|response_json_schema|responsemime|response_mime_type|tool_choice|tools|strict tool|strict schema|unsupported|not support|unknown field|unrecognized|invalid schema)/i.test(
    error.message,
  )
}

const extractAnthropicToolInput = (payload: unknown) => {
  const blocks = Array.isArray((payload as { content?: unknown })?.content) ? ((payload as { content: unknown[] }).content ?? []) : []
  const toolUseBlock = blocks.find(
    (block) => typeof block === 'object' && block !== null && (block as { type?: unknown }).type === 'tool_use',
  ) as { input?: unknown } | undefined

  if (!toolUseBlock || typeof toolUseBlock.input !== 'object' || toolUseBlock.input === null) {
    return null
  }

  return toolUseBlock.input
}

const getResponseError = async (response: Response) => {
  let message = response.statusText || 'Request failed'

  try {
    const payload = await response.json()
    if (typeof payload?.error?.message === 'string') {
      message = payload.error.message
    } else if (typeof payload?.message === 'string') {
      message = payload.message
    }
  } catch {
    return new ArenaAiRequestError(message, {
      status: response.status,
      retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after')),
      retryable: isRetryableAiError(response.status, message),
    })
  }

  return new ArenaAiRequestError(message, {
    status: response.status,
    retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after')),
    retryable: isRetryableAiError(response.status, message),
  })
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const interpolateBaseUrl = (template: string, extraFieldValue: string) =>
  template.includes('{accountId}') ? template.replace('{accountId}', extraFieldValue.trim()) : template

export const getArenaAiProvider = (providerId: ArenaAiProviderId) => providerMap.get(providerId) ?? ARENA_AI_PROVIDERS[0]

export const createDefaultArenaAiSettings = (): ArenaAiSettings => {
  const provider = ARENA_AI_PROVIDERS[0]
  return {
    providerId: provider.id,
    apiBaseUrl: provider.defaultBaseUrl,
    modelId: provider.defaultModelId,
    extraFieldValue: '',
  }
}

export const parseStoredArenaAiSettings = (rawValue: string | null): ArenaAiSettings => {
  const fallback = createDefaultArenaAiSettings()
  if (!rawValue) {
    return fallback
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<ArenaAiSettings> | null
    if (!parsed || typeof parsed !== 'object') {
      return fallback
    }

    const provider =
      typeof parsed.providerId === 'string' && providerMap.has(parsed.providerId as ArenaAiProviderId)
        ? getArenaAiProvider(parsed.providerId as ArenaAiProviderId)
        : getArenaAiProvider(fallback.providerId)

    return {
      providerId: provider.id,
      apiBaseUrl: typeof parsed.apiBaseUrl === 'string' && parsed.apiBaseUrl.trim() ? parsed.apiBaseUrl : provider.defaultBaseUrl,
      modelId: typeof parsed.modelId === 'string' && parsed.modelId.trim() ? parsed.modelId : provider.defaultModelId,
      extraFieldValue: typeof parsed.extraFieldValue === 'string' ? parsed.extraFieldValue : '',
    }
  } catch {
    return fallback
  }
}

export const getArenaAiModelId = (settings: Pick<ArenaAiSettings, 'modelId'>) => settings.modelId.trim()

export const isArenaAiReady = (config: ArenaAiClientConfig) =>
  Boolean(config.apiKey.trim() && getArenaAiModelId(config) && resolveArenaAiBaseUrl(config))

export const resolveArenaAiBaseUrl = (settings: Pick<ArenaAiSettings, 'providerId' | 'apiBaseUrl' | 'extraFieldValue'>) => {
  const provider = getArenaAiProvider(settings.providerId)
  const candidate = settings.apiBaseUrl.trim() || provider.defaultBaseUrl
  const resolved = interpolateBaseUrl(candidate, settings.extraFieldValue)
  return resolved.includes('{accountId}') ? '' : trimTrailingSlash(resolved)
}

export const createArenaAiSettingsForProvider = (providerId: ArenaAiProviderId): ArenaAiSettings => {
  const provider = getArenaAiProvider(providerId)
  return {
    providerId: provider.id,
    apiBaseUrl: provider.defaultBaseUrl,
    modelId: provider.defaultModelId,
    extraFieldValue: '',
  }
}

type DiscoverArenaModelsOptions = {
  config: ArenaModelDiscoveryConfig
  signal?: AbortSignal
}

const MODEL_TAG_ORDER: Record<ArenaModelTag, number> = {
  general: 0,
  reasoning: 1,
  coding: 2,
  preview: 3,
}

const MODEL_EXCLUDE_PATTERNS = [
  'embed',
  'embedding',
  'rerank',
  'moderation',
  'tts',
  'speech',
  'transcribe',
  'transcription',
  'asr',
  'imagen',
  'image-generation',
  'whisper',
]

const MODEL_REASONING_PATTERNS = ['reasoning', 'reasoner', 'think', 'thinking', 'r1', 'qwq']
const MODEL_CODING_PATTERNS = ['coder', 'coding', 'code', 'dev']
const MODEL_PREVIEW_PATTERNS = ['preview', 'beta', 'experimental', 'exp']
const MODEL_CHAT_METADATA_PATTERNS = ['chat', 'assistant', 'instruct', 'conversation', 'text-generation', 'completion', 'generatecontent']
const MODEL_NON_CHAT_MODALITY_PATTERNS = ['image', 'audio', 'speech', 'video']
const modelCapabilityProbeCache = new Map<string, boolean>()
const modelCapabilityProbeInflight = new Map<string, Promise<boolean>>()

const getAbortError = () =>
  typeof DOMException === 'function' ? new DOMException('The operation was aborted.', 'AbortError') : new Error('The operation was aborted.')

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : typeof value === 'string' && value.trim()
      ? [value]
      : []

const buildDiscoveryHaystack = (values: Array<string | undefined>) => values.filter(Boolean).join(' ').toLowerCase()

const inferModelCapability = (record: ArenaModelDiscoveryRecord, metadata: string[] = []): ArenaModelCapability => {
  if (record.capability) {
    return record.capability
  }

  const haystack = buildDiscoveryHaystack([record.id, record.label, record.description, ...metadata])

  if (MODEL_EXCLUDE_PATTERNS.some((pattern) => haystack.includes(pattern))) {
    return 'no'
  }

  const hasTextSignal = MODEL_CHAT_METADATA_PATTERNS.some((pattern) => haystack.includes(pattern)) || metadata.some((value) => value.includes('text'))
  const hasOnlyNonChatModalities =
    metadata.some((value) => MODEL_NON_CHAT_MODALITY_PATTERNS.some((pattern) => value.includes(pattern))) && !hasTextSignal

  if (hasOnlyNonChatModalities) {
    return 'no'
  }

  if (hasTextSignal) {
    return 'yes'
  }

  return 'maybe'
}

export const getArenaModelTag = (id: string, label: string): ArenaModelTag => {
  const haystack = `${id} ${label}`.toLowerCase()

  if (MODEL_PREVIEW_PATTERNS.some((token) => haystack.includes(token))) {
    return 'preview'
  }

  if (MODEL_CODING_PATTERNS.some((token) => haystack.includes(token))) {
    return 'coding'
  }

  if (MODEL_REASONING_PATTERNS.some((token) => haystack.includes(token))) {
    return 'reasoning'
  }

  return 'general'
}

const defaultDiscoveredDescription = (tag: ArenaModelTag): LocalizedText => {
  switch (tag) {
    case 'reasoning':
      return text('สาย reasoning ที่ยังคุยผ่านแชตได้', 'Reasoning-capable chat model')
    case 'coding':
      return text('สาย coder หรือ dev assistant ที่ยังคุยผ่านแชตได้', 'Coding-oriented chat model')
    case 'preview':
      return text('รุ่น preview ที่ยังคุยผ่านแชตได้', 'Preview chat-capable model')
    default:
      return text('โมเดลแชตทั่วไปของ provider นี้', 'General chat-capable model')
  }
}

const createCapabilityProbeKey = (config: ArenaModelDiscoveryConfig, modelId: string) =>
  `${config.providerId}::${resolveArenaAiBaseUrl(config)}::${modelId.trim()}`

const probeArenaChatCapability = async ({
  config,
  modelId,
  signal,
}: {
  config: ArenaModelDiscoveryConfig
  modelId: string
  signal?: AbortSignal
}) => {
  const provider = getArenaAiProvider(config.providerId)
  const probeProfile = provider.runtimeProfile.capabilityProbe

  if (!probeProfile.enabled) {
    return true
  }

  const cacheKey = createCapabilityProbeKey(config, modelId)
  if (modelCapabilityProbeCache.has(cacheKey)) {
    return modelCapabilityProbeCache.get(cacheKey) ?? false
  }

  const inflight = modelCapabilityProbeInflight.get(cacheKey)
  if (inflight) {
    return inflight
  }

  const controller = new AbortController()
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) {
      throw getAbortError()
    }
    signal.addEventListener('abort', onAbort, { once: true })
  }

  const timeoutId = globalThis.setTimeout(() => {
    controller.abort()
  }, probeProfile.timeoutBudgetMs)

  const probePromise = requestAiText({
    config: {
      providerId: config.providerId,
      apiBaseUrl: config.apiBaseUrl,
      modelId,
      extraFieldValue: config.extraFieldValue,
      apiKey: config.apiKey,
    },
    system: 'Return OK only.',
    user: 'OK',
    maxTokens: probeProfile.maxTokens,
    temperature: probeProfile.temperature,
    signal: controller.signal,
  })
    .then(() => {
      modelCapabilityProbeCache.set(cacheKey, true)
      return true
    })
    .catch((error) => {
      if (signal?.aborted) {
        throw error
      }
      return false
    })
    .finally(() => {
      globalThis.clearTimeout(timeoutId)
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }
      modelCapabilityProbeInflight.delete(cacheKey)
    })

  modelCapabilityProbeInflight.set(cacheKey, probePromise)
  return probePromise
}

const normalizeDiscoveredModels = async (
  records: ArenaModelDiscoveryRecord[],
  options: { config: ArenaModelDiscoveryConfig; signal?: AbortSignal },
): Promise<ArenaDiscoveredModel[]> => {
  const seen = new Set<string>()
  const normalized: ArenaDiscoveredModel[] = []

  for (const record of records) {
    const id = record.id.trim()
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    const label = record.label?.trim() || id
    const capability = inferModelCapability(record)
    if (capability === 'no') {
      continue
    }

    if (capability === 'maybe') {
      const supportsChat = await probeArenaChatCapability({
        config: options.config,
        modelId: id,
        signal: options.signal,
      })
      if (!supportsChat) {
        continue
      }
    }

    const tag = record.tag ?? getArenaModelTag(id, label)
    normalized.push({
      id,
      label,
      tag,
      description: record.description ? text(record.description, record.description) : defaultDiscoveredDescription(tag),
    })
  }

  return normalized.sort((left, right) => {
    const tagDelta = MODEL_TAG_ORDER[left.tag] - MODEL_TAG_ORDER[right.tag]
    if (tagDelta !== 0) {
      return tagDelta
    }
    return left.label.localeCompare(right.label)
  })
}

export const canDiscoverArenaModels = (config: ArenaModelDiscoveryConfig) => {
  const provider = getArenaAiProvider(config.providerId)
  return Boolean(provider.supportsModelDiscovery && config.apiKey.trim() && resolveArenaAiBaseUrl(config))
}

export const discoverArenaModels = async ({ config, signal }: DiscoverArenaModelsOptions): Promise<ArenaDiscoveredModel[]> => {
  const provider = getArenaAiProvider(config.providerId)
  const baseUrl = resolveArenaAiBaseUrl(config)

  if (!provider.supportsModelDiscovery || !provider.modelDiscoveryStrategy) {
    return []
  }

  if (!config.apiKey.trim()) {
    throw new Error('Missing API key')
  }

  if (!baseUrl) {
    throw new Error(provider.extraField ? `Missing ${provider.extraField.label.en}` : 'Missing API base URL')
  }

  if (provider.modelDiscoveryStrategy === 'anthropic-models') {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal,
    })

    if (!response.ok) {
      throw await getResponseError(response)
    }

    const payload = await response.json()
    const records = Array.isArray(payload?.data)
      ? payload.data.map((entry: { id?: string; display_name?: string }) => ({
          id: entry.id ?? '',
          label: entry.display_name ?? entry.id ?? '',
          capability: 'yes' as const,
        }))
      : []

    return normalizeDiscoveredModels(records, { config, signal })
  }

  if (provider.modelDiscoveryStrategy === 'google-models') {
    const response = await fetch(`${baseUrl}/models?key=${encodeURIComponent(config.apiKey)}`, { signal })

    if (!response.ok) {
      throw await getResponseError(response)
    }

    const payload = await response.json()
    const records = Array.isArray(payload?.models)
      ? payload.models
          .filter((entry: { supportedGenerationMethods?: string[] }) =>
            Array.isArray(entry.supportedGenerationMethods) ? entry.supportedGenerationMethods.includes('generateContent') : false,
          )
          .map((entry: { name?: string; displayName?: string; description?: string }) => ({
            id: (entry.name ?? '').replace(/^models\//, ''),
            label: entry.displayName ?? (entry.name ?? '').replace(/^models\//, ''),
            description: entry.description ?? '',
            capability: 'yes' as const,
          }))
      : []

    return normalizeDiscoveredModels(records, { config, signal })
  }

  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    signal,
  })

  if (!response.ok) {
    throw await getResponseError(response)
  }

  const payload = await response.json()
  const records = Array.isArray(payload?.data)
    ? payload.data.map(
        (
          entry: {
            id?: string
            name?: string
            description?: string
            type?: string
            object?: string
            modalities?: string[] | string
            input_modalities?: string[] | string
            output_modalities?: string[] | string
            supported_generation_methods?: string[] | string
            endpoints?: string[] | string
            capabilities?: string[] | string | { chat_completions?: boolean; completions?: boolean }
            architecture?: {
              modality?: string
              instruct_type?: string | null
            }
          },
        ) => {
          const metadata = [
            ...toStringList(entry.type),
            ...toStringList(entry.object),
            ...toStringList(entry.modalities),
            ...toStringList(entry.input_modalities),
            ...toStringList(entry.output_modalities),
            ...toStringList(entry.supported_generation_methods),
            ...toStringList(entry.endpoints),
            ...toStringList(entry.architecture?.modality),
            ...toStringList(entry.architecture?.instruct_type ?? undefined),
            ...(typeof entry.capabilities === 'object' && entry.capabilities && !Array.isArray(entry.capabilities)
              ? [
                  entry.capabilities.chat_completions ? 'chat-completions' : '',
                  entry.capabilities.completions ? 'completions' : '',
                ].filter(Boolean)
              : toStringList(entry.capabilities)),
          ]

          return {
            id: entry.id ?? entry.name ?? '',
            label: entry.name ?? entry.id ?? '',
            description: entry.description ?? '',
            capability: inferModelCapability(
              {
                id: entry.id ?? entry.name ?? '',
                label: entry.name ?? entry.id ?? '',
                description: entry.description ?? '',
              },
              metadata,
            ),
          }
        },
      )
    : []

  return normalizeDiscoveredModels(records, { config, signal })
}

const requestAiTextOnce = async ({
  config,
  system,
  user,
  maxTokens = 180,
  temperature = 0,
  topP,
  structuredOutput,
  signal,
}: RequestAiTextOptions) => {
  const provider = getArenaAiProvider(config.providerId)
  const model = getArenaAiModelId(config)
  const baseUrl = resolveArenaAiBaseUrl(config)

  if (!config.apiKey.trim()) {
    throw new Error('Missing API key')
  }

  if (!model) {
    throw new Error('Missing model ID')
  }

  if (!baseUrl) {
    throw new Error(provider.extraField ? `Missing ${provider.extraField.label.en}` : 'Missing API base URL')
  }

  if (provider.protocol === 'anthropic') {
    const requestBodies: Record<string, unknown>[] = structuredOutput
      ? [
          {
            model,
            system,
            messages: [{ role: 'user', content: user }],
            max_tokens: maxTokens,
            temperature,
            ...(typeof topP === 'number' ? { top_p: topP } : {}),
            tools: [
              {
                name: structuredOutput.name,
                description: structuredOutput.description ?? 'Return the final answer as a JSON object that matches the schema exactly.',
                strict: true,
                input_schema: structuredOutput.schema,
              },
            ],
            tool_choice: { type: 'tool', name: structuredOutput.name },
          },
          {
            model,
            system,
            messages: [{ role: 'user', content: user }],
            max_tokens: maxTokens,
            temperature,
            ...(typeof topP === 'number' ? { top_p: topP } : {}),
          },
        ]
      : [
          {
            model,
            system,
            messages: [{ role: 'user', content: user }],
            max_tokens: maxTokens,
            temperature,
            ...(typeof topP === 'number' ? { top_p: topP } : {}),
          },
        ]

    for (let index = 0; index < requestBodies.length; index += 1) {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBodies[index]),
        signal,
      })

      if (!response.ok) {
        const error = await getResponseError(response)
        if (structuredOutput && index < requestBodies.length - 1 && isStructuredOutputUnsupportedError(error)) {
          continue
        }

        throw error
      }

      const payload = await response.json()

      if (structuredOutput && index === 0) {
        const toolInput = extractAnthropicToolInput(payload)
        if (toolInput) {
          return JSON.stringify(toolInput)
        }
      }

      const content = Array.isArray(payload?.content)
        ? payload.content
            .map((part: { type?: string; text?: string }) => (part?.type === 'text' ? part.text ?? '' : ''))
            .join('\n')
            .trim()
        : ''

      if (content || index === requestBodies.length - 1) {
        return content
      }
    }

    return ''
  }

  if (provider.protocol === 'google') {
    const baseGenerationConfig = {
      temperature,
      maxOutputTokens: maxTokens,
      ...(typeof topP === 'number' ? { topP } : {}),
    }
    const requestBodies: Record<string, unknown>[] = structuredOutput
      ? [
          {
            systemInstruction: {
              parts: [{ text: system }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: user }],
              },
            ],
            generationConfig: {
              ...baseGenerationConfig,
              responseMimeType: 'application/json',
              responseJsonSchema: normalizeGoogleJsonSchema(structuredOutput.schema),
            },
          },
          {
            systemInstruction: {
              parts: [{ text: system }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: user }],
              },
            ],
            generationConfig: {
              ...baseGenerationConfig,
              responseMimeType: 'application/json',
            },
          },
          {
            systemInstruction: {
              parts: [{ text: system }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: user }],
              },
            ],
            generationConfig: baseGenerationConfig,
          },
        ]
      : [
          {
            systemInstruction: {
              parts: [{ text: system }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: user }],
              },
            ],
            generationConfig: baseGenerationConfig,
          },
        ]

    for (let index = 0; index < requestBodies.length; index += 1) {
      const response = await fetch(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBodies[index]),
        signal,
      })

      if (!response.ok) {
        const error = await getResponseError(response)
        if (structuredOutput && index < requestBodies.length - 1 && isStructuredOutputUnsupportedError(error)) {
          continue
        }

        throw error
      }

      const payload = await response.json()
      const content = Array.isArray(payload?.candidates?.[0]?.content?.parts)
        ? payload.candidates[0].content.parts
            .map((part: { text?: string }) => (typeof part?.text === 'string' ? part.text : ''))
            .join('\n')
            .trim()
        : ''

      if (content || index === requestBodies.length - 1) {
        return content
      }
    }

    return ''
  }

  const openAiBaseBody = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature,
    ...(typeof topP === 'number' ? { top_p: topP } : {}),
    max_tokens: maxTokens,
    stream: false,
  }
  const requestBodies: Record<string, unknown>[] = structuredOutput
    ? [
        {
          ...openAiBaseBody,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: structuredOutput.name,
              strict: true,
              schema: structuredOutput.schema,
            },
          },
        },
        {
          ...openAiBaseBody,
          response_format: {
            type: 'json_object',
          },
        },
        openAiBaseBody,
      ]
    : [openAiBaseBody]

  for (let index = 0; index < requestBodies.length; index += 1) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBodies[index]),
      signal,
    })

    if (!response.ok) {
      const error = await getResponseError(response)
      if (structuredOutput && index < requestBodies.length - 1 && isStructuredOutputUnsupportedError(error)) {
        continue
      }

      throw error
    }

    const payload = await response.json()
    const content = getOpenAiText(payload?.choices?.[0]?.message?.content)
    if (content || index === requestBodies.length - 1) {
      return content
    }
  }

  return ''
}

export const requestAiText = async ({
  retryCount = 0,
  retryBackoffMs = 650,
  ...options
}: RequestAiTextOptions) => {
  let lastError: unknown = null

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await requestAiTextOnce(options)
    } catch (error) {
      lastError = error

      if (options.signal?.aborted) {
        throw error
      }

      const retryable = error instanceof ArenaAiRequestError ? error.retryable : false
      if (!retryable || attempt >= retryCount) {
        throw error
      }

      const retryDelayMs =
        error instanceof ArenaAiRequestError && typeof error.retryAfterMs === 'number'
          ? error.retryAfterMs
          : retryBackoffMs * (attempt + 1)

      await waitForRetryDelay(retryDelayMs, options.signal)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI request failed')
}
