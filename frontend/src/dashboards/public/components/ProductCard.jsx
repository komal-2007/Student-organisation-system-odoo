import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicImage from './PublicImage';
import { formatMerchandisePrice } from '../data/publicMockData';

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <PublicImage src={product.image} alt="" loading="lazy" className="product-card__image" />
      <div className="product-card__content">
        <div className="product-card__topline">
          <span className="stock-badge">{product.stock}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <p className="product-price">{formatMerchandisePrice(product.price)}</p>
        <p className="product-sizes">Sizes: {product.sizes.join(', ')}</p>
        <div className="product-card__actions">
          <Link className="skyline-btn secondary" to={`/products/${product.id}`}>
            View Product <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
