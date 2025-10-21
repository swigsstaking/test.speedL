import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import ServerDetail from './pages/ServerDetail';
import Sites from './pages/Sites';
import SiteDetail from './pages/SiteDetail';
import FinancialAnalytics from './pages/FinancialAnalytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="servers" element={<Servers />} />
        <Route path="servers/:serverId" element={<ServerDetail />} />
        <Route path="sites" element={<Sites />} />
        <Route path="sites/:siteId" element={<SiteDetail />} />
        <Route path="analytics" element={<FinancialAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;
