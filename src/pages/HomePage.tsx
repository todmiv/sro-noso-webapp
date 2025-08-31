import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4">
      <section className="hero-bg rounded-2xl p-8 md:p-12 mb-10 text-center overflow-hidden">
        <div className="hero-content max-w-3xl mx-auto relative z-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            СРО Ассоциация «Нижегородское объединение строительных организаций»
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Присоединяйтесь к нам и получите доступ к ключевым документам, информации о членстве и многому другому.
          </p>
          <Link to="/documents" className="btn-primary inline-flex items-center hover-effect transition-all duration-300">
            <svg className="icon-standard mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            Просмотреть документы
          </Link>
        </div>
      </section>

      <section className="mb-12 bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full opacity-20 -mt-16 -mr-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 rounded-full opacity-20 -mb-12 -ml-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <svg className="icon-standard text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">О нашей организации</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Исполняя требования действующего законодательства, СРО Ассоциация «Нижегородское объединение строительных организаций» предоставляет каждому потенциальному члену возможность изучить в открытом доступе наши учредительные и внутренние документы. Для СРО открытость информации о механизмах работы, принятия решений и осуществления контроля является одним из важнейших принципов функционирования в строительной отрасли.
          </p>
          <p className="text-gray-700">
            Если Вы планируете вступить в Ассоциацию и получить свидетельство СРО, мы рекомендуем внимательно ознакомиться со Стандартом и Правилами организации. В них представлен перечень требований, которым должны соответствовать юридические лица и индивидуальные предприниматели для получения свидетельства СРО о допуске к работам.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                <svg className="icon-standard mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Опыт
              </h3>
              <p className="text-gray-600 text-sm">Значительный срок деятельности Ассоциации на рынке и многолетний опыт руководства в управлении строительной отраслью</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                <svg className="icon-standard mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Надежность
              </h3>
              <p className="text-gray-600 text-sm">Разумная политика взносов и сохранность компенсационных фондов</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                <svg className="icon-standard mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                </svg>
                Открытость
              </h3>
              <p className="text-gray-600 text-sm">Информационная открытость в соответствии с действующим законодательством</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Быстрые ссылки</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/documents" className="card block transform transition duration-500 hover:scale-105">
            <div className="p-6">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <svg className="icon-large text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Документы СРО</h3>
              <p className="text-gray-600 text-center">Полный список учредительных и внутренних документов.</p>
            </div>
          </Link>
          <Link to="/login" className="card block transform transition duration-500 hover:scale-105">
            <div className="p-6">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <svg className="icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="11"/>
                  <circle cx="12" cy="9" r="3"/>
                  <path d="M5 20c0-3 3-5 7-5s7 2 7 5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Вход для членов</h3>
              <p className="text-gray-600 text-center">Доступ к личному кабинету и специальным функциям.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="icon-standard mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Актуальная информация
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden card">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="icon-standard text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Общее собрание членов СРО</h3>
                  <p className="text-gray-600 text-sm mt-1">17 апреля 2025 года состоится Общее собрание членов саморегулируемой организации Ассоциации «Нижегородское объединение строительных организаций».</p>
                  <p className="text-gray-600 text-sm mt-1">Место проведения: г. Нижний Новгород, ул. Большая Покровская, д. 15, пом. 7</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden card">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <svg className="icon-standard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Информационная открытость</h3>
                  <p className="text-gray-600 text-sm mt-1">Саморегулируемая организация Ассоциация «Нижегородское объединение строительных организаций» предоставляет каждому потенциальному члену возможность изучить в открытом доступе наши учредительные и внутренние документы.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;