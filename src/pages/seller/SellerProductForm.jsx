import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CATEGORIES } from '../../data/products.js';
import './Seller.css';

const EMPTY = {
  name: '',
  category: CATEGORIES[0],
  subcategory: '',
  price: '',
  salePrice: '',
  stock: '',
  colors: '',
  sizes: '',
  images: '',
  shortDescription: '',
  description: '',
  material: '',
  tags: '',
  featured: false,
  isNew: false,
  active: true,
};

const splitList = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export default function SellerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    productsApi.get(id).then((res) => {
      if (res.ok) {
        const p = res.product;
        setForm({
          name: p.name,
          category: p.category,
          subcategory: p.subcategory,
          price: String(p.price),
          salePrice: p.salePrice != null ? String(p.salePrice) : '',
          stock: String(p.stock),
          colors: p.colors.join(', '),
          sizes: p.sizes.join(', '),
          images: p.images.join('\n'),
          shortDescription: p.shortDescription,
          description: p.description,
          material: p.material,
          tags: p.tags.join(', '),
          featured: p.featured,
          isNew: p.isNew,
          active: p.active,
        });
      } else {
        setError(res.error || 'Product not found.');
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.price || form.stock === '') {
      setError('Name, price, and stock are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || form.category,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      colors: splitList(form.colors),
      sizes: splitList(form.sizes),
      images: form.images
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      material: form.material.trim(),
      tags: splitList(form.tags),
      featured: form.featured,
      isNew: form.isNew,
      active: form.active,
    };

    setSubmitting(true);
    const res = isEdit ? await productsApi.update(id, payload) : await productsApi.create(payload);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Could not save product.');
      return;
    }
    showToast(isEdit ? 'Product updated.' : 'Product created.');
    navigate('/seller/products');
  };

  if (loading) return null;

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        <Link to="/seller/products" className="seller__back">
          Back to Products
        </Link>
      </div>

      <form className="seller__panel seller__form" onSubmit={handleSubmit}>
        <div className="seller__form-grid">
          <label className="seller__field seller__field--full">
            <span>Product Name</span>
            <input type="text" value={form.name} onChange={update('name')} />
          </label>
          <label className="seller__field">
            <span>Category</span>
            <select value={form.category} onChange={update('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="seller__field">
            <span>Subcategory</span>
            <input type="text" value={form.subcategory} onChange={update('subcategory')} placeholder={form.category} />
          </label>
          <label className="seller__field">
            <span>Price ($)</span>
            <input type="number" step="0.01" min="0" value={form.price} onChange={update('price')} />
          </label>
          <label className="seller__field">
            <span>Sale Price (optional)</span>
            <input type="number" step="0.01" min="0" value={form.salePrice} onChange={update('salePrice')} />
          </label>
          <label className="seller__field">
            <span>Stock</span>
            <input type="number" min="0" value={form.stock} onChange={update('stock')} />
          </label>
          <label className="seller__field">
            <span>Colors (comma-separated)</span>
            <input type="text" value={form.colors} onChange={update('colors')} placeholder="Black, White, Olive" />
          </label>
          <label className="seller__field seller__field--full">
            <span>Sizes (comma-separated)</span>
            <input type="text" value={form.sizes} onChange={update('sizes')} placeholder="S, M, L, XL" />
          </label>
          <label className="seller__field seller__field--full">
            <span>Image URLs (one per line)</span>
            <textarea rows={3} value={form.images} onChange={update('images')} placeholder="https://…" />
          </label>
          <label className="seller__field seller__field--full">
            <span>Short Description</span>
            <input type="text" value={form.shortDescription} onChange={update('shortDescription')} />
          </label>
          <label className="seller__field seller__field--full">
            <span>Full Description</span>
            <textarea rows={4} value={form.description} onChange={update('description')} />
          </label>
          <label className="seller__field">
            <span>Material</span>
            <input type="text" value={form.material} onChange={update('material')} />
          </label>
          <label className="seller__field">
            <span>Tags (comma-separated)</span>
            <input type="text" value={form.tags} onChange={update('tags')} placeholder="new, bestseller" />
          </label>
        </div>

        <div className="seller__form-flags">
          <label>
            <input type="checkbox" checked={form.featured} onChange={update('featured')} /> Featured
          </label>
          <label>
            <input type="checkbox" checked={form.isNew} onChange={update('isNew')} /> New Arrival
          </label>
          {isEdit && (
            <label>
              <input type="checkbox" checked={form.active} onChange={update('active')} /> Visible in store
            </label>
          )}
        </div>

        {error && <p className="seller__form-error">{error}</p>}

        <button type="submit" className="seller__submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
