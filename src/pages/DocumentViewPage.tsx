import React from 'react';
import { useParams } from 'react-router-dom';

const mockDocument = {
  id: 1,
  title: "Устав Ассоциации «Нижегородское объединение строительных организаций»",
  date: "27.09.2023 18:25:00",
  pdfUrl: "https://www.sronoso.ru/upload/documents/ustav_noso.pdf"
};

const DocumentViewPage = () => {
  const { id } = useParams();
  const document = mockDocument;

  if (!document) {
    return <div className="container mx-auto px-4 py-8">Документ не найден.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <svg className="icon-large mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
          {document.title}
        </h1>
        <p className="text-gray-600 mb-6 flex items-center">
          <svg className="icon-standard mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Дата размещения: {document.date}
        </p>

        <div className="mb-4">
          <a
            href={document.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center"
          >
            <svg className="icon-standard mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Открыть PDF в новой вкладке
          </a>
        </div>
      </div>

      <div className="border border-gray-300 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 text-sm text-gray-600">
          Предварительный просмотр документа
        </div>
        <object
          data={document.pdfUrl}
          type="application/pdf"
          width="100%"
          height="600px"
          className="w-full h-[600px]"
        >
          <p className="p-4 text-center text-gray-500">
            Ваш браузер не поддерживает отображение PDF. Вы можете <a href={document.pdfUrl} className="text-blue-600 hover:underline">скачать документ</a>.
          </p>
        </object>
      </div>
    </div>
  );
};

export default DocumentViewPage;