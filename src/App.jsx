import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard       from './components/AuthGuard';
import Layout          from './components/Layout';
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import GeneralLedger   from './pages/GeneralLedger';
import AddEntry        from './pages/AddEntry';
import ChartOfAccounts from './pages/ChartOfAccounts';
import RawMaterials    from './pages/RawMaterials';
import CostOfFG        from './pages/CostOfFG';
import Contact         from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index              element={<Dashboard />}       />
          <Route path="ledger"      element={<GeneralLedger />}   />
          <Route path="add-entry"   element={<AddEntry />}        />
          <Route path="accounts"    element={<ChartOfAccounts />} />
          <Route path="materials"   element={<RawMaterials />}    />
          <Route path="costofFG"    element={<CostOfFG />}        />
          <Route path="contact"     element={<Contact />}         />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
