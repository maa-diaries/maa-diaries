import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, CreditCard, Shield, MapPin, Truck, CheckCircle, Download, Smartphone } from 'lucide-react';

type Step = 'shipping' | 'payment-select' | 'payu-gateway' | 'success';
type PaymentMethod = 'COD' | 'Online';
type OnlineMode = 'UPI' | 'Card' | 'Netbanking';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    checkoutOpen, 
    setCheckoutOpen, 
    placeOrder,
    currentUser,
    loginUser,
    registerUser
  } = useStore();

  const [step, setStep] = useState<Step>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online');
  const [onlineMode, setOnlineMode] = useState<OnlineMode>('UPI');

  // Shipping Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [pincodeError, setPincodeError] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (checkoutOpen) {
      if (currentUser) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
        setAddress(currentUser.addressLine || '');
        setCity(currentUser.city || '');
        setState(currentUser.state || '');
        setPincode(currentUser.pincode || '');
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setCity('');
        setState('');
        setPincode('');
      }
    }
  }, [checkoutOpen, currentUser]);

  // PayU Simulation Fields
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [upiId, setUpiId] = useState('');
  const [upiMethod, setUpiMethod] = useState<'vpa' | 'qr'>('qr');
  const [otpSent, setOtpSent] = useState(false);

  // Check for PayU URL callbacks on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const txnid = params.get('txnid');

    if (paymentStatus) {
      console.log(`PayU callback received. Status: ${paymentStatus}, Transaction ID: ${txnid}`);
      // Clear URL parameters immediately
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      const pendingOrderStr = localStorage.getItem('md_pending_payu_order');
      if (pendingOrderStr) {
        const draft = JSON.parse(pendingOrderStr);
        // Pre-fill the shipping details from draft
        setName(draft.name || '');
        setEmail(draft.email || '');
        setPhone(draft.phone || '');
        setAddress(draft.address || '');
        setCity(draft.city || '');
        setState(draft.state || '');
        setPincode(draft.pincode || '');

        if (paymentStatus === 'success') {
          setProcessing(true);
          setCheckoutOpen(true);
          
          // Place the order
          placeOrder({
            customerName: draft.name,
            customerEmail: draft.email,
            customerPhone: draft.phone,
            addressLine: draft.address,
            city: draft.city,
            state: draft.state,
            pincode: draft.pincode,
            estimatedDelivery: 'within 15 days from ordered date',
            courierPartner: 'Normal Delivery',
            shippingCost: draft.shippingCost
          }, 'Online', 'Paid').then((placedOrder) => {
            setPlacedOrderDetails(placedOrder);
            setStep('success');
            setProcessing(false);
            localStorage.removeItem('md_pending_payu_order');
          }).catch((err) => {
            console.error("Error completing PayU order:", err);
            setProcessing(false);
            setPayuError('Failed to save your order after successful payment. Please contact support.');
            setStep('shipping');
          });
        } else if (paymentStatus === 'failure') {
          setCheckoutOpen(true);
          setStep('shipping');
          setAuthError('Payment failed. Please choose another payment method or try again.');
          localStorage.removeItem('md_pending_payu_order');
        } else if (paymentStatus === 'warning') {
          setCheckoutOpen(true);
          setStep('shipping');
          setAuthError('Payment session warning. Please check your credentials.');
          localStorage.removeItem('md_pending_payu_order');
        }
      }
    }
  }, []);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [payuError, setPayuError] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Dynamic coupon check
  const hasCoupon = subtotal > 999; 
  const discountAmount = hasCoupon ? Math.round(subtotal * 0.1) : 0; // 10% off automatically for > ₹999 items
  const cartTotal = subtotal - discountAmount;
  
  // Free delivery above 1000, otherwise flat standard fee of 99
  const shippingCost = subtotal >= 1000 ? 0 : 99;
  const codFee = paymentMethod === 'COD' ? 50 : 0;
  const grandTotal = cartTotal + shippingCost + codFee;

  // Simple pincode validation
  useEffect(() => {
    if (pincode.length > 0 && pincode.length < 6) {
      setPincodeError('Pincode must be exactly 6 digits');
    } else {
      setPincodeError('');
    }
  }, [pincode]);

  if (!checkoutOpen) return null;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError('');
    setAuthError('');

    if (pincode.length !== 6) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    if (!currentUser) {
      if (!regPassword) {
        setAuthError('Please choose a password to register your account');
        return;
      }
      
      const success = await registerUser({
        name,
        email,
        phone,
        addressLine: address,
        city,
        state,
        pincode,
        password: regPassword
      });

      if (!success) {
        setAuthError('Registration failed. This email or phone might already be in use.');
        return;
      }
    }
    
    setStep('payment-select');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail || !loginPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }
    const success = await loginUser(loginEmail, loginPassword);
    if (!success) {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  const handlePaymentSelectSubmit = async () => {
    if (paymentMethod === 'COD') {
      handlePlaceOrder('Pending');
      return;
    }

    setProcessing(true);
    setPayuError('');
    setAuthError('');
    
    const txnid = 'MD' + Date.now() + Math.floor(Math.random() * 1000);
    
    try {
      const response = await fetch('/api/payu-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnid,
          amount: grandTotal,
          productinfo: cart.map(item => item.product.name).join(', ').substring(0, 100) || 'Maa Diaries Order',
          firstname: name,
          email,
          phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to PayU hash service');
      }

      const resData = await response.json();
      
      if (resData.isMock) {
        // Falling back to Interactive Simulation
        setProcessing(false);
        setStep('payu-gateway');
      } else {
        // Setup pending order details in localStorage
        const orderDraft = {
          txnid,
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          shippingCost: shippingCost + codFee,
          cart,
          paymentMethod
        };
        localStorage.setItem('md_pending_payu_order', JSON.stringify(orderDraft));

        // Create PayU redirect form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = resData.action;

        const fields: Record<string, string> = {
          key: resData.key,
          txnid: resData.txnid,
          amount: resData.amount.toString(),
          productinfo: resData.productinfo,
          firstname: resData.firstname,
          email: resData.email,
          phone: resData.phone,
          surl: resData.surl,
          furl: resData.furl,
          hash: resData.hash
        };

        for (const [fieldName, fieldValue] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = fieldName;
          input.value = fieldValue;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      console.warn("PayU connection check failed, using simulated gateway:", err);
      setProcessing(false);
      setStep('payu-gateway');
    }
  };

  const getDeliveryDateString = () => {
    return 'within 15 days from ordered date';
  };

  const handlePlaceOrder = (status: 'Paid' | 'Pending') => {
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        addressLine: address,
        city,
        state,
        pincode,
        estimatedDelivery: getDeliveryDateString(),
        courierPartner: 'Normal Delivery',
        shippingCost: shippingCost + codFee
      }, paymentMethod, status);

      setPlacedOrderDetails(order);
      setProcessing(false);
      setStep('success');
    }, 1500);
  };

  const handlePayUPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayuError('');

    if (onlineMode === 'UPI') {
      if (upiMethod === 'vpa') {
        if (!upiId.includes('@')) {
          setPayuError('Invalid VPA/UPI ID. Ensure it contains "@"');
          return;
        }
      }
      setProcessing(true);
      // Simulate waiting for mobile notification approval or QR code confirmation
      setTimeout(() => {
        setProcessing(false);
        handlePlaceOrder('Paid');
      }, 2500);
    } else if (onlineMode === 'Card') {
      if (cardNo.replace(/\s/g, '').length !== 16 || cardCvv.length !== 3) {
        setPayuError('Please enter a valid 16-digit Card number and 3-digit CVV');
        return;
      }
      if (!otpSent) {
        setProcessing(true);
        setTimeout(() => {
          setProcessing(false);
          setOtpSent(true);
        }, 1200);
      } else {
        if (otpInput !== '123456') {
          setOtpError('Invalid OTP code. Please enter 123456 for simulator clearance.');
          return;
        }
        handlePlaceOrder('Paid');
      }
    } else if (onlineMode === 'Netbanking') {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        handlePlaceOrder('Paid');
      }, 2000);
    }
  };

  const downloadInvoice = () => {
    if (!placedOrderDetails) return;
    const text = `
========================================
             MAA DIARIES INVOICE        
========================================
Order ID: ${placedOrderDetails.id}
Date: ${new Date(placedOrderDetails.createdAt).toLocaleString('en-IN')}

CUSTOMER SUPPORT DETAILS:
Name: ${placedOrderDetails.customerName}
Email: ${placedOrderDetails.customerEmail}
Phone: ${placedOrderDetails.customerPhone}

SHIPPING LOGISTICS (SHIPROCKET):
Address: ${placedOrderDetails.addressLine},
         ${placedOrderDetails.city}, ${placedOrderDetails.state} - ${placedOrderDetails.pincode}
Carrier: ${placedOrderDetails.courierPartner}
Est. Delivery: ${placedOrderDetails.estimatedDelivery}

ITEMS PURCHASED:
${placedOrderDetails.items.map((it: any, i: number) => {
  return `${i + 1}. ${it.product.name} (Qty: ${it.quantity})
     Anti-Tarnish Plating: 18k Rolled Gold Micro Coating
     Price: ₹ ${it.product.price.toLocaleString('en-IN')}`;
}).join('\n')}

========================================
Subtotal: ₹ ${subtotal.toLocaleString('en-IN')}
Discount applied: -₹ ${discountAmount.toLocaleString('en-IN')}
Shipping & Logistics Fee: ₹ ${placedOrderDetails.shippingCost}
Total Charged Amount: ₹ ${placedOrderDetails.totalAmount.toLocaleString('en-IN')}
Payment Channel: ${placedOrderDetails.paymentMethod}
Payment Status: ${placedOrderDetails.paymentStatus}
========================================
Thank you for supporting Indian local craftsmanship.
For support WhatsApp +91 84482 29528
========================================
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MaaDiaries-Invoice-${placedOrderDetails.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setStep('shipping');
    setPaymentMethod('Online');
    setOnlineMode('UPI');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setCardNo('');
    setCardHolder('');
    setCardExp('');
    setCardCvv('');
    setUpiId('');
    setOtpSent(false);
    setOtpInput('');
    setOtpError('');
    setPayuError('');
    setPlacedOrderDetails(null);
    setCheckoutOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div className="glass checkout-dialog" style={{
        width: '100%',
        maxWidth: '650px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 20px 50px rgba(131, 39, 41, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 300, letterSpacing: '0.05em' }}>
              {step === 'payu-gateway' ? 'PAYU SECURE CHECKOUT' : 'SECURE ORDER GATEWAY'}
            </h3>
            {step !== 'success' && step !== 'payu-gateway' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {step === 'shipping' ? 'Step 1 of 2: Shipping & Logistics' : 'Step 2 of 2: Payment Method'}
              </span>
            )}
            {step === 'payu-gateway' && (
              <span style={{ fontSize: '0.75rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} /> PayU India Verified Merchant
              </span>
            )}
          </div>
          {step !== 'success' && step !== 'payu-gateway' && (
            <button onClick={handleClose} style={{ cursor: 'pointer', color: 'var(--text-primary)', background: 'none', border: 'none' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Contents */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {processing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '20px' }}>
              <div className="luxury-loader" style={{ borderTopColor: 'var(--gold-primary)' }} />
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {step === 'payu-gateway' ? 'Authorizing with Bank Servers...' : 'Generating Order ID...'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Please do not close this window or click back.</p>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: SHIPPING DETAILS */}
              {step === 'shipping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--gold-primary)' }}>
                    <MapPin size={18} />
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>Customer Address (India Delivery Only)</h4>
                  </div>

                  {!currentUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '10px' }}>
                      <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--border-light)',
                        paddingBottom: '8px',
                        gap: '24px'
                      }}>
                        <button
                          type="button"
                          onClick={() => { setAuthTab('register'); setAuthError(''); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: authTab === 'register' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                            fontWeight: authTab === 'register' ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            borderBottom: authTab === 'register' ? '2px solid var(--gold-primary)' : 'none',
                            paddingBottom: '6px'
                          }}
                        >
                          Create New Account & Checkout
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthTab('login'); setAuthError(''); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: authTab === 'login' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                            fontWeight: authTab === 'login' ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            borderBottom: authTab === 'login' ? '2px solid var(--gold-primary)' : 'none',
                            paddingBottom: '6px'
                          }}
                        >
                          Login to Existing Account
                        </button>
                      </div>

                      {authError && (
                        <p style={{ color: '#ff4d4f', fontSize: '0.85rem', margin: 0, padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255, 77, 79, 0.08)' }}>
                          {authError}
                        </p>
                      )}
                    </div>
                  )}

                  {!currentUser && authTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="input-group">
                        <label>Email Address or Phone Number</label>
                        <input
                          type="text"
                          required
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="customer@domain.com or 10-digit phone"
                          style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="input-group">
                        <label>Password</label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '2px', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <button type="submit" className="gold-button" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                        Log In & Continue Checkout
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {currentUser && (
                        <div style={{
                          backgroundColor: 'rgba(46, 204, 113, 0.06)',
                          border: '1px solid rgba(46, 204, 113, 0.2)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          fontSize: '0.82rem',
                          color: '#27ae60',
                          marginTop: '4px',
                          fontWeight: 500
                        }}>
                          Logged in as <strong>{currentUser.name}</strong>. Shipping details pre-filled.
                        </div>
                      )}

                      <div className="form-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                          <label>Contact Name</label>
                          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" />
                        </div>
                        <div className="input-group">
                          <label>10-Digit Mobile</label>
                          <input type="tel" required pattern="[6-9][0-9]{9}" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="84482 29528" />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Email ID</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@domain.com" />
                      </div>

                      {!currentUser && (
                        <div className="input-group">
                          <label>Choose Account Password * (For order tracking & future logins)</label>
                          <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Create a secure password" />
                        </div>
                      )}

                      <div className="input-group">
                        <label>Street Address / House No.</label>
                        <input type="text" required value={address} onChange={e => setAddress(e.target.value)} placeholder="Apt name, block number, street details" />
                      </div>

                      <div className="form-three-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                          <label>City</label>
                          <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                        </div>
                        <div className="input-group">
                          <label>State</label>
                          <input type="text" required value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Delhi" />
                        </div>
                        <div className="input-group">
                          <label>PIN Code</label>
                          <input 
                            type="text" 
                            maxLength={6} 
                            required 
                            value={pincode} 
                            onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} 
                            placeholder="110001" 
                          />
                        </div>
                      </div>
                      {pincodeError && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', margin: 0 }}>{pincodeError}</p>}

                      {/* Clean static Normal Delivery Info Block */}
                      <div style={{
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>Normal Delivery</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                            Ships via Shiprocket. Est. Delivery: <strong>within 15 days from ordered date</strong>
                          </span>
                        </div>
                        <span style={{ fontSize: '0.95rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                          {shippingCost === 0 ? 'FREE' : `₹ ${shippingCost}`}
                        </span>
                      </div>

                      {/* Summary row */}
                      <div style={{ padding: '14px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                          <span>Subtotal ({cart.length} items)</span>
                          <span>₹ {subtotal}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2ecc71' }}>
                            <span>Auto Discount (&gt;₹999)</span>
                            <span>-₹ {discountAmount}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <span>Estimated Total (excl. courier)</span>
                          <span>₹ {cartTotal}</span>
                        </div>
                      </div>

                      <button type="submit" className="gold-button" style={{ width: '100%' }}>
                        Proceed to Payment Options
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 2: CHOOSE PAYMENT METHOD */}
              {step === 'payment-select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 400, marginBottom: '4px' }}>Select Payment Preference</h4>
                  
                  <div className="form-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div 
                      onClick={() => setPaymentMethod('Online')}
                      style={{
                        padding: '24px',
                        borderRadius: '6px',
                        border: paymentMethod === 'Online' ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                        background: paymentMethod === 'Online' ? 'var(--gold-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <CreditCard size={32} style={{ color: 'var(--gold-primary)' }} />
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0 0 4px' }}>PayU Online</h5>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>UPI, Cards, Netbanking</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      style={{
                        padding: '24px',
                        borderRadius: '6px',
                        border: paymentMethod === 'COD' ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                        background: paymentMethod === 'COD' ? 'var(--gold-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <Truck size={32} style={{ color: 'var(--gold-primary)' }} />
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0 0 4px' }}>Cash on Delivery</h5>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>₹50 COD handling fee</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Deck */}
                  <div className="glass" style={{ padding: '16px', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                      <span>Items Total</span>
                      <span>₹ {cartTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                      <span>Logistics Fee (Normal Delivery)</span>
                      <span>₹ {shippingCost}</span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                        <span>COD Service Charge</span>
                        <span>₹ 50</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontWeight: 600, color: 'var(--gold-primary)', fontSize: '0.95rem' }}>
                      <span>Grand Total</span>
                      <span>₹ {grandTotal}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                    <button onClick={() => setStep('shipping')} className="gold-button-outline" style={{ flex: 1 }}>
                      Back
                    </button>
                    <button onClick={handlePaymentSelectSubmit} className="gold-button" style={{ flex: 1 }}>
                      {paymentMethod === 'COD' ? 'Place COD Order' : 'Proceed to PayU'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYU GATEWAY INTERACTIVE SIMULATION */}
              {step === 'payu-gateway' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Gateway details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Merchant:</span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Maa Diaries India</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Amount to Pay:</span>
                      <strong style={{ color: '#2ecc71', fontSize: '1.05rem' }}>₹ {grandTotal}</strong>
                    </div>
                  </div>

                  {/* Payment option selectors */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
                    {['UPI', 'Card', 'Netbanking'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setOnlineMode(mode as OnlineMode); setOtpSent(false); setPayuError(''); }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderBottom: onlineMode === mode ? '2px solid var(--gold-primary)' : '2px solid transparent',
                          color: onlineMode === mode ? 'var(--gold-primary)' : 'var(--text-secondary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.85rem'
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {payuError && <p style={{ color: '#ff4d4f', fontSize: '0.82rem', margin: 0 }}>{payuError}</p>}

                  {/* Form fields */}
                  <form onSubmit={handlePayUPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* UPI Option */}
                    {onlineMode === 'UPI' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-out' }}>
                        {/* QR / VPA Selector */}
                        <div style={{ display: 'flex', gap: '8px', border: '1px solid var(--border-light)', padding: '4px', borderRadius: '4px', background: 'var(--bg-secondary)', marginBottom: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setUpiMethod('qr')}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: 'none',
                              borderRadius: '3px',
                              background: upiMethod === 'qr' ? 'var(--gold-primary)' : 'none',
                              color: upiMethod === 'qr' ? 'white' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: 500,
                              fontSize: '0.8rem'
                            }}
                          >
                            Scan QR Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiMethod('vpa')}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: 'none',
                              borderRadius: '3px',
                              background: upiMethod === 'vpa' ? 'var(--gold-primary)' : 'none',
                              color: upiMethod === 'vpa' ? 'white' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: 500,
                              fontSize: '0.8rem'
                            }}
                          >
                            UPI VPA / ID
                          </button>
                        </div>

                        {/* Scan QR Code Option */}
                        {upiMethod === 'qr' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-light)', animation: 'fadeIn 0.2s ease-out' }}>
                            <div style={{ padding: '10px', background: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <svg width="150" height="150" viewBox="0 0 29 29" style={{ display: 'block' }}>
                                {/* Corner patterns */}
                                <rect x="0" y="0" width="7" height="7" fill="black"/>
                                <rect x="1" y="1" width="5" height="5" fill="white"/>
                                <rect x="2" y="2" width="3" height="3" fill="black"/>
                                
                                <rect x="22" y="0" width="7" height="7" fill="black"/>
                                <rect x="23" y="1" width="5" height="5" fill="white"/>
                                <rect x="24" y="2" width="3" height="3" fill="black"/>
                                
                                <rect x="0" y="22" width="7" height="7" fill="black"/>
                                <rect x="1" y="23" width="5" height="5" fill="white"/>
                                <rect x="2" y="24" width="3" height="3" fill="black"/>
                                
                                {/* Alignment pattern */}
                                <rect x="20" y="20" width="5" height="5" fill="black"/>
                                <rect x="21" y="21" width="3" height="3" fill="white"/>
                                <rect x="22" y="22" width="1" height="1" fill="black"/>
                                
                                {/* Random modules */}
                                <rect x="9" y="1" width="1" height="2" fill="black"/>
                                <rect x="11" y="0" width="2" height="1" fill="black"/>
                                <rect x="15" y="2" width="1" height="3" fill="black"/>
                                <rect x="18" y="1" width="3" height="1" fill="black"/>
                                
                                <rect x="8" y="5" width="2" height="2" fill="black"/>
                                <rect x="12" y="6" width="3" height="1" fill="black"/>
                                <rect x="17" y="5" width="1" height="4" fill="black"/>
                                
                                <rect x="1" y="9" width="3" height="1" fill="black"/>
                                <rect x="5" y="8" width="1" height="3" fill="black"/>
                                <rect x="9" y="9" width="4" height="2" fill="black"/>
                                <rect x="15" y="10" width="2" height="1" fill="black"/>
                                <rect x="20" y="9" width="3" height="2" fill="black"/>
                                <rect x="25" y="8" width="2" height="1" fill="black"/>
                                
                                <rect x="3" y="13" width="2" height="2" fill="black"/>
                                <rect x="7" y="14" width="4" height="1" fill="black"/>
                                <rect x="13" y="12" width="2" height="3" fill="black"/>
                                <rect x="17" y="14" width="3" height="2" fill="black"/>
                                <rect x="22" y="13" width="1" height="3" fill="black"/>
                                <rect x="26" y="14" width="2" height="2" fill="black"/>
                                
                                <rect x="0" y="18" width="4" height="1" fill="black"/>
                                <rect x="6" y="17" width="1" height="3" fill="black"/>
                                <rect x="9" y="19" width="3" height="1" fill="black"/>
                                <rect x="14" y="17" width="2" height="2" fill="black"/>
                                <rect x="18" y="19" width="4" height="1" fill="black"/>
                                
                                <rect x="8" y="23" width="2" height="1" fill="black"/>
                                <rect x="12" y="24" width="1" height="3" fill="black"/>
                                <rect x="15" y="22" width="3" height="2" fill="black"/>
                                <rect x="26" y="23" width="1" height="3" fill="black"/>
                                
                                <rect x="9" y="27" width="3" height="1" fill="black"/>
                                <rect x="14" y="26" width="4" height="2" fill="black"/>
                                <rect x="24" y="27" width="2" height="1" fill="black"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 500 }}>
                              Scan QR using GPay, PhonePe, Paytm or any UPI app
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                              Simulate scanning this QR to pay <strong>₹ {grandTotal}</strong> instantly.
                            </span>
                          </div>
                        )}

                        {/* UPI VPA ID Option */}
                        {upiMethod === 'vpa' && (
                          <>
                            <div className="input-group">
                              <label>Virtual Payment Address (VPA / UPI ID)</label>
                              <input 
                                type="text" 
                                required={upiMethod === 'vpa'} 
                                placeholder="e.g. name@okhdfcbank"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                              />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                              * Ensure your UPI app is active on your phone to accept the simulated request.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Card Option */}
                    {onlineMode === 'Card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-out' }}>
                        {!otpSent ? (
                          <>
                            <div className="input-group">
                              <label>Card Number</label>
                              <input 
                                type="text" 
                                maxLength={19} 
                                required 
                                placeholder="4321 5678 9012 3456"
                                value={cardNo}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                  setCardNo(formatted);
                                }}
                              />
                            </div>
                            <div className="input-group">
                              <label>Cardholder Name</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Enter owner name"
                                value={cardHolder}
                                onChange={e => setCardHolder(e.target.value)}
                              />
                            </div>
                            <div className="form-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div className="input-group">
                                <label>Expiry Date</label>
                                <input 
                                  type="text" 
                                  maxLength={5} 
                                  required 
                                  placeholder="MM/YY" 
                                  value={cardExp}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length >= 2) setCardExp(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
                                    else setCardExp(val);
                                  }}
                                />
                              </div>
                              <div className="input-group">
                                <label>CVV</label>
                                <input 
                                  type="password" 
                                  maxLength={3} 
                                  required 
                                  placeholder="123" 
                                  value={cardCvv}
                                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: '4px', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '10px', color: 'var(--gold-primary)' }}><Smartphone size={20} /> <span style={{ fontWeight: 600 }}>OTP Verified Checkout</span></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                              An SMS with a 6-digit OTP code has been simulated to your registered mobile. Please type <strong style={{ color: 'var(--text-primary)' }}>123456</strong> below to confirm checkout clearance.
                            </p>
                            <div className="input-group" style={{ marginTop: '8px' }}>
                              <label>Enter OTP Code</label>
                              <input 
                                type="text" 
                                maxLength={6} 
                                required 
                                placeholder="Enter code" 
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                              />
                            </div>
                            {otpError && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', margin: 0 }}>{otpError}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Netbanking Option */}
                    {onlineMode === 'Netbanking' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="input-group">
                          <label>Select Bank Partner</label>
                          <select 
                            value={selectedBank} 
                            onChange={e => setSelectedBank(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '4px' }}
                          >
                            <option value="HDFC">HDFC Bank</option>
                            <option value="ICICI">ICICI Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="AXIS">Axis Bank</option>
                            <option value="KOTAK">Kotak Mahindra Bank</option>
                          </select>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                          * Clicking pay will redirect to the secure bank portal simulation.
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (otpSent) setOtpSent(false);
                          else setStep('payment-select');
                        }} 
                        className="gold-button-outline" 
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="gold-button" style={{ flex: 1 }}>
                        {onlineMode === 'Card' && !otpSent 
                          ? 'Send OTP Request' 
                          : (onlineMode === 'UPI' && upiMethod === 'qr' ? 'I have Scanned & Paid' : `Pay ₹ ${grandTotal}`)}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* STEP 4: ORDER SUCCESS */}
              {step === 'success' && placedOrderDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0', textAlign: 'center' }}>
                  <CheckCircle size={60} style={{ color: '#2ecc71' }} />
                  <div>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0 0 8px', fontWeight: 300 }}>Order Confirmed!</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Maa Diaries parcel is preparing. Order ID: <strong style={{ color: 'var(--text-primary)' }}>{placedOrderDetails.id}</strong>
                    </p>
                  </div>

                  {/* Delivery Summary Card */}
                  <div style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Logistics Partner</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{placedOrderDetails.courierPartner}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Estimated Delivery</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{placedOrderDetails.estimatedDelivery}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Courier Shipping Charge</span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹ {placedOrderDetails.shippingCost}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Grand Total Paid</span>
                      <strong style={{ color: 'var(--gold-primary)', fontSize: '0.95rem' }}>₹ {placedOrderDetails.totalAmount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Payment Mode</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{placedOrderDetails.paymentMethod} ({placedOrderDetails.paymentStatus})</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '10px' }}>
                    <button 
                      onClick={downloadInvoice}
                      className="gold-button-outline"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Download size={16} /> Invoice Receipt
                    </button>
                    <button onClick={handleClose} className="gold-button" style={{ flex: 1 }}>
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-group label {
          font-size: 0.72rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .input-group input {
          width: 100%;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          padding: 10px 14px;
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .input-group input:focus {
          border-color: var(--gold-primary);
        }
        .luxury-loader {
          width: 48px;
          height: 48px;
          border: 3px dashed var(--gold-primary);
          border-radius: 50%;
          animation: spin 1.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
