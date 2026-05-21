import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ApplicationList from './pages/ApplicationList';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetail from './pages/ApplicationDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ApplicationList />} />
          <Route path="new" element={<ApplicationForm />} />
          <Route path=":id" element={<ApplicationDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;