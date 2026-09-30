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
        <div className="admin-tab-bar mb-5 flex flex-wrap gap-2" role="group" aria-label="Management sections">
          <button
            type="button"
            id="tab-cruises"
            aria-controls="admin-view-panel"
            aria-pressed={activeTab === 'cruises'}
            className={`blue ${activeTab === 'cruises' ? '' : 'opacity-70'}`}
            onClick={() => setActiveTab('cruises')}
          >
            Cruises
          </button>
          <button
            type="button"
            id="tab-tags"
            aria-controls="admin-view-panel"
            aria-pressed={activeTab === 'tags'}
            className={`blue ${activeTab === 'tags' ? '' : 'opacity-70'}`}
            onClick={() => setActiveTab('tags')}
          >
            Tags
          </button>
          <button
            type="button"
            id="tab-promos"
            aria-controls="admin-view-panel"
            aria-pressed={activeTab === 'promos'}
            className={`blue ${activeTab === 'promos' ? '' : 'opacity-70'}`}
            onClick={() => setActiveTab('promos')}
          >
            Promos
          </button>
          <button
            type="button"
            id="tab-bookings"
            aria-controls="admin-view-panel"
            aria-pressed={activeTab === 'bookings'}
            className={`blue ${activeTab === 'bookings' ? '' : 'opacity-70'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button
            type="button"
            id="tab-users"
            aria-controls="admin-view-panel"
            aria-pressed={activeTab === 'users'}
            className={`blue ${activeTab === 'users' ? '' : 'opacity-70'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {/* Tab Views */}
        <section id="admin-view-panel" className="admin-view-panel" aria-labelledby={`tab-${activeTab}`}>
          {/* 1. CRUISES TAB */}
          {activeTab === 'cruises' && (
            <div>
              <button
                type="button"
                onClick={() => setShowAddCruise(!showAddCruise)}
                className={`mb-4 ${showAddCruise ? 'pink' : 'blue'}`}
              >
                {showAddCruise ? 'Close Form' : '+ Add New Cruise'}
              </button>

              {showAddCruise && (
                <fieldset className="mb-5">
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
                className={`mb-4 ${showAddTag ? 'pink' : 'blue'}`}
              >
                {showAddTag ? 'Close Form' : '+ Add New Tag'}
              </button>

              {showAddTag && (
                <fieldset className="mb-5">
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
                className={`mb-4 ${showAddPromo ? 'pink' : 'blue'}`}
              >
                {showAddPromo ? 'Close Form' : '+ Add New Promo'}
              </button>

              {showAddPromo && (
                <fieldset className="mb-5">
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