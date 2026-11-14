'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../lib/api';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import AuthRequired from '../components/AuthRequired';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  children: Category[];
};

export default function Products() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant: 'success' | 'error';
  }>({
    open: false,
    message: '',
    variant: 'success',
  });

  // Filters
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Expanded category IDs
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setAuthMessage('');
        setError('');

        const params = new URLSearchParams({
          page: String(page),
        });

        if (appliedSearch.trim()) {
          params.set('search', appliedSearch.trim());
        }

        if (category) {
          params.set('category', category);
        }

        if (appliedMinPrice) {
          params.set('min_price', appliedMinPrice);
        }

        if (appliedMaxPrice) {
          params.set('max_price', appliedMaxPrice);
        }

        const res = await apiRequest<{
          products: Product[];
          count: number;
          search_count: number | null;
          category_counts: Record<string, number>;
          has_next: boolean;
          has_prev: boolean;
        }>(`/products?${params.toString()}`);

        setProducts(res.products ?? []);
        setProductCount(res.count ?? null);
        setSearchCount(res.search_count ?? null);
        setCategoryCounts(res.category_counts ?? {});
        setHasNext(Boolean(res.has_next));
        setHasPrev(Boolean(res.has_prev));
      } catch (err) {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          setProducts([]);
          return;
        }

        setError(getErrorMessage(err, 'Failed to load products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [appliedSearch, appliedMaxPrice, appliedMinPrice, category, page]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiRequest<Category[]>('/categories');
        setCategories(res);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = () => {
    setError('');
    setPage(1);
    setAppliedSearch(search);
  };

  const handlePriceFilter = () => {
    if (
      minPrice &&
      maxPrice &&
      Number.parseFloat(minPrice) > Number.parseFloat(maxPrice)
    ) {
      setError('Minimum price cannot be greater than maximum price.');
      return;
    }

    setError('');
    setPage(1);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const addToCart = async (productId: number) => {
    try {
      setError('');
      setAddingProductId(productId);

      await apiRequest('/cart', 'POST', {
        product_id: productId,
        quantity: 1,
      });

      setToast({
        open: true,
        message: 'Item added to your cart.',
        variant: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: getErrorMessage(err, 'Failed to add to cart'),
        variant: 'error',
      });
    } finally {
      setAddingProductId(null);
    }
  };

  // Calculate category count including descendants
  const getCategoryCount = (cat: Category): number => {
    const ownCount = categoryCounts[String(cat.id)] ?? 0;

    return (
      ownCount +
      (cat.children ?? []).reduce(
        (total, child) => total + getCategoryCount(child),
        0
      )
    );
  };

  // Expand or collapse a category
  const toggleCategory = (id: number) => {
    setExpandedCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // Recursive category rendering
  const renderCategory = (cat: Category, depth = 0): ReactNode => {
    const hasChildren = (cat.children ?? []).length > 0;
    const isExpanded = expandedCategories.includes(cat.id);
    const isSelected = category === String(cat.id);

    return (
      <div key={cat.id}>
        <div
          className={`category-row ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="expand-button"
              onClick={() => toggleCategory(cat.id)}
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? '⌄' : '›'}
            </button>
          ) : (
            <span className="expand-placeholder" />
          )}

          <button
            type="button"
            className="category-name"
            onClick={() => {
              setCategory(String(cat.id));
              setPage(1);
            }}
          >
            {cat.name}
          </button>

          <span className="category-count">
            {getCategoryCount(cat).toLocaleString()}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {cat.children.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (authMessage) return <AuthRequired message={authMessage} />;

  return (
    <div className="page-container">
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        actionLabel={toast.variant === 'success' ? 'View cart' : undefined}
        onAction={
          toast.variant === 'success' ? () => router.push('/cart') : undefined
        }
      />

      {/* Main layout */}
      <div className="shop-layout">
        {/* Category sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">Categories</h3>

          <button
            type="button"
            className={`all-category ${category === '' ? 'selected' : ''}`}
            onClick={() => {
              setCategory('');
              setPage(1);
            }}
          >
            <span>All Categories</span>
            <span>{(productCount ?? 0).toLocaleString()}</span>
          </button>

          <div className="category-tree">
            {categories.map((cat) => renderCategory(cat))}
          </div>
        </aside>

        {/* Products section */}
        <main className="products-section">
          <div className="products-header">
            <div>
              <h2>Products</h2>
              <p>
                {productCount !== null
                  ? `${productCount.toLocaleString()} products available`
                  : 'Product count unavailable'}
              </p>
              {searchCount !== null && (
                <p className="search-count">
                  Search matches: {searchCount.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="filter-panel">
            <div className="search-row">
              <input
                type="text"
                placeholder="Search for anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />

              <button type="button" onClick={handleSearch}>
                Search
              </button>
            </div>

            {/* Price filter */}
            <div className="price-row">
              <span>Price range:</span>

              <input
                type="number"
                min="0"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />

              <button type="button" onClick={handlePriceFilter}>
                Apply
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          {/* Product grid */}
          {loading ? (
            <p className="loading-message">Loading products...</p>
          ) : (
            <>
              <div className="product-grid">
                {products.length === 0 && (
                  <p className="empty-message">
                    No products matched your current search or filter.
                  </p>
                )}

                {products.map((p) => (
                  <div className="product-card" key={p.id}>
                    <div className="product-image">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 250px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    <h3>{p.name}</h3>

                    <p className="product-description">
                      {p.description.slice(0, 70)}...
                    </p>

                    <p className="product-category">{p.category}</p>

                    <p className="product-price">{p.price.toFixed(2)} BDT</p>

                    <p className="product-stock">Stock: {p.stock}</p>

                    <div className="product-actions">
                      <button
                        type="button"
                        className="details-button"
                        onClick={() => router.push(`/products/${p.id}`)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="cart-button"
                        disabled={p.stock === 0 || addingProductId === p.id}
                        onClick={() => addToCart(p.id)}
                      >
                        {addingProductId === p.id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!hasPrev}
                >
                  Previous
                </button>

                <span>Page {page}</span>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px;
          color: #1e293b;
        }

        .shop-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .sidebar {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 12px;
          background: #fff;
          position: sticky;
          top: 20px;
        }

        .sidebar-title {
          font-size: 18px;
          margin: 0 0 16px;
          padding: 0 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .all-category {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 9px;
          border: none;
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .category-row {
          display: flex;
          align-items: center;
          min-height: 38px;
          padding-right: 8px;
          border-radius: 6px;
          gap: 4px;
        }

        .category-row:hover,
        .all-category:hover {
          background: #f1f5f9;
        }

        .category-row.selected,
        .all-category.selected {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .expand-button {
          width: 24px;
          height: 28px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          font-size: 20px;
          flex-shrink: 0;
        }

        .expand-placeholder {
          width: 24px;
          flex-shrink: 0;
        }

        .category-name {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          text-align: left;
          padding: 7px 2px;
          cursor: pointer;
          font-size: 14px;
          color: inherit;
        }

        .category-count {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
        }

        .products-section {
          min-width: 0;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .products-header h2 {
          font-size: 25px;
          margin: 0 0 5px;
        }

        .products-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .search-count {
          margin-top: 5px !important;
        }

        .filter-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 22px;
        }

        .search-row,
        .price-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-row {
          margin-bottom: 14px;
        }

        .search-row input {
          flex: 1;
          min-width: 180px;
        }

        .search-row input,
        .price-row input {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          background: #fff;
          font-size: 14px;
        }

        .price-row input {
          width: 120px;
        }

        .search-row button,
        .price-row button {
          padding: 10px 18px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }

        .price-row span {
          font-size: 14px;
        }

        .error-message {
          color: #dc2626;
          margin-bottom: 15px;
        }

        .loading-message,
        .empty-message {
          text-align: center;
          color: #64748b;
          padding: 30px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .product-card {
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          background: #fff;
          transition:
            box-shadow 0.2s,
            transform 0.2s;
        }

        .product-card:hover {
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 170px;
          margin-bottom: 12px;
        }

        .product-card h3 {
          font-size: 16px;
          margin: 5px 0 8px;
        }

        .product-description {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .product-category {
          color: #64748b;
          font-size: 12px;
          text-transform: capitalize;
        }

        .product-price {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          margin: 5px 0;
        }

        .product-stock {
          font-size: 13px;
          color: #64748b;
        }

        .product-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 12px;
        }

        .product-actions button {
          flex: 1;
          padding: 9px 5px;
          border-radius: 7px;
          font-size: 12px;
          cursor: pointer;
        }

        .details-button {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
        }

        .cart-button {
          background: #0f172a;
          color: #fff;
          border: none;
        }

        .cart-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 28px;
        }

        .pagination button {
          padding: 8px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 760px) {
          .page-container {
            padding: 16px 12px;
          }

          .shop-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .sidebar {
            position: static;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
          }

          .product-image {
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}
