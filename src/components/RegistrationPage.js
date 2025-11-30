import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getZones, createRegistration, getRegistrationsByPayment,validatePaymentReference } from '../services/api';

const RegistrationPage = () => {
  const [zones, setZones] = useState([]);
  const [currentRegistrant, setCurrentRegistrant] = useState(1);
  const [numberOfRegistrants, setNumberOfRegistrants] = useState(1);
  const [paymentReference, setPaymentReference] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittedRegistrations, setSubmittedRegistrations] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstTimeAttendingCamp:'',
    registrationType: '',
    childName: '',
    age: '',
    tcCenter: '',
    zoneId: '',
    address: '',
    parentName: '',
    parentPhone: '',
    allergy: '',
    consentGiven: false,

  });

  useEffect(() => {
    // Get data from sessionStorage
    const ref = sessionStorage.getItem('paymentReference');
    const numRegistrants = sessionStorage.getItem('numberOfRegistrants');
    const zoneId = sessionStorage.getItem('selectedZoneId');
    const paymentVerified = sessionStorage.getItem('paymentVerified');

    if (!ref || !paymentVerified) {
      navigate('/');
      return;
    }

        // 💥 NEW VALIDATION HERE
    validatePaymentReference(ref)
      .then(() => {
        // Continue only if valid
        setPaymentReference(ref);
        setNumberOfRegistrants(parseInt(numRegistrants) || 1);
        setSelectedZoneId(zoneId || '');
        setFormData(prev => ({ ...prev, zoneId: zoneId || '' }));

        // Load zones
        getZones()
          .then(response => setZones(response.data))
          .catch(err => {
            setError('Failed to load zones');
            console.error(err);
          });

        // Load previously submitted registrations
        loadSubmittedRegistrations(ref);
      })
      .catch(() => {
        alert("Payment reference is invalid or already used.");
        sessionStorage.clear();
        navigate('/');
      });
  }, [navigate]);


  const loadSubmittedRegistrations = async (ref) => {
    try {
      const response = await getRegistrationsByPayment(ref);
      setSubmittedRegistrations(response.data || []);
      setCurrentRegistrant(response.data.length + 1);
    } catch (err) {
      console.error('Failed to load submitted registrations', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstTimeAttendingCamp) {
    setError('Please select if this is your first time attending camp');
    return false;
    }
    if (!formData.registrationType) {
    setError('Please select your registration type');
    return false;
    }
    if (!formData.childName.trim()) {
      setError('Child name is required');
      return false;
    }
    if (!formData.age || parseInt(formData.age) < 1) {
      setError('Age is required and must be at least 1');
      return false;
    }
    if (!formData.tcCenter.trim()) {
      setError('TC center is required');
      return false;
    }
    if (!formData.zoneId) {
      setError('Zone is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.parentName.trim()) {
      setError('Parent name is required');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      setError('Parent phone number is required');
      return false;
    }
    if (!formData.allergy.trim()) {
      setError('Allergy information is required');
      return false;
    }
    if (!formData.consentGiven) {
     setError('You must agree to the parent/guardian consent to continue.');
     return false;
   }
    return true;
   };
  

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Submit the current registrant to backend
    await createRegistration({
      ...formData,
      age: parseInt(formData.age),
      zoneId: parseInt(formData.zoneId),
      paymentReference,
    });

    // Add this registrant to the frontend list
    const newSubmitted = [...submittedRegistrations, formData];
    setSubmittedRegistrations(newSubmitted);

    // Success message
    setSuccess(`Registration ${currentRegistrant} submitted successfully!`);

    // Reset form for next registrant if any remaining
    if (currentRegistrant < numberOfRegistrants) {
      setFormData({
        firstTimeAttendingCamp: '',
        registrationType: '',
        childName: '',
        age: '',
        tcCenter: '',
        zoneId: selectedZoneId,
        address: '',
        parentName: '',
        parentPhone: '',
        allergy: '',
        consentGiven: false,

      });
      setCurrentRegistrant((prev) => prev + 1);
    } else {
      // All registrants submitted
      setSuccess('All registrations completed successfully! A confirmation email has been sent.');
      setTimeout(() => {
        sessionStorage.clear();
        navigate('/');
      }, 5000);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to submit registration. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="card">
      <h1>Registration Form</h1>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
        Registrant {currentRegistrant} of {numberOfRegistrants}
      </p>

      {submittedRegistrations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Submitted Registrations: {submittedRegistrations.length}</h3>
        </div>
      )}

      <form onSubmit={handleSubmit}>
              <div className="form-group">
        <label htmlFor="firstTimeAttendingCamp">First Time Attending Camp?</label>
        <select
          id="firstTimeAttendingCamp"
          name="firstTimeAttendingCamp"
          value={formData.firstTimeAttendingCamp}
          onChange={(e) => setFormData({ ...formData, firstTimeAttendingCamp: e.target.value })}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

        <div className="form-group">
        <label htmlFor="registrationType">Registration Type?</label>
        <select
          id="registrationType"
          name="registrationType"
          value={formData.registrationType}
          onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
        >
          <option value="">Select</option>
          <option value="DELEGATE">DELEGATE</option>
          <option value="OFFICIAL">OFFICIAL</option>
        </select>
      </div>

        <div className="form-group">
          <label htmlFor="childName">Child Name *</label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={handleInputChange}
            placeholder="Enter child's full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age *</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter age"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tcCenter">Training Center *</label>
          <select
            id="tcCenter"
            name="tcCenter"
            value={formData.tcCenter}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Training Center</option>
            <option value="Bajulaiye TC">Bajulaiye TC</option>
            <option value="Gbagada TC">Gbagada TC</option>
            <option value="Oworo TC">Oworo TC</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="zoneId">Zone *</label>
          <select
            id="zoneId"
            name="zoneId"
            value={formData.zoneId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter full address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="parentName">Parent Name *</label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={handleInputChange}
            placeholder="Enter parent's full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="parentPhone">Parent Phone Number *</label>
          <input
            type="tel"
            id="parentPhone"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleInputChange}
            placeholder="Enter parent's phone number"
            required
          />
        </div>

        <div className="form-group">
            <label htmlFor="allergy">Allergy *</label>
            <input
              type="text"
              id="allergy"
              name="allergy"
              value={formData.allergy}
              onChange={handleInputChange}
              placeholder="Enter allergy information (or 'None' if no allergies)"
              required
            />
          </div>
        <div className="form-group" style={{ marginTop: '20px' }}>
  <h3>Parent/Guardian Consent</h3>
  <p>
    I give consent for my child/ward to attend the TYMa Akoka Zone Children's camp, 
    and I understand that the organizers will take reasonable steps to ensure 
    their safety and wellbeing.
  </p>

  <label 
    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
  >
    <input
      type="checkbox"
      name="consentGiven"
      checked={formData.consentGiven}
      onChange={(e) =>
        setFormData({ ...formData, consentGiven: e.target.checked })
      }
      style={{ width: '16px', height: '16px' }} // optional: adjust size
    />
    <span>I agree</span>
  </label>
</div>



        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || currentRegistrant > numberOfRegistrants}
        >
          {loading
            ? 'Submitting...'
            : currentRegistrant <= numberOfRegistrants
            ? `Submit Registration ${currentRegistrant}`
            : 'All Registrations Completed'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;