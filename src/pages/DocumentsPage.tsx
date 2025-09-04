import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { documents, documentCategories, searchDocuments, getDocumentsStats } from '../data/documents';
import { handleDocumentView, downloadDocument } from '../utils/documents';
import Modal from '../components/Modal';

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{title: string, url: string} | null>(null);

  const stats = useMemo(() => getDocumentsStats(), []);

  const filteredDocuments = useMemo(() => {
    return searchDocuments(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Все категории');
  };

  const handleDocumentPreview = (title: string, url: string) => {
    setCurrentDocument({ title, url });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDocument(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="icon-xl mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
        Документы СРО
      </h1>

      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Поиск по названию документа..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="icon-standard text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="table-header">
              <th className="py-3 px-4 text-left rounded-tl-lg">Название документа</th>
              <th className="py-3 px-4 text-left">Дата размещения</th>
              <th className="py-3 px-4 text-left rounded-tr-lg">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
                <tr key={doc.id} className={`table-row-hover ${index === filteredDocuments.length - 1 ? 'rounded-b-lg' : ''}`}>
                  <td className="py-3 px-4 border-b border-gray-200">{doc.title}</td>
                  <td className="py-3 px-4 border-b border-gray-200">{doc.publishedDate}</td>
                  <td className="py-3 px-4 border-b border-gray-200 space-x-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => doc.available && handleDocumentPreview(doc.title, doc.fileUrl)}
                        className={`inline-flex items-center text-sm px-3 py-2 rounded transition-colors ${
                          doc.available
                            ? "btn-primary hover:bg-blue-700"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                        }`}
                        title={doc.available ? `Просмотреть в браузере: ${doc.title}` : "Документ пока недоступен"}
                        disabled={!doc.available}
                      >
                        <svg className={`icon-standard mr-1 ${doc.available ? "text-white" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Просмотреть
                      </button>
                      <button
                        onClick={() => doc.available && downloadDocument(doc.fileUrl, `${doc.id}.pdf`)}
                        className={`inline-flex items-center text-sm px-3 py-2 rounded transition-colors ${
                          doc.available
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                        }`}
                        title={doc.available ? `Скачать: ${doc.title}` : "Документ пока недоступен"}
                        disabled={!doc.available}
                      >
                        <svg className={`icon-standard mr-1 ${doc.available ? "" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Скачать
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-6 px-4 text-center text-gray-500">
                  Документы не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentDocument?.title || "Просмотр документа"}
        size="xl"
        showCloseButton={true}
        closeOnBackdropClick={true}
      >
        <div className="h-[600px] w-full">
          {currentDocument && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentDocument.url)}&embedded=true`}
              className="w-full h-full border-0 rounded"
              title={`Просмотр: ${currentDocument.title}`}
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
