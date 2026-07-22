import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft, Truck, MapPin, CheckCircle, Package, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, selectedOrderId, setSelectedOrderId, submitInquiry, currentUser, cancelOrder } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');

  // Filter orders to only show the current user's orders (admin sees all)
  const userOrders = currentUser
    ? orders.filter(order => {
        const isAdmin = currentUser.email === 'admin@maadiaries.com';
        if (isAdmin) return true;
        return order.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
          || order.customerPhone === currentUser.phone;
      })
    : [];

  // Feedback Form states
  const [selectedFeedbackOrder, setSelectedFeedbackOrder] = useState<any | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedbackOrder || !feedbackMessage.trim()) return;

    setFeedbackLoading(true);
    try {
      await submitInquiry({
        name: selectedFeedbackOrder.customerName,
        email: selectedFeedbackOrder.customerEmail,
        phone: selectedFeedbackOrder.customerPhone,
        message: feedbackMessage,
        orderId: selectedFeedbackOrder.id
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setSelectedFeedbackOrder(null);
        setFeedbackSubmitted(false);
        setFeedbackMessage('');
      }, 3000);
    } catch (err) {
      console.error("Order feedback submit error:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Sync expanded order with the selected tracking order from My Account
  useEffect(() => {
    if (selectedOrderId) {
      setExpandedOrderId(selectedOrderId);
      // Reset after opening so it doesn't force re-expansion on other page changes
      setSelectedOrderId(null);
    }
  }, [selectedOrderId, setSelectedOrderId]);

  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: 'Pending', label: 'Order Confirmed', desc: 'Seller has accepted your order', icon: CheckCircle },
      { key: 'Processing', label: 'Packed & Quality Checked', desc: 'Handed over to Shiprocket partners', icon: Package },
      { key: 'Shipped', label: 'In Transit', desc: 'On its way to local logistics center', icon: Truck },
      { key: 'Delivered', label: 'Out for Delivery / Delivered', desc: 'Arrived at your doorstep', icon: MapPin }
    ];

    let currentStepIndex = 0;
    if (status === 'Shipped') currentStepIndex = 2;
    if (status === 'Delivered') currentStepIndex = 3;
    if (status === 'Cancelled') currentStepIndex = -1;

    return { steps, currentStepIndex };
  };

  const handleToggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  return (
    <div className="page-shell" style={{ maxWidth: '900px', margin: '64px auto 60px', padding: '0 24px', minHeight: '80vh' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '32px',
          background: 'none',
          border: 'none'
        }}
        className="back-btn"
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      {/* Header */}
      <div className="orders-hero" style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Customer Workspace
        </span>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontWeight: 300, margin: 0 }}>
          Your Orders
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          View, manage, and view live delivery status of your premium jewelry orders.
        </p>
      </div>

      <div className="orders-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <div><span>Orders placed</span><strong>{userOrders.length}</strong></div>
        <div><span>On the way</span><strong>{userOrders.filter(order => order.status === 'Shipped' || order.status === 'Pending' || order.status === 'Confirmed').length}</strong></div>
        <div><span>Delivered</span><strong>{userOrders.filter(order => order.status === 'Delivered').length}</strong></div>
        <div><span>Cancelled</span><strong style={{ color: '#e74c3c' }}>{userOrders.filter(order => order.status === 'Cancelled').length}</strong></div>
      </div>

      {userOrders.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={36} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 400, margin: '0 0 8px 0' }}>No Orders Placed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '360px', lineHeight: 1.5 }}>
            You haven't made any purchases yet. Click below to explore our luxury collections.
          </p>
          <button onClick={() => navigate('/shop')} className="gold-button" style={{ padding: '10px 28px' }}>
            Browse Collections
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '8px' }}>
            {(['All', 'Active', 'Delivered', 'Cancelled'] as const).map(pill => (
              <button
                key={pill}
                onClick={() => setStatusFilter(pill)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === pill ? 'var(--gold-primary)' : 'var(--border-light)',
                  backgroundColor: statusFilter === pill ? 'var(--gold-primary)' : 'transparent',
                  color: statusFilter === pill ? '#ffffff' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  transition: 'var(--transition-fast)'
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {(() => {
            const filtered = userOrders.filter(order => {
              if (statusFilter === 'All') return true;
              if (statusFilter === 'Active') return order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Shipped';
              if (statusFilter === 'Delivered') return order.status === 'Delivered';
              if (statusFilter === 'Cancelled') return order.status === 'Cancelled';
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="glass" style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                    No {statusFilter.toLowerCase()} orders found.
                  </p>
                </div>
              );
            }

            return (
              <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filtered.map(order => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id} 
                className="glass order-card"
                style={{ 
                  border: isExpanded ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Order Header Summary */}
                <div 
                  onClick={() => handleToggleExpand(order.id)}
                  style={{ 
                    padding: '20px 24px', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    backgroundColor: isExpanded ? 'rgba(191, 165, 117, 0.03)' : 'transparent',
                    userSelect: 'none'
                  }}
                >
                  {/* Top row: meta + status badge + chevron */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Order reference</span>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', margin: '2px 0 0 0', fontWeight: 500 }}>{order.id}</h4>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Order Date</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Amount</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Status Badge */}
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '2px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: order.status === 'Delivered' ? 'rgba(46, 204, 113, 0.1)' : order.status === 'Cancelled' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                        color: order.status === 'Delivered' ? '#2ecc71' : order.status === 'Cancelled' ? '#e74c3c' : '#b38600',
                        border: `1px solid ${order.status === 'Delivered' ? '#2ecc71' : order.status === 'Cancelled' ? '#e74c3c' : 'rgba(241, 196, 15, 0.4)'}`
                      }}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  </div>

                  {/* Product thumbnail strip (always visible) */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {order.items.slice(0, 5).map((item: any, idx: number) => (
                      <div key={idx} style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1.5px solid var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <img
                          src={item.product.images?.[0] || item.product.image}
                          alt={item.product.name}
                          title={item.product.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        {item.quantity > 1 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '3px',
                            background: 'var(--gold-primary)',
                            color: '#fff',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            padding: '0px 4px',
                            lineHeight: '14px'
                          }}>
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px dashed var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}>
                        +{order.items.length - 5}
                      </div>
                    )}
                    <div style={{ marginLeft: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {isExpanded ? 'Click to collapse' : 'Click to view full details'}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{ 
                    padding: '0 24px 24px 24px', 
                    borderTop: '1px solid var(--border-light)',
                    animation: 'slideDown 0.3s ease-out',
                    backgroundColor: 'rgba(255,255,255,0.01)'
                  }}>
                    
                    {/* Grid containing tracking timeline and order details */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '40px',
                      paddingTop: '24px'
                    }}>
                      
                      {/* Left: Shipping Status Timeline */}
                      <div>
                        <h5 style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: 600 }}>
                          Shiprocket Live Status
                        </h5>

                        {order.status === 'Cancelled' ? (
                          <div style={{ textAlign: 'center', padding: '30px 16px', border: '1px dashed #e74c3c', borderRadius: '8px', backgroundColor: 'rgba(231, 76, 60, 0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <XCircle size={32} style={{ color: '#e74c3c' }} />
                            <div>
                              <h4 style={{ color: '#e74c3c', fontSize: '1.02rem', marginBottom: '6px', fontWeight: 600 }}>Order Cancelled</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>Refund will be processed back to original pay mode in 3-5 working days.</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', left: '17px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-light)', zIndex: 1 }} />
                            
                            {getTimelineSteps(order.status).steps.map((step, index) => {
                              const isCompleted = index <= getTimelineSteps(order.status).currentStepIndex;
                              const isActive = index === getTimelineSteps(order.status).currentStepIndex;
                              const StepIcon = step.icon;

                              return (
                                <div key={step.key} style={{ display: 'flex', gap: '16px', zIndex: 2 }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: isCompleted ? 'var(--gold-primary)' : 'var(--bg-tertiary)',
                                    border: isActive ? '3px solid var(--bg-secondary)' : '1px solid var(--border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isCompleted ? '#fff' : 'var(--text-muted)',
                                    boxShadow: isActive ? '0 0 12px var(--gold-glow)' : 'none',
                                    transition: 'all 0.3s ease',
                                    flexShrink: 0
                                  }}>
                                    <StepIcon size={16} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <h6 style={{ fontSize: '0.9rem', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, margin: '2px 0 0 0' }}>
                                      {step.label}
                                    </h6>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Logistics details & Invoice */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Courier summary */}
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Logistics Partner</h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Carrier:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{order.courierPartner}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Est. Delivery:</span>
                            <strong style={{ color: 'var(--gold-primary)' }}>{order.estimatedDelivery}</strong>
                          </div>
                        </div>

                        {/* Items detail list */}
                        <div>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Items Ordered</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} style={{
                                display: 'flex',
                                gap: '14px',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: 'var(--bg-primary)',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)'
                              }}>
                                {/* Product Image */}
                                <div style={{
                                  width: '72px',
                                  height: '72px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  backgroundColor: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-light)'
                                }}>
                                   <img
                                     src={item.product.images?.[0] || item.product.image}
                                     alt={item.product.name}
                                     loading="lazy"
                                     style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
                                    }}
                                  />
                                </div>

                                {/* Product Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{
                                    color: 'var(--text-primary)',
                                    fontWeight: 500,
                                    fontSize: '0.88rem',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {item.product.name}
                                  </span>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    display: 'block',
                                    marginTop: '3px'
                                  }}>
                                    {[item.selectedMetal, item.selectedStone].filter(Boolean).join(' · ')}
                                  </span>
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px'
                                  }}>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--text-secondary)',
                                      background: 'var(--bg-secondary)',
                                      padding: '2px 8px',
                                      borderRadius: '20px',
                                      border: '1px solid var(--border-light)'
                                    }}>
                                      Qty: {item.quantity}
                                    </span>
                                    <span style={{
                                      color: 'var(--gold-primary)',
                                      fontWeight: 600,
                                      fontSize: '0.9rem'
                                    }}>
                                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>


                        {/* Payment / Totals */}
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{order.paymentMethod} ({order.paymentStatus})</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600, color: 'var(--gold-primary)', marginTop: '4px' }}>
                            <span>Grand Total:</span>
                            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                          
                          {order.status === 'Delivered' && (
                            <button
                              onClick={() => {
                                setSelectedFeedbackOrder(order);
                                setFeedbackMessage('');
                                setFeedbackSubmitted(false);
                              }}
                              className="gold-button-outline"
                              style={{ width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '16px' }}
                            >
                              Give Feedback on this Order
                            </button>
                          )}
                          {(order.status === 'Pending' || order.status === 'Confirmed') && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                  await cancelOrder(order.id);
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '0.8rem',
                                marginTop: '16px',
                                background: 'none',
                                border: '1px solid #e74c3c',
                                borderRadius: '6px',
                                color: '#e74c3c',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    })()}
      </div>
    )}

      {/* Feedback Overlay Modal */}
      {selectedFeedbackOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 7, 8, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div className="glass animate-slide-up" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '32px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedFeedbackOrder(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Give Feedback on Order #{selectedFeedbackOrder.id}
            </h3>

            {feedbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span style={{ fontSize: '2.5rem', color: 'var(--gold-primary)' }}>✓</span>
                <h4 style={{ color: 'var(--text-primary)', margin: '12px 0 6px' }}>Feedback Sent!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Thank you for your feedback. We are committed to making your jewelry shopping experience premium and delightful.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                  <strong>Reviewer Contact:</strong> {selectedFeedbackOrder.customerName} ({selectedFeedbackOrder.customerEmail})
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Your Message / Experience:
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about the delivery speed, packaging condition, or product expectations..."
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="gold-button"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {feedbackLoading ? 'Submitting Feedback...' : 'Send Feedback to Owner'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Slide down animation for smooth expand */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};
