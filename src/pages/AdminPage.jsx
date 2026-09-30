import { useState } from 'react';
import Header from '../components/Header';

// Import management tables
import CruiseTable from '../features/tables/CruiseTable';
import TagTable from '../features/tables/TagTable';
import PromoTable from '../features/tables/PromoTable';
import BookingTable from '../features/tables/BookingTable';
import UserTable from '../features/tables/UsersTable';

// Import creation forms
import CruiseForm from '../features/forms/CruiseForm';
import TagForm from '../features/forms/TagForm';
import PromoForm from '../features/forms/PromoForm';

export default function AdminPage() {
  // Active tab state: 'cruises' | 'tags' | 'promos' | 'bookings' | 'users'
  const [activeTab, setActiveTab] = useState('cruises');

  // Creation form toggles
  const [showAddCruise, setShowAddCruise] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddPromo, setShowAddPromo] = useState(false);

  return (
    <div className="admin-page">
      <Header variant="logged-in" />

      <main className="admin-content">
        <h1>Admin Management Dashboard</h1>

        {/* Tab Navigation Bar (5 Buttons) */}
        <nav className="admin-tab-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('cruises')}
            style={{ fontWeight: activeTab === 'cruises' ? 'bold' : 'normal' }}
          >
            Cruises
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            style={{ fontWeight: activeTab === 'tags' ? 'bold' : 'normal' }}
          >
            Tags
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            style={{ fontWeight: activeTab === 'promos' ? 'bold' : 'normal' }}
          >
            Promos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            style={{ fontWeight: activeTab === 'bookings' ? 'bold' : 'normal' }}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{ fontWeight: activeTab === 'users' ? 'bold' : 'normal' }}
          >
            Users
          </button>
        </nav>

        {/* Tab Views */}
        <section className="admin-view-panel">
          {/* 1. CRUISES TAB */}
          {activeTab === 'cruises' && (
            <div>
              <button
                type="button"
                onClick={() => setShowAddCruise(!showAddCruise)}
                style={{ marginBottom: '15px' }}
              >
                {showAddCruise ? 'Close Form' : '+ Add New Cruise'}
              </button>

              {showAddCruise && (
                <fieldset style={{ marginBottom: '20px' }}>
                  <legend>Create New Cruise</legend>
                  <CruiseForm onSuccess={() => setShowAddCruise(false)} />
                </fieldset>
              )}

              <CruiseTable />
            </div>
          )}

          {/* 2. TAGS TAB */}
          {activeTab === 'tags' && (
            <div>
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                style={{ marginBottom: '15px' }}
              >
                {showAddTag ? 'Close Form' : '+ Add New Tag'}
              </button>

              {showAddTag && (
                <fieldset style={{ marginBottom: '20px' }}>
                  <legend>Create New Tag</legend>
                  <TagForm onSuccess={() => setShowAddTag(false)} />
                </fieldset>
              )}

              <TagTable />
            </div>
          )}

          {/* 3. PROMOS TAB */}
          {activeTab === 'promos' && (
            <div>
              <button
                type="button"
                onClick={() => setShowAddPromo(!showAddPromo)}
                style={{ marginBottom: '15px' }}
              >
                {showAddPromo ? 'Close Form' : '+ Add New Promo'}
              </button>

              {showAddPromo && (
                <fieldset style={{ marginBottom: '20px' }}>
                  <legend>Create New Promo</legend>
                  <PromoForm onSuccess={() => setShowAddPromo(false)} />
                </fieldset>
              )}

              <PromoTable />
            </div>
          )}

          {/* 4. BOOKINGS TAB */}
          {activeTab === 'bookings' && <BookingTable />}

          {/* 5. USERS TAB */}
          {activeTab === 'users' && <UserTable />}
        </section>
      </main>
    </div>
  );
}