// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  url: string;
  relevanceScore: number;
}

interface QueryResult {
  question: string;
  answer: string;
  sources: DocumentChunk[];
  confidence: number;
}

interface DeepSeekRequest {
  question: string;
}

// Полный список документов с их метаданными для RAG
const DOCUMENTS_DATA: DocumentChunk[] = [
  {
    id: "ustav-sro-noso",
    title: "Устав Ассоциации «Нижегородское объединение строительных организаций»",
    content: "Основной устав организации. Регулирует деятельность, права и обязанности членов, внутреннюю структуру управления.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/ustav_sro_noso.pdf",
    relevanceScore: 0
  },
  {
    id: "standart-assotsiatsii",
    title: "Стандарт Ассоциации «Нижегородское объединение строительных организаций»",
    content: "Основные стандарты и требования саморегулируемой организации. Определяет минимальные требования к членам СРО, критерии допуска к работам.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/standart_assotsiatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "polozhenie-o-chlenstve-v-sro",
    title: "Положение о членстве в СРО",
    content: "Условия членства и порядок вступления в саморегулируемую организацию. Взносы, требования к кандидатам, процедура приема.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_chlenstve_v_sro.pdf",
    relevanceScore: 0
  },
  {
    id: "kvalifikatsionnyy-standart-rukovoditel",
    title: "Квалификационный стандарт Руководитель строительной организации",
    content: "Квалификационные требования к руководителям строительства. Опыт работы, образование, профессиональные навыки.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_rukovoditel_stroitelnoy_organizatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "strahovanie-grazhdanskaya-otvetstvennost",
    title: "Положение о страховании гражданской ответственности",
    content: "Страхование ответственности за качество строительных работ. Требования к страхованию, суммы покрытия, случаи выплат.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_grazhdanskoy_otvetstvennosti.pdf",
    relevanceScore: 0
  },
  {
    id: "kompens-fond-vred",
    title: "Положение о компенсационном фонде возмещения вреда",
    content: "Фонд возмещения вреда от недостатков работ членов СРО. Финансовая ответственность, условия выплат.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_vozmescheniya_vreda.pdf",
    relevanceScore: 0
  },
  {
    id: "polozhenie-o-distsiplinarnykh-vzyskaniyakh",
    title: "Положение о дисциплинарном воздействии",
    content: "Система дисциплинарной ответственности членов СРО. Нарушение стандартов, меры воздействия, процедуры рассмотрения.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnykh_vzyskaniyakh_za_narusheniya_stroitelnykh_norm.pdf",
    relevanceScore: 0
  },
  // Добавить остальные документы аналогично...
];

// Функция для поиска релевантных документов
function findRelevantDocuments(query: string, topK: number = 5): DocumentChunk[] {
  const queryWords = query.toLowerCase().split(' ');

  const scoredDocuments = DOCUMENTS_DATA.map(doc => {
    let score = 0;
    const docTitle = doc.title.toLowerCase();
    const docContent = doc.content.toLowerCase();

    // Поиск точных совпадений в названии
    for (const word of queryWords) {
      if (word.length > 2) { // Игнорируем короткие слова
        if (docTitle.includes(word)) score += 10;
        if (docContent.includes(word)) score += 5;
      }
    }

    // Поиск по ключевым словам
    const keywords = [
      'страхование', 'членство', 'взносы', 'квалификация', 'дисциплинарная',
      'компенсационный', 'стандарты', 'требования', 'лицензия', 'регистрация',
      'документы', 'сертификат', 'квалификационный', 'ответственность'
    ];

    for (const keyword of keywords) {
      if (query.toLowerCase().includes(keyword) &&
          (docTitle.includes(keyword) || docContent.includes(keyword))) {
        score += 8;
      }
    }

    return { ...doc, relevanceScore: score };
  });

  return scoredDocuments
    .filter(doc => doc.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);
}

// Функция для вызова DeepSeek API
async function queryDeepSeek(question: string, contextDocs: DocumentChunk[]): Promise<string> {
  let deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!deepseekApiKey) {
    // Временное решение для локального тестирования
    deepseekApiKey = 'sk-cf1e25cf34c34eecbf4f690652694097';
    console.log('Using hardcoded API key for local testing');
  }

  // Подготовка контекста
  const context = contextDocs.map(doc =>
    `Документ: ${doc.title}\nСодержание: ${doc.content}\n`
  ).join('\n');

  const systemPrompt = `Ты - эксперт по документам СРО (саморегулируемой организации).
  Отвечай на вопросы только на основе предоставленных документов.
  Если информация не найдена в документах, скажи об этом.
  Всегда указывай источники информации.
  Отвечай четко и лаконично на русском языке.`;

  const userPrompt = `Вопрос: ${question}

  Контекст из документов:
  ${context}

  Ответь на вопрос используя только информацию из контекста:`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error('Не удалось получить ответ от ИИ-агента');
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { question } = await req.json() as DeepSeekRequest;

    if (!question || typeof question !== 'string' || question.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Question must be a string with at least 3 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing question: ${question}`);

    // Найти релевантные документы
    const relevantDocs = findRelevantDocuments(question, 5);

    if (relevantDocs.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Не найдено релевантных документов для ответа на вопрос'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Получить ответ от DeepSeek
    const answer = await queryDeepSeek(question, relevantDocs);

    const result: QueryResult = {
      question,
      answer,
      sources: relevantDocs,
      confidence: Math.min(relevantDocs[0]?.relevanceScore || 0, 100) / 10 // Преобразуем в шкалу 0-10
    };

    return new Response(
      JSON.stringify({
        success: true,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deepseek-agent:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

/* To invoke locally:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/deepseek-agent' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type': application/json' \
    --data '{"question":"Какие требования к членству в СРО?"}'

*/
