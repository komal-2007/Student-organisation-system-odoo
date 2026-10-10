import { useState } from 'react';
import { ArrowLeft, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import PublicImage from './PublicImage';
import { formatMerchandisePrice, merchandise } from '../data/publicMockData';
import { useAuth } from '../../../services/auth/AuthContext';
import { PaymentCheckoutModal } from '../../../components/PaymentCheckoutModal';

function ProductDetail() {
  const { user } = useAuth();
  const { productId } = useParams();
  const product = merchandise.find((item) => item.id === productId);
  const [quantity, setQuantity] = useState('1');
  const [selectedSize, setSelectedSize] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saved, setSaved] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!product) {
    return (
      <div className="page-shell public-dashboard-page">
        <PublicNavbar />
        <main className="container not-found-page">
          <p className="eyebrow">Product not found</p>
          <h1>This item is no longer available.</h1>
          <Link className="skyline-btn primary" to="/merchandise">Browse merchandise</Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const addToCart = (event) => {
    event.preventDefault();
    const requestedQuantity = Number(quantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 5) {
      setFeedback('Choose a quantity between 1 and 5.');
      return;
    }

    if (!selectedSize) {
      setFeedback('Choose a size before checking out this item.');
      return;
    }

    setShowCheckout(true);
  };

  return (
    <div className="page-shell public-dashboard-page">
      <PublicNavbar />
      <main className="container product-detail-page">
        <Link className="back-link" to="/merchandise">
          <ArrowLeft size={16} />
          Back to merchandise
        </Link>

        <div className="product-detail-layout">
          <div className="product-detail__image-wrap">
            <PublicImage src={product.image} alt={product.name} className="product-detail__image" />
          </div>

          <div className="product-detail__content">
            <p className="eyebrow">Club store</p>
            <h1>{product.name}</h1>
            <p className="product-detail__price">{formatMerchandisePrice(product.price)}</p>
            <p className="product-detail__description">{product.description}</p>

            <form className="product-detail__form" onSubmit={addToCart} noValidate>
              <div className="product-detail__selectors">
                <div>
                  <label htmlFor="product-size">Size</label>
                  <select
                    id="product-size"
                    value={selectedSize}
                    onChange={(event) => setSelectedSize(event.target.value)}
                    required
                  >
                    <option value="" disabled>Select a size</option>
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-quantity">Quantity</label>
                  <input
                    id="product-quantity"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="product-detail__actions">
                <button type="submit" className="skyline-btn primary">
                  <ShoppingCart size={16} />
                  Checkout via Sandbox Gateway
                </button>
                <button
                  type="button"
                  className="skyline-btn secondary"
                  onClick={() => {
                    setSaved((previous) => !previous);
                    setFeedback(saved ? 'Removed from your saved items.' : 'Saved in this browser for this visit.');
                  }}
                  aria-pressed={saved}
                >
                  <Plus size={16} />
                  {saved ? 'Saved' : 'Save for later'}
                </button>
              </div>
              {feedback && <p className="action-feedback" role="status">{feedback}</p>}
            </form>

            <div className="product-detail__meta">
              <span className="stock-badge">{product.stock}</span>
              <span>Sizes: {product.sizes.join(', ')}</span>
            </div>

            <div className="demo-callout compact">
              <Sparkles size={16} />
              Skyline Club Store • Connected to Sandbox Payment Gateway.
            </div>
          </div>
        </div>
      </main>
      <PaymentCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        type="merchandise"
        item={product}
        user={user}
        onSuccess={() => {
          setFeedback('Order confirmed and recorded on backend treasury!');
        }}
      />
      <PublicFooter />
    </div>
  );
}

export default ProductDetail;
