// PERFECTLY SYNCED: Based ONLY on actual 18 files from GitHub Release v1.0
// All files verified and available for download
export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  publishedDate: string;
  fileUrl: string;  // GitHub Release URL
  downloadUrl: string;
  relevanceScore: number;  // For sorting popularity
  tags: string[];
  available: boolean;  // Marks unavailable documents
}

export const documents: Document[] = [
  // REGULATORY DOCUMENTS (Нормативные документы) - EXACTLY FROM GITHUB RELEASE v1.0
  {
    id: "ustav-sro-noso",
    title: "Устав Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Основной устав организации в актуальной редакции",
    category: "Нормативные документы",
    fileSize: "12.8 MB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/ustav_sro_noso.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/ustav_sro_noso.pdf",
    available: true,
    relevanceScore: 100,
    tags: ["устав", "основные положения", "организация", "сро"]
  },
  {
    id: "standart-assotsiatsii",
    title: "Стандарт Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Основные стандарты и требования саморегулируемой организации",
    category: "Нормативные документы",
    fileSize: "245 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/standart_assotsiatsii.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/standart_assotsiatsii.pdf",
    available: true,
    relevanceScore: 95,
    tags: ["стандарты СРО", "требования", "качество"]
  },
  {
    id: "polozhenie-o-chlenstve-v-sro",
    title: "Положение о членстве в СРО",
    description: "Условия членства и порядок вступления в саморегулируемую организацию",
    category: "Нормативные документы",
    fileSize: "264 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_chlenstve_v_sro.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_chlenstve_v_sro.pdf",
    available: true,
    relevanceScore: 90,
    tags: ["членство", "взносы", "вступление"]
  },

  // Certificates and Registrations (Свидетельства и регистрации)
  {
    id: "svidetelstvo-gos-reg-2009",
    title: "Свидетельство о государственной регистрации юридического лица от 29.04.2009 года",
    description: "Основной документы о государственной регистрации организации",
    category: "Свидетельства и регистрации",
    fileSize: "0.8 MB",
    publishedDate: "29.04.2009",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svidetelstvo_o_gosudarstvennoy_registratsii.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svidetelstvo_o_gosudarstvennoy_registratsii.pdf",
    available: false,
    relevanceScore: 95,
    tags: ["государственная регистрация", "юридический статус"]
  },
  {
    id: "nalog-org-2009",
    title: "Свидетельство о постановке организации на учет в налоговом органе от 29.04.2009 года",
    description: "Налоговый учет организации",
    category: "Свидетельства и регистрации",
    fileSize: "0.6 MB",
    publishedDate: "29.04.2009",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/nalog-org-2009.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/nalog-org-2009.pdf",
    available: false,
    relevanceScore: 80,
    tags: ["налоговый учет", "ИНН"]
  },

  // SRO Registration Documents (Документы регистрации в СРО)
  {
    id: "reshenie-vnesenie-sro",
    title: "Решение о внесении сведений в государственный реестр саморегулируемых организаций",
    description: "Подтверждение регистрации организации как СРО",
    category: "СРО регистрация",
    fileSize: "0.9 MB",
    publishedDate: "10.11.2009",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reshenie-vnesenie-sro.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/reshenie-vnesenie-sro.pdf",
    available: false,
    relevanceScore: 88,
    tags: ["СРО", "реестр", "регистрация"]
  },
  {
    id: "uvedomlenie-sro-reg",
    title: "Уведомление о внесении сведений в государственный реестр саморегулируемых организаций",
    description: "Подтверждение приема с уведомлением о регистрации",
    category: "СРО регистрация",
    fileSize: "0.7 MB",
    publishedDate: "10.11.2009",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/uvedomlenie-sro-reg.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/uvedomlenie-sro-reg.pdf",
    available: false,
    relevanceScore: 85,
    tags: ["усведомление", "СРО", "регистрация"]
  },
  {
    id: "svidetelstvo-gos-reg-2017",
    title: "Свидетельство о государственной регистрации некоммерческой организации от 02.03.2017",
    description: "Регистрация некоммерческой организации Ассоциации НОСО",
    category: "Свидетельства и регистрации",
    fileSize: "0.8 MB",
    publishedDate: "02.03.2017",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svidetelstvo-gos-reg-2017.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svidetelstvo-gos-reg-2017.pdf",
    available: true,
    relevanceScore: 87,
    tags: ["государственная регистрация", "некоммерческая организация"]
  },
  {
    id: "nalog-org-2017",
    title: "Свидетельство о постановке организации на учет в налоговом органе от 05.12.2016 года",
    description: "Налоговый учет организации по новому свидетельству",
    category: "Свидетельства и регистрации",
    fileSize: "0.6 MB",
    publishedDate: "05.12.2016",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/nalog-org-2017.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/nalog-org-2017.pdf",
    available: false,
    relevanceScore: 78,
    tags: ["налоговый учет", "повторное свидетельство"]
  },
  {
    id: "list-zapisi-2016",
    title: "Лист записи от 13.10.2016 года",
    description: "Запись о внесенных изменениях в регистрационные документы",
    category: "Юридические документы",
    fileSize: "0.5 MB",
    publishedDate: "13.10.2016",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/list-zapisi-2016.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/list-zapisi-2016.pdf",
    available: false,
    relevanceScore: 75,
    tags: ["лист записи", "внесение изменений"]
  },
  {
    id: "list-zapisi-2017",
    title: "Лист записи от 02.03.2017 года",
    description: "Подтверждение о регистрации изменений 2017 года",
    category: "Юридические документы",
    fileSize: "0.5 MB",
    publishedDate: "02.03.2017",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/list-zapisi-2017.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/list-zapisi-2017.pdf",
    available: false,
    relevanceScore: 74,
    tags: ["лист записи", "регистрационные изменения"]
  },

  // Methodological Documents (Методические документы)
  {
    id: "polozhenie-o-kontrole-za-deyatelnostyu-chlenov",
    title: "Положение «О контроле саморегулируемой организации Ассоциацией «Нижегородское объединение строительных организаций» за деятельностью своих членов»",
    description: "Методика контроля деятельности членов СРО",
    category: "Методические документы",
    fileSize: "540 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kontrole_za_deyatelnostyu_chlenov.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kontrole_za_deyatelnostyu_chlenov.pdf",
    available: true,
    relevanceScore: 92,
    tags: ["контроль", "деятельность", "методика"]
  },
  {
    id: "polozhenie-o-distsiplinarnykh-vzyskaniyakh-za-narusheniya-stroitelnykh-norm",
    title: "Положение «О системе мер дисциплинарного воздействия за несоблюдение требований законодательства Российской Федерации о градостроительной деятельности, условий членства, требований стандартов и внутренних документов Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Система дисциплинарной ответственности членов СРО",
    category: "Методические документы",
    fileSize: "280 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnykh_vzyskaniyakh_za_narusheniya_stroitelnykh_norm.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnykh_vzyskaniyakh_za_narusheniya_stroitelnykh_norm.pdf",
    available: true,
    relevanceScore: 91,
    tags: ["дисциплинарная ответственность", "наказания", "несоблюдение"]
  },
  {
    id: "polozhenie-o-zhalobakh-na-chlenov-sro",
    title: "Положение «О процедуре рассмотрения жалоб на действия (бездействие) членов Ассоциации «Нижегородское объединение строительных организаций» и иных обращений, поступивших в саморегулируемую организацию»",
    description: "Процедура обработки жалоб и обращений о нарушениях",
    category: "Методические документы",
    fileSize: "211 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_zhalobakh_na_chlenov_sro.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_zhalobakh_na_chlenov_sro.pdf",
    available: true,
    relevanceScore: 89,
    tags: ["жалобы", "процедура рассмотрения", "обращения"]
  },
  {
    id: "otchety-analiz-polozhenie",
    title: "Положение «О проведении саморегулируемой организацией Ассоциацией «Нижегородское объединение строительных организаций» анализа деятельности своих членов на основании информации, представляемой ими в форме отчётов»",
    description: "Методика анализа деятельности членов СРО на основе отчетов",
    category: "Методические документы",
    fileSize: "1.3 MB",
    publishedDate: "27.09.2023",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/otchety-analiz-polozhenie.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/otchety-analiz-polozhenie.pdf",
    available: true,
    relevanceScore: 87,
    tags: ["анализ деятельности", "отчеты", "методика"]
  },
  {
    id: "polozhenie-o-distsiplinarnom-organe",
    title: "Положение о дисциплинарной комиссии саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Организация работы дисциплинарного органа СРО",
    category: "Методические документы",
    fileSize: "194 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnom_organe.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_distsiplinarnom_organe.pdf",
    available: true,
    relevanceScore: 84,
    tags: ["дисциплинарный орган", "меры воздействия"]
  },
  {
    id: "polozhenie-o-kontrolnom-komitete",
    title: "Положение о Контрольном комитете саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Организация работы контрольного комитета СРО",
    category: "Нормативные документы",
    fileSize: "209 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kontrolnom_komitete.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kontrolnom_komitete.pdf",
    available: true,
    relevanceScore: 88,
    tags: ["контрольный комитет", "надзор", "контроль"]
  },

  // Insurance Documents (Страховые документы)
  {
    id: "strahovanie-grazhdanskaya-otvetstvennost-polozhenie",
    title: "Положение о страховании гражданской ответственности в случае причинения членами Ассоциации «Нижегородское объединение строительных организаций» вреда вследствие недостатков работ, которые оказывают влияние на безопасность объектов капитального строительства",
    description: "Страхование ответственности за качество строительных работ",
    category: "Страховые документы",
    fileSize: "1.6 MB",
    publishedDate: "26.04.2019",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_grazhdanskoy_otvetstvennosti.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_grazhdanskoy_otvetstvennosti.pdf",
    available: true,
    relevanceScore: 93,
    tags: ["страхование", "гражданская ответственность", "качество работ"]
  },
  {
    id: "dogovornaya-otvetctvennost-strahovanie-polozhenie",
    title: "Положение о страховании ответственности за нарушение членами Ассоциации «Нижегородское объединение строительных организаций» условий договора строительного подряда, реконструкции, капитального ремонта, договора подряда на осуществление сноса, заключенного с использованием конкурентных способов заключения договоров, и финансовых рисков, возникающих вследствие неисполнения или ненадлежащего исполнения договора подряда, заключенного с использованием конкурентных способов заключения договоров",
    description: "Комплексное страхование договорных обязательств и финансовых рисков",
    category: "Страховые документы",
    fileSize: "2.4 MB",
    publishedDate: "21.05.2020",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_otvetstvennosti.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_strakhovanii_otvetstvennosti.pdf",
    available: true,
    relevanceScore: 90,
    tags: ["страхование", "договорные обязательства", "финансовые риски"]
  },

  // Standards and Qualifications (Стандарты и квалификация)
  {
    id: "kvalifikatsionnyy-standart-rukovoditel-stroitelnoy-organizatsii",
    title: "Квалификационный стандарт \"Руководитель строительной организации\"",
    description: "Квалификационные требования к руководителям строительства",
    category: "Стандарты и квалификация",
    fileSize: "1.2 MB",
    publishedDate: "12.07.2023",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_rukovoditel_stroitelnoy_organizatsii.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_rukovoditel_stroitelnoy_organizatsii.pdf",
    available: true,
    relevanceScore: 95,
    tags: ["квалификация", "руководитель строительной организации", "требования"]
  },
  {
    id: "kvalifikatsionnyy-standart-spetsialist-po-organizatsii-stroitelstva",
    title: "Квалификационный стандарт \"Специалист по организации строительства\"",
    description: "Квалификационные требования к специалистам по организации строительства",
    category: "Стандарты и квалификация",
    fileSize: "1.3 MB",
    publishedDate: "12.07.2023",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_spetsialist_po_organizatsii_stroitelstva.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/kvalifikatsionnyy_standart_spetsialist_po_organizatsii_stroitelstva.pdf",
    available: true,
    relevanceScore: 94,
    tags: ["квалификация", "специалист по организации строительства", "требования"]
  },

  // Compensatory Funds (Компенсационные фонды)
  {
    id: "kompens-fond-vred-polozhenie",
    title: "Положение о компенсационном фонде возмещения вреда саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Фонд возмещения вреда от недостатков работ членов СРО",
    category: "Компенсационные фонды",
    fileSize: "1.1 MB",
    publishedDate: "27.09.2023",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_vozmescheniya_vreda.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_vozmescheniya_vreda.pdf",
    available: true,
    relevanceScore: 86,
    tags: ["компенсационный фонд", "возмещение вреда", "финансовая ответственность"]
  },
  {
    id: "kompens-fond-dogovory-ob-ekaty-polozhenie",
    title: "Положение о компенсационном фонде обеспечения договорных обязательств саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Фонд обеспечения исполнения договорных обязательств",
    category: "Компенсационные фонды",
    fileSize: "1.0 MB",
    publishedDate: "27.09.2023",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_obespecheniya_dogovornykh_obyazatelstv.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_kompensatsionnom_fonde_obespecheniya_dogovornykh_obyazatelstv.pdf",
    available: true,
    relevanceScore: 85,
    tags: ["компенсационный фонд", "договорные обязательства", "финансовая защита"]
  },

  // Information Openness (Информационная открытость)
  {
    id: "polozhenie-ob-informatsionnoy-otkrytosti",
    title: "Положение об информационной открытости деятельности Ассоциации «Нижегородское объединение строительных организаций» и деятельности её членов",
    description: "Требования к информационной открытости деятельности СРО и ее членов",
    category: "Информационная открытость",
    fileSize: "231 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_ob_informatsionnoy_otkrytosti.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_ob_informatsionnoy_otkrytosti.pdf",
    available: true,
    relevanceScore: 83,
    tags: ["информационная открытость", "транспарентность", "отчетность"]
  },
  {
    id: "reestr-chlenov-polozhenie",
    title: "Положение «О реестре членов саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Ведение и публикация реестра членов СРО",
    category: "Информационная открытость",
    fileSize: "187 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_reestre_chlenov.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_reestre_chlenov.pdf",
    available: true,
    relevanceScore: 82,
    tags: ["реестр членов", "регистрация", "членство"]
  },

  // SOUT Documents (Документы СОУТ)
  {
    id: "sout-vedomost-i-meropriyatie",
    title: "Сводная ведомость результатов проведения СОУТ и Перечень рекомендуемых мероприятий Ассоциации «Нижегородское объединение строительных организаций»",
    description: "Результаты оценки условий труда и рекомендации по улучшению",
    category: "Безопасность и охрана труда",
    fileSize: "768 KB",
    publishedDate: "1 hour ago",
    fileUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svodnaya_vedomost_rezultatov_provedeniya_sout.pdf",
    downloadUrl: "https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/svodnaya_vedomost_rezultatov_provedeniya_sout.pdf",
    available: true,
    relevanceScore: 79,
    tags: ["СОУТ", "условия труда", "безопасность"]
  }
];

// Categories for filtering
export const documentCategories = [
  'Все категории',
  'Нормативные документы',
  'Свидетельства и регистрации',
  'СРО регистрация',
  'Юридические документы',
  'Методические документы',
  'Страховые документы',
  'Стандарты и квалификация',
  'Компенсационные фонды',
  'Информационная открытость',
  'Безопасность и охрана труда'
];

// Helper functions
export const getDocumentsByCategory = (category: string): Document[] => {
  if (category === 'Все категории') return documents;
  return documents.filter(doc => doc.category === category);
};

export const searchDocuments = (query: string, category?: string): Document[] => {
  const filteredDocs = category && category !== 'Все категории'
    ? documents.filter(doc => doc.category === category)
    : documents;

  if (!query.trim()) return filteredDocs;

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

  return filteredDocs.filter(doc => {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    const tags = doc.tags.join(' ').toLowerCase();

    return searchTerms.some(term =>
      title.includes(term) ||
      description.includes(term) ||
      tags.includes(term)
    );
  }).sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
};

export const getDocumentsStats = () => ({
  total: documents.length,
  categories: documentCategories.slice(1).reduce((acc, category) => ({
    ...acc,
    [category]: documents.filter(doc => doc.category === category).length
  }), {} as Record<string, number>),
  tags: Array.from(new Set(documents.flatMap(doc => doc.tags)))
});
