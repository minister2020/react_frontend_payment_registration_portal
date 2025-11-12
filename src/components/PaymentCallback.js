import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setError('Payment reference not found');
      setStatus('error');
      return;
    }

    // Verify payment
    verifyPayment(reference)
      .then((response) => {
        if (response.data && (response.data.status === 'SUCCESS' || response.data.status === 'Success')) {
          // Store payment reference in sessionStorage
          sessionStorage.setItem('paymentReference', reference);
          sessionStorage.setItem('paymentVerified', 'true');
          setStatus('success');
          
          // Redirect to registration page after a short delay
          setTimeout(() => {
            navigate('/registration');
          }, 2000);
        } else {
          setError('Payment verification failed. Please contact support if payment was successful.');
          setStatus('error');
        }
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while verifying payment';
        setError(errorMessage);
        setStatus('error');
        console.error(err);
      });
  }, [searchParams, navigate]);

  if (status === 'verifying') {
    return (
      <div className="card">
        <div className="loading">
          <h2>Verifying Payment...</h2>
          <p>Please wait while we verify your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="card">
        <h2>Payment Verification Failed</h2>
        <div className="error-message">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/payment')}
          style={{ marginTop: '20px' }}
        >
          Go Back to Payment
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Payment Successful!</h2>
      <div className="success-message">
        Your payment has been verified successfully. Redirecting to registration form...
      </div>
    </div>
  );
};

export default PaymentCallback;