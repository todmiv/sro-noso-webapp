/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Type definitions are now properly referenced for Supabase Edge Runtime

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

// ПОЛНЫЙ СПИСОК ДОКУМЕНТОВ СРО НОСО ДЛЯ RAG АНАЛИЗА
const DOCUMENTS_DATA: DocumentChunk[] = [
  // ОСНОВНЫЕ УЧРЕДИТЕЛЬНЫЕ ДОКУМЕНТЫ
  {
    id: "ustav-sro-noso",
    title: "Устав Ассоциации «Нижегородское объединение строительных организаций»",
    content: "Основной устав организации. Регулирует деятельность, права и обязанности членов, внутреннюю структуру управления, цели и задачи СРО.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/ustav_sro_noso.pdf",
    relevanceScore: 0
  },
  {
    id: "svidetelstvo-gos-registratsiya",
    title: "Свидетельство о государственной регистрации",
    content: "Подтверждение государственной регистрации СРО как юридического лица. Регистрационные данные, ОГРН, ИНН СРО.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svidetelstvo_gos_registratsiya.pdf",
    relevanceScore: 0
  },

  // СТАНДАРТЫ И ТРЕБОВАНИЯ
  {
    id: "standart-assotsiatsii",
    title: "Стандарт Ассоциации «Нижегородское объединение строительных организаций»",
    content: "Основные стандарты и требования саморегулируемой организации. Минимальные требования к членам СРО, критерии допуска к работам, общие правила деятельности.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/standart_assotsiatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "pravila-provedenia-samo-regulirovaniya",
    title: "Правила осуществления саморегулирования",
    content: "Правила контролирования деятельности членов СРО. Процедуры проверки соблюдения стандартов, ведения реестров, отчетности.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/pravila_provedenia_samo_regulirovaniya.pdf",
    relevanceScore: 0
  },

  // ЧЛЕНСТВО И ВСТУПЛЕНИЕ
  {
    id: "polozhenie-o-chlenstve-v-sro",
    title: "Положение о членстве в СРО",
    content: "Условия членства и порядок вступления в саморегулируемую организацию. Взносы, требования к кандидатам, процедура приема, права и обязанности членов.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_chlenstve_v_sro.pdf",
    relevanceScore: 0
  },
  {
    id: "procedura-vstupleniya-v-chleny",
    title: "Процедура вступления в члены Ассоциации",
    content: "Порядок подачи заявления на членство. Необходимые документы, сроки рассмотрения, комиссии по приему, критерии одобрения.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/procedura_vstupleniya_v_chleny.pdf",
    relevanceScore: 0
  },

  // КВАЛИФИКАЦИЯ И ОБРАЗОВАНИЕ
  {
    id: "kvalifikatsionnyy-standart-rukovoditel",
    title: "Квалификационный стандарт Руководитель строительной организации",
    content: "Квалификационные требования к руководителям строительства. Опыт работы, образование, профессиональные навыки, повышение квалификации.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_rukovoditel_stroitelnoy_organizatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "kvalifikatsionnyy-standart-ispolnitel",
    title: "Квалификационный стандарт Исполнитель работ",
    content: "Требования к исполнительным работникам строительства. Специальности, опыт, образование, сертификация квалификации.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_ispolnitel_rabot.pdf",
    relevanceScore: 0
  },
  {
    id: "kvalifikatsionnyy-standart-proektirovshchik",
    title: "Квалификационный стандарт Проектировщик",
    content: "Требования к проектировщикам и архитекторам. Образование, опыт проектирования, специальности и сертификаты.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_proektirovshchik.pdf",
    relevanceScore: 0
  },
  {
    id: "kvalifikatsionnyy-standart-inzhener",
    title: "Квалификационный стандарт Инженер строительного надзора",
    content: "Квалификация инженеров строительного контроля. Опыт работы, образование, отраслевые сертификаты.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_inzhener.pdf",
    relevanceScore: 0
  },

  // СТРАХОВАНИЕ И ОТВЕТСТВЕННОСТЬ
  {
    id: "strahovanie-grazhdanskaya-otvetstvennost",
    title: "Положение о страховании гражданской ответственности",
    content: "Страхование ответственности за качество строительных работ. Требования к страхованию, суммы покрытия, случаи выплат, договоры страхования.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_grazhdanskoy_otvetstvennosti.pdf",
    relevanceScore: 0
  },
  {
    id: "kompens-fond-vred",
    title: "Положение о компенсационном фонде возмещения вреда",
    content: "Фонд возмещения вреда от недостатков работ членов СРО. Финансовая ответственность, условия выплат, размер взносов в фонд.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_vozmescheniya_vreda.pdf",
    relevanceScore: 0
  },
  {
    id: "kompens-fond-odobrenie",
    title: "Положение о компенсационном фонде обеспечения договорных обязательств",
    content: "Фонд обеспечения договорных обязательств. Гарантии выполнения договоров, условия выплат из фонда.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_odobrenie.pdf",
    relevanceScore: 0
  },

  // ДИСЦИПЛИНА И КОНТРОЛЬ
  {
    id: "polozhenie-o-distsiplinarnykh-vzyskaniyakh",
    title: "Положение о дисциплинарном воздействии",
    content: "Система дисциплинарной ответственности членов СРО. Нарушение стандартов, меры воздействия, процедуры рассмотрения жалоб.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnykh_vzyskaniyakh_za_narusheniya_stroitelnykh_norm.pdf",
    relevanceScore: 0
  },
  {
    id: "postanovlenie-ob-isklyuchenii",
    title: "Положение об исключении из членов Ассоциации",
    content: "Основания и процедура исключения из членов СРО. Критерии недостойного поведения, порядок рассмотрения дел.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/postanovlenie_ob_isklyuchenii.pdf",
    relevanceScore: 0
  },
  {
    id: "komissiya-po-etike",
    title: "Положение о комиссии по этике и профессиональной деятельности",
    content: "Комиссия по соблюдению профессиональной этики. Рассмотрение жалоб, этические нормы, процедуры осуждения.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/komissiya_po_etike.pdf",
    relevanceScore: 0
  },

  // ФИНАНСОВЫЕ ДОКУМЕНТЫ
  {
    id: "polozhenie-o-vznosakh",
    title: "Положение о взносах в компенсационные фонды",
    content: "Размеры и порядок уплаты взносов. Обязательные и добровольные платежи, сроки уплаты, льготы и скидки.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_vznosakh.pdf",
    relevanceScore: 0
  },
  {
    id: "polozhenie-o-godovyh-chlennykh-vznosakh",
    title: "Положение о годовых членских взносах",
    content: "Ежегодные членские взносы на деятельность СРО. Размер взносов, сроки оплаты, использование средств.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_godovyh_chlennykh_vznosakh.pdf",
    relevanceScore: 0
  },
  {
    id: "bukhgalterskaya-otchetnost",
    title: "Бухгалтерская отчетность Ассоциации",
    content: "Финансовая отчетность СРО. Баланс, отчет о прибылях и убытках, использование средств компенсационных фондов.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/bukhgalterskaya_otchetnost.pdf",
    relevanceScore: 0
  },

  // РЕГУЛИРОВАНИЕ И НАДЗОР
  {
    id: "vnutrennie-dokumenty",
    title: "Внутренние документы по контролю качества",
    content: "Документальные процедуры контроля качества. Стандарты контроля, аудит, инспекции, отчетность о качестве.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/vnutrennie_dokumenty.pdf",
    relevanceScore: 0
  },
  {
    id: "reglament-atestatsii",
    title: "Регламент проведения аттестации специалистов",
    content: "Процедура аттестации квалификации. Воцедуры оценки, комиссии, сертификаты соответствия.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reglament_atestatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "reglament-obucheniya",
    title: "Регламент проведения обучения и повышения квалификации",
    content: "Программы повышения квалификации. Курсы, семинары, сертификация профессиональной подготовки.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reglament_obucheniya.pdf",
    relevanceScore: 0
  },

  // РЕЕСТРЫ И СПРАВОЧНЫЕ ДОКУМЕНТЫ
  {
    id: "reestr-chlenov",
    title: "Реестр членов Ассоциации СРО НОСО",
    content: "Список организаций-членов СРО. Данные компаний, статус членства, контактная информация, виды допусков.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reestr_chlenov.pdf",
    relevanceScore: 0
  },
  {
    id: "reestr-dopuskoy",
    title: "Реестр выданных свидетельств о допуске",
    content: "Регламент выдачи свидетельств. Критерии допуска, виды работ, контроль за соответствием требованиям.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reestr_dopuskoy.pdf",
    relevanceScore: 0
  },

  // ОГРАНИЧИТЕЛЬНЫЕ И ПОЯСНИТЕЛЬНЫЕ ДОКУМЕНТЫ
  {
    id: "ogr-nichtozhnost-sdelki",
    title: "Ограничение ничтожности сделки",
    content: "Правовые аспекты заключения договоров. Условия действительности контрактов, ответственность за недействительные сделки.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/ogr_nichtozhnost_sdelki.pdf",
    relevanceScore: 0
  },
  {
    id: "perechen-rabot",
    title: "Перечень видов работ по инженерным изысканиям",
    content: "Классификация работ требующих членства в СРО. Виды инженерных изысканий, геолого-разведочные работы.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/perechen_rabot.pdf",
    relevanceScore: 0
  },

  // ДОКУМЕНТЫ ОБЩЕГО ПОЛОЖЕНИЯ
  {
    id: "bylleten-assotsiyatsii",
    title: "Бюллетень Ассоциации",
    content: "Информационный бюллетень СРО. Новости, изменения законодательства, информационные материалы для членов.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/bylleten_assotsiyatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "otchet-predsedatelya",
    title: "Отчет Председателя Правления за период",
    content: "Информавательные материалы о деятельности СРО. Достижения, планы, текущие проекты организации.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/otchet_predsedatelya.pdf",
    relevanceScore: 0
  },
  {
    id: "kontaktnaya-informatsiya",
    title: "Контактная информация Ассоциации СРО НОСО",
    content: "Адреса, телефоны, email СРО и руководства. Расписание работы, юридический адрес.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kontaktnaya_informatsiya.pdf",
    relevanceScore: 0
  },

  // ДОСТУП К ЭЛЕКТРОННЫМ ПРОГРАММАМ
  {
    id: "elektronnaya-sistema-atestatsii",
    title: "Электронная система аттестации специалистов",
    content: "Информационная система для аттестации. Онлайн-тестирование, сертификация, мониторинг квалификации.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/elektronnaya_sistema_atestatsii.pdf",
    relevanceScore: 0
  },
  {
    id: "programmnoe-obespechenie-sro",
    title: "Программное обеспечение для членов СРО",
    content: "Автоматизированные системы учета. Программы для учета взносов, контроля членов, ведения документации.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/programmnoe_obespechenie_sro.pdf",
    relevanceScore: 0
  },

  // ОБЩЕСТВЕННОЕ МНЕНИЕ И ОТЗЫВЫ
  {
    id: "anketa-udovletvorennosti",
    title: "Анкета удовлетворенности членов СРО",
    content: "Оценка качества услуг СРО. Опросы членов, качество обслуживания, предложения по улучшению.",
    url: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/anketa_udovletvorennosti.pdf",
    relevanceScore: 0
  }
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
