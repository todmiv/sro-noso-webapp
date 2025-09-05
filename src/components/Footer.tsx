import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-bg text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
            <p className="mb-2"><strong>Телефоны:</strong></p>
            <p className="mb-1">+7 (831) 433-15-27</p>
            <p className="mb-4">+7 (831) 419-72-25</p>
            <p className="mb-2"><strong>Email:</strong></p>
            <p className="mb-1"><a href="mailto:dsrpkkov.noso@mail.ru" className="text-blue-300 hover:text-white hover:underline">dsrpkkov.noso@mail.ru</a></p>
            <p className="mb-2"><a href="mailto:4331527@mail.ru" className="text-blue-300 hover:text-white hover:underline">4331527@mail.ru</a></p>
            <p className="mb-2"><strong>Время работы:</strong></p>
            <p>Понедельник - пятница: 09:00 - 17:00</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Руководство СРО</h3>
            <div className="flex items-start mb-4">
              <img
                src="https://www.sronoso.ru/upload/rukovodstvo/shamuzapharov.gif"
                alt="А.Ш. Шамузафаров"
                className="w-16 h-16 mr-4 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-medium">Шамузафаров А.Ш.</p>
                <p className="text-sm text-gray-300">Генеральный директор</p>
              </div>
            </div>
            <div className="flex items-start mb-4">
              <img
                src="https://www.sronoso.ru/upload/rukovodstvo/kozhuhovsky_85.jpg"
                alt="Кожуховский А.О."
                className="w-16 h-16 mr-4 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-medium">Кожуховский А.О.</p>
                <p className="text-sm text-gray-300">Президент Совета</p>
              </div>
            </div>
            <div className="flex items-start">
              <img
                src="https://www.sronoso.ru/upload/persons/gribkov_85.jpg"
                alt="Грибков Д.С."
                className="w-16 h-16 mr-4 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-medium">Грибков Д.С.</p>
                <p className="text-sm text-gray-300">Исполнительный директор</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Обновленный блок с адресом */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex items-start">
            <svg className="icon-standard mr-2 mt-1 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-400">
              603000, г. Нижний Новгород, улица Большая Покровская, дом 15, помещение (офис) 7
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2009 - 2025 СРО Ассоциация «Нижегородское объединение строительных организаций (НОСО)»</p>
          <p className="mt-2">Дата и время обновления информации: 24.06.2025 21:47:28</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
