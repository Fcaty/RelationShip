import './App.css'
import CruiseTable from './features/tables/CruiseTable'
import TagTable from './features/tables/TagTable'
import PromoTable from './features/tables/PromoTable'
import CruiseForm from './features/tables/BookingTable'

export default function App() {
  return (
    <main>
      <CruiseTable />
      <TagTable />
      <PromoTable />
      <CruiseForm />
    </main>
  );
}
