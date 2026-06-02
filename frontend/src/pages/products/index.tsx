import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import type { Product, InventoryItem } from '@/shared/types';
import { useCity } from '@/shared/lib/cityContext';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/products').then(r => setProducts(r.data));
  }, []);

  useEffect(() => {
    if (!currentCityId) return;
    apiClient.get('/inventory').then(r => setInventory(r.data));
  }, [currentCityId]);

  const toggleExpand = (id: number) => setExpanded(expanded === id ? null : id);

  const getInventoryForProduct = (productId: number) =>
    inventory.filter(i => i.productId === productId);

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Товары и остатки</h1>
        <span className="page-counter">{products.length} товаров</span>
      </div>

      <div className="products-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>SKU</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Вес</th>
              <th>Объём</th>
              <th>Длина</th>
              <th>Цена</th>
              <th>Подъём</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <React.Fragment key={p.id}>
                <tr className="product-row" onClick={() => toggleExpand(p.id)}>
                  <td className="td-expand">
                    {expanded === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                  <td className="td-sku">{p.sku}</td>
                  <td className="td-name">{p.name}</td>
                  <td className="td-cat">{p.categoryName}</td>
                  <td className="td-num">{Number(p.weight)} кг</td>
                  <td className="td-num">{Number(p.volume)} м³</td>
                  <td className="td-num">{p.length} мм</td>
                  <td className="td-price">{Number(p.price).toLocaleString()} ₽</td>
                  <td>
                    {p.isFreeLift ? (
                      <span className="badge badge--green">Бесплатно</span>
                    ) : (
                      <span className="badge badge--default">Платный</span>
                    )}
                  </td>
                </tr>
                {expanded === p.id && (
                  <tr className="inventory-row">
                    <td colSpan={9}>
                      <div className="inventory-detail">
                        <h4>Остатки по ТТ:</h4>
                        <div className="inventory-grid">
                          {getInventoryForProduct(p.id).map(inv => (
                            <div key={inv.id} className="inv-card">
                              <span className="inv-store">{inv.store?.name || `ТТ #${inv.storeId}`}</span>
                              <span className={`inv-qty ${inv.quantity > 0 ? 'inv-qty--ok' : 'inv-qty--zero'}`}>
                                {inv.quantity} шт
                              </span>
                            </div>
                          ))}
                          {getInventoryForProduct(p.id).length === 0 && (
                            <p className="inv-empty">Нет данных об остатках</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .products-page { padding: var(--space-lg); }
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: var(--space-xl); }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .page-counter { font-size: 0.8125rem; color: var(--text-muted); padding: 3px 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
        .products-table-wrapper { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 10px 14px; text-align: left; font-size: 0.8125rem; border-bottom: 1px solid var(--line); }
        .data-table th { color: var(--text-muted); font-weight: 500; background: var(--bg); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .product-row { cursor: pointer; transition: background var(--transition-fast); }
        .product-row:hover td { background: var(--surface-2); }
        .td-expand { width: 32px; text-align: center; color: var(--text-muted); }
        .td-sku { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--cyan); }
        .td-name { font-weight: 600; }
        .td-cat { color: var(--text-secondary); }
        .td-num { font-variant-numeric: tabular-nums; }
        .td-price { font-weight: 700; color: var(--green); }
        .badge { padding: 2px 8px; border-radius: 8px; font-size: 0.625rem; font-weight: 600; }
        .badge--green { background: var(--green-soft); color: var(--green); }
        .badge--default { background: var(--surface); color: var(--text-muted); border: 1px solid var(--line); }
        .inventory-row td { padding: 0 !important; border-bottom: 2px solid var(--blue-soft); }
        .inventory-detail { padding: 16px 20px; background: var(--bg); }
        .inventory-detail h4 { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .inventory-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .inv-card { display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); }
        .inv-store { font-size: 0.75rem; color: var(--text-secondary); }
        .inv-qty { font-size: 0.8125rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .inv-qty--ok { color: var(--green); }
        .inv-qty--zero { color: var(--red); }
        .inv-empty { font-size: 0.75rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
};
