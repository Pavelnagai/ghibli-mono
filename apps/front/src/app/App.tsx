import './App.css';
import { useMe } from '@/shared/hooks/useMe';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { useTopSafeArea } from '@/shared/hooks/useTopSafeArea';
import { BrowserRouter } from 'react-router-dom';
import Router from './providers/router';

export const App = () => {
  useMe();
  useTelegram();
  const { topSafeAreaOffset } = useTopSafeArea(10);

  return (
    <div className="container" style={{ paddingTop: topSafeAreaOffset }}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  );
};
