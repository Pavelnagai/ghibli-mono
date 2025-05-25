import { FaTools } from 'react-icons/fa';

export const UnderDevelopment = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-lg">
      <div className="bg-yellow-100 p-4 rounded-full mb-4">
        <FaTools className="w-8 h-8 text-yellow-600" />
      </div>
      <h2 className="text-2xl font-bold text-yellow-800 mb-3">Страница в разработке</h2>
      <p className="text-yellow-700 text-center max-w-md">
        Мы работаем над улучшением этой страницы. Скоро она будет доступна!
      </p>
    </div>
  );
};
