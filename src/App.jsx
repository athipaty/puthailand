import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout        from './components/Layout';
import Dashboard     from './pages/Dashboard';
import GeneralLedger from './pages/GeneralLedger';
import AddEntry      from './pages/AddEntry';
import ChartOfAccounts from './pages/ChartOfAccounts';
import RawMaterials  from './pages/RawMaterials';
import CostOfFG      from './pages/CostOfFG';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index              element={<Dashboard />}       />
          <Route path="ledger"      element={<GeneralLedger />}   />
          <Route path="add-entry"   element={<AddEntry />}        />
          <Route path="accounts"    element={<ChartOfAccounts />} />
          <Route path="materials"   element={<RawMaterials />}    />
          <Route path="costofFG"    element={<CostOfFG />}        />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
