import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storage';

export default function AddCruiseForm({ initialData = null, onSuccess = null }) {
  const isEditMode = Boolean(initialData);
  
  const [cruise, setCruise] = useState({
    cruise_name: initialData?.cruise_name || '',
    cruise_destination: initialData?.cruise_destination || '',
    cruise_port: initialData?.cruise_port || '',
    cruise_description: initialData?.cruise_description || '',
  });

  const [cruiseImageFile, setCruiseImageFile] = useState(null);
  const [cruiseImageUrl, setCruiseImageUrl] = useState(initialData?.cruise_image_url || '');

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(initialData?.tag_ids || []);
  
  const [tiers, setTiers] = useState(
    initialData?.tiers || [
      { tier_name: 'Economy', tier_limit: 50, tier_price: 299, tier_image_url: '', imageFile: null }
    ]
  );

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setCruise({
        cruise_name: initialData.cruise_name || '',
        cruise_destination: initialData.cruise_destination || '',
        cruise_port: initialData.cruise_port || '',
        cruise_description: initialData.cruise_description || '',
      });
      setCruiseImageUrl(initialData.cruise_image_url || '');
      setSelectedTagIds(initialData.tag_ids || []);
      setTiers(
        initialData.tiers || [
          { tier_name: 'Economy', tier_limit: 50, tier_price: 299, tier_image_url: '', imageFile: null }
        ]
      );
    }
  }, [initialData]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tags'));
        const tagsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableTags(tagsList);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    setCruise({ ...cruise, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...tiers];
    updatedTiers[index][field] = field === 'tier_name' ? value : Number(value);
    setTiers(updatedTiers);
  };

  const handleTierImageChange = (index, file) => {
    const updatedTiers = [...tiers];
    updatedTiers[index].imageFile = file;
    setTiers(updatedTiers);
  };

  const addTierField = () => {
    setTiers([...tiers, { tier_name: '', tier_limit: 0, tier_price: 0, tier_image_url: '', imageFile: null }]);
  };

  const removeTierField = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      let targetDocId = initialData?.id;

      if (!isEditMode) {
        const snapshot = await getDocs(collection(db, 'cruises'));
        const nextIndex = snapshot.size + 1;
        targetDocId = `CRUISE-${String(nextIndex).padStart(3, '0')}`;
      }

      let finalCruiseImageUrl = cruiseImageUrl;
      if (cruiseImageFile) {
        finalCruiseImageUrl = await uploadImage(cruiseImageFile, 'cruise_covers');
      }

      const processedTiers = await Promise.all(
        tiers.map(async (tier) => {
          let finalTierImageUrl = tier.tier_image_url || '';
          if (tier.imageFile) {
            finalTierImageUrl = await uploadImage(tier.imageFile, 'tier_covers');
          }
          return {
            tier_name: tier.tier_name,
            tier_limit: Number(tier.tier_limit),
            tier_price: Number(tier.tier_price),
            tier_image_url: finalTierImageUrl,
          };
        })
      );

      await setDoc(doc(db, 'cruises', targetDocId), {
        ...cruise,
        cruise_image_url: finalCruiseImageUrl,
        tag_ids: selectedTagIds,
        tiers: processedTiers,
        updated_at: new Date().toISOString(),
        ...(isEditMode ? {} : { created_at: new Date().toISOString() }),
      });

      setStatusMsg(`Cruise ${isEditMode ? 'updated' : 'created'} with ID: ${targetDocId}`);

      if (!isEditMode) {
        setCruise({ cruise_name: '', cruise_destination: '', cruise_port: '', cruise_description: '' });
        setCruiseImageFile(null);
        setCruiseImageUrl('');
        setSelectedTagIds([]);
        setTiers([{ tier_name: 'Economy', tier_limit: 50, tier_price: 299, tier_image_url: '', imageFile: null }]);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving cruise:', error);
      setStatusMsg('Failed to save cruise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{isEditMode ? `Edit Cruise (${initialData.id})` : 'Add New Cruise'}</h3>

      {statusMsg && <p>{statusMsg}</p>}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>1. Basic Information</legend>
          <div>
            <label htmlFor="cruise_name">Cruise Name</label>
            <input
              id="cruise_name"
              type="text"
              name="cruise_name"
              value={cruise.cruise_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="cruise_destination">Destination</label>
            <input
              id="cruise_destination"
              type="text"
              name="cruise_destination"
              value={cruise.cruise_destination}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="cruise_port">Departure Port</label>
            <input
              id="cruise_port"
              type="text"
              name="cruise_port"
              value={cruise.cruise_port}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="cruise_description">Description</label>
            <textarea
              id="cruise_description"
              name="cruise_description"
              value={cruise.cruise_description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="cruise_image">Cruise Cover Image</label>
            <input
              id="cruise_image"
              type="file"
              accept="image/*"
              onChange={(e) => setCruiseImageFile(e.target.files[0])}
            />
            {cruiseImageUrl && (
              <p>Current Image: <a href={cruiseImageUrl} target="_blank" rel="noreferrer">View File</a></p>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Assign Tags</legend>
          {availableTags.length === 0 ? (
            <p>No tags in database yet.</p>
          ) : (
            <div>
              {availableTags.map((tag) => (
                <label key={tag.id}>
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                  />
                  {tag.tag_name || tag.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend>3. Cabin Tiers & Pricing</legend>
          <button type="button" onClick={addTierField}>
            + Add Tier Class
          </button>

          {tiers.map((tier, index) => (
            <div key={index}>
              <label>
                Name:
                <input
                  type="text"
                  placeholder="e.g. Standard"
                  value={tier.tier_name}
                  onChange={(e) => handleTierChange(index, 'tier_name', e.target.value)}
                  required
                />
              </label>

              <label>
                Slots:
                <input
                  type="number"
                  placeholder="50"
                  value={tier.tier_limit}
                  onChange={(e) => handleTierChange(index, 'tier_limit', e.target.value)}
                  required
                  min="1"
                />
              </label>

              <label>
                Price ($):
                <input
                  type="number"
                  placeholder="499"
                  value={tier.tier_price}
                  onChange={(e) => handleTierChange(index, 'tier_price', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </label>

              <label>
                Tier Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTierImageChange(index, e.target.files[0])}
                />
              </label>
              {tier.tier_image_url && (
                <span> (<a href={tier.tier_image_url} target="_blank" rel="noreferrer">Existing Image</a>)</span>
              )}

              {tiers.length > 1 && (
                <button type="button" onClick={() => removeTierField(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading & Saving...' : isEditMode ? 'Update Cruise' : 'Save Cruise'}
        </button>
      </form>
    </div>
  );
}