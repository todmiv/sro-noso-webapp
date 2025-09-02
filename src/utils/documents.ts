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

export const handleDocumentView = (url: string): void => {
  console.log('Открываем PDF для просмотра:', url);

  // Способ 1: Прямое открытие в новой вкладке с правильными атрибутами
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

    if (!newWindow) {
      console.error('Блокировщик попапов активен');
      throw new Error('Popup blocked');
    }

    // Убеждаемся что окно открылось успешно
    if (newWindow.closed !== false) {
      console.warn('Окно было автоматически закрыто');
    }

    return;

  } catch (error) {
    console.error('Ошибка при открытии PDF:', error);

    // Способ 2: Fallback через создание ссылки и имитацию клика
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Fallback метод использован успешно');
    } catch (fallbackError) {
      console.error('Все методы открытия PDF провалились:', fallbackError);
      alert('Не удалось открыть документ. Попробуйте скачать файл.');
    }
  }
};

// Утилита для создания правильной ссылки на просмотр PDF
export const createViewerUrl = (url: string, filename: string): string => {
  // Возвращаем оригинальную ссылку с добавлением дополнительных параметров
  if (url.includes('github.com')) {
    // Для GitHub - используем raw URL если возможно
    return url.replace('/releases/download/', '/raw/main/');
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
