import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getZones, initializePayment } from '../services/api';

const PaymentPage = () => {
  const [zones, setZones] = useState([]);
  const [numberOfRegistrants, setNumberOfRegistrants] = useState(1);
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/');
      return;
    }
    setEmail(userEmail);

    // Fetch zones
    getZones()
      .then((response) => {
        setZones(response.data.data || response.data);
        if (response.data.length > 0) {
          setSelectedZone(response.data[0].id.toString());
        }
      })
      .catch((err) => {
        setError('Failed to load zones. Please try again.');
        console.error(err);
      });
  }, [navigate]);

  const calculateTotal = () => {
    if (!selectedZone) return 0;
    const zone = zones.find((z) => z.id.toString() === selectedZone);
    return zone ? zone.amountPerRegistrant * numberOfRegistrants : 0;
  };

  const handleProceedToPayment = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!selectedZone) {
    setError('Please select a zone');
    setLoading(false);
    return;
  }

  try {
    const response = await initializePayment({
      email: email,
      numberOfRegistrants: numberOfRegistrants,
      zoneId: parseInt(selectedZone),
    });

    console.log('Payment response:', response.data); // debug

    // Safely extract keys from the response
    const { status, data, reference, authorizationUrl, authorization_url } = response.data;

    // Determine the payment reference and URL
    const paymentReference = reference || data?.reference;
    const paymentUrl = authorizationUrl || data?.authorizationUrl || authorization_url || data?.authorization_url;

    if (status && paymentReference && paymentUrl) {
      // Store needed data in sessionStorage
      sessionStorage.setItem('paymentReference', paymentReference);
      sessionStorage.setItem('numberOfRegistrants', numberOfRegistrants.toString());
      sessionStorage.setItem('selectedZoneId', selectedZone);

      // Redirect to payment page
      window.location.href = paymentUrl;
    } else {
      console.error('Payment initialization failed. Response:', response.data);
      setError('Failed to initialize payment. Please try again.');
    }
  } catch (err) {
    console.error('Payment error:', err);
    setError('An error occurred while processing payment. Please try again.');
  } finally {
    setLoading(false);
  }
};


// const handleProceedToPayment = async (e) => {
//   e.preventDefault();
//   setError('');
//   setLoading(true);

//   if (!selectedZone) {
//     setError('Please select a zone');
//     setLoading(false);
//     return;
//   }

//   try {
//     const response = await initializePayment({
//       email: email,
//       numberOfRegistrants: numberOfRegistrants,
//       zoneId: parseInt(selectedZone),
//     });

//     console.log('Payment response:', response.data); // debug

//     // Safely extract keys from the response
//     const { status, data, reference, authorizationUrl, authorization_url } = response.data;

//     // Determine the payment reference and URL
//     const paymentReference = reference || data?.reference;
//     const paymentUrl = authorizationUrl || data?.authorizationUrl || authorization_url || data?.authorization_url;

//     if (status && paymentReference && paymentUrl) {
//       // Store needed data in sessionStorage
//       sessionStorage.setItem('paymentReference', paymentReference);
//       sessionStorage.setItem('numberOfRegistrants', numberOfRegistrants.toString());
//       sessionStorage.setItem('selectedZoneId', selectedZone);

//       // Redirect to payment page
//       window.location.href = paymentUrl;
//     } else {
//       console.error('Payment initialization failed. Response:', response.data);
//       setError('Failed to initialize payment. Please try again.');
//     }
//   } catch (err) {
//     console.error('Payment error:', err);
//     setError('An error occurred while processing payment. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };


  const selectedZoneData = zones.find((z) => z.id.toString() === selectedZone);

  return (
    <div className="card">
      <h1>Registration Payment</h1>
      <form onSubmit={handleProceedToPayment}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            style={{ background: '#f5f5f5' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="numberOfRegistrants">Number of Registrants *</label>
          <select
            id="numberOfRegistrants"
            value={numberOfRegistrants}
            onChange={(e) => setNumberOfRegistrants(parseInt(e.target.value))}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="zone">Zone *</label>
          <select
            id="zone"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
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

        {selectedZoneData && (
          <div className="payment-info">
            <p><strong>Amount per registrant:</strong> ₦{selectedZoneData.amountPerRegistrant.toLocaleString()}</p>
            <p><strong>Number of registrants:</strong> {numberOfRegistrants}</p>
            <p><strong>Total amount:</strong> ₦{calculateTotal().toLocaleString()}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !selectedZone}
        >
          {loading ? 'Processing...' : 'Proceed to Make Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;





