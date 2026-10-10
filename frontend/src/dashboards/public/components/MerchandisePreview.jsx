import { merchandise } from '../data/publicMockData';
import ProductCard from './ProductCard';

function MerchandisePreview() {
  return (
    <div className="public-card-grid merchandise-grid">
      {merchandise.slice(0, 3).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default MerchandisePreview;
