// Utils for document handling and PDF viewing
export const openDocumentInNewTab = (url: string): void => {
  // Открываем в новой вкладке
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const downloadDocument = (url: string, filename: string): void => {
  // Создаем временную ссылку для скачивания
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.type = 'application/pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Google Docs Viewer для корректного просмотра PDF
const createGoogleViewerUrl = (url: string): string => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

// PDF iframe viewer
const createIframeUrl = (url: string): string => {
  return `data:text/html,<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`;
};

export const handleDocumentView = (url: string): void => {
  console.log('Открываем PDF для просмотра:', url);

  // Используем Google Docs Viewer для GitHub файлов - он может просматривать PDF в браузере
  const viewUrl = url.includes('github.com') ? createGoogleViewerUrl(url) : url;

  console.log('Используем viewer URL:', viewUrl);

  // Способ 1: Прямое открытие в новой вкладке
  try {
    const newWindow = window.open(viewUrl, '_blank', 'noopener,noreferrer,width=1200,height=800');

    if (!newWindow) {
      console.error('Блокировщик попапов активен');
      throw new Error('Popup blocked');
    }

    return;

  } catch (error) {
    console.error('Ошибка при открытии PDF:', error);
    alert('Не удалось открыть документ. Попробуйте скачать файл.');
  }
};

// Утилита для создания правильной ссылки на просмотр PDF
export const createViewerUrl = (url: string, filename: string): string => {
  // Возвращаем оригинальную ссылку с добавлением дополнительных параметров
  if (url.includes('github.com')) {
    // Для GitHub Release URL:
    // https://github.com/todmiv/sro-noso-webapp/releases/download/v1.0/polozhenie_o_chlenstve_v_sro.pdf
    // Нужно преобразовать в:
    // https://github.com/todmiv/sro-noso-webapp/raw/main/polozhenie_o_chlenstve_v_sro.pdf
    return url.replace('/releases/download/v1.0/', '/raw/main/');
  }
  return url;
};

// Хелпер для определения типа файла по расширению
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
};
