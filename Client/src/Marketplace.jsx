import { useEffect, useMemo, useState } from "react";
import "./Marketplace.css";

const API_URL = "http://localhost:5000";

const categories = [
  "All Products",
  "Seeds",
  "Fertilizers",
  "Crop Protection",
  "Tools & Equipment",
  "Machinery",
  "Irrigation",
  "Grains",
  "Fruits & Vegetables",
  "Organic Products",
];

const fallbackProducts = [
  { id: 1, name: "Premium Wheat Seeds", category: "Seeds", price: 850, unit: "5 kg", icon: "🌾", description: "Quality seeds for wheat cultivation." },
  { id: 2, name: "Hybrid Maize Seeds", category: "Seeds", price: 1200, unit: "5 kg", icon: "🌽", description: "Hybrid seeds for maize farming." },
  { id: 3, name: "Organic Compost", category: "Fertilizers", price: 450, unit: "25 kg", icon: "🌱", description: "Organic compost for soil improvement." },
  { id: 4, name: "NPK Plant Nutrients", category: "Fertilizers", price: 750, unit: "5 kg", icon: "🧪", description: "Plant nutrients for balanced crop growth." },
  { id: 5, name: "Garden Sprayer", category: "Crop Protection", price: 650, unit: "1 piece", icon: "💧", description: "Sprayer for applying farm treatments." },
  { id: 6, name: "Hand Cultivator", category: "Tools & Equipment", price: 350, unit: "1 piece", icon: "🛠️", description: "Useful tool for loosening soil." },
  { id: 7, name: "Mini Power Tiller", category: "Machinery", price: 18500, unit: "1 unit", icon: "🚜", description: "Compact equipment for soil preparation." },
  { id: 8, name: "Drip Irrigation Kit", category: "Irrigation", price: 2200, unit: "1 kit", icon: "🚿", description: "Water-saving irrigation kit." },
  { id: 9, name: "Premium Rice", category: "Grains", price: 1600, unit: "25 kg", icon: "🍚", description: "Rice grain listing for agricultural buyers." },
  { id: 10, name: "Fresh Tomatoes", category: "Fruits & Vegetables", price: 40, unit: "1 kg", icon: "🍅", description: "Fresh tomatoes; sample price per kilogram." },
  { id: 11, name: "Fresh Mangoes", category: "Fruits & Vegetables", price: 100, unit: "1 kg", icon: "🥭", description: "Fresh seasonal mangoes; sample price." },
  { id: 12, name: "Organic Neem Cake", category: "Organic Products", price: 550, unit: "10 kg", icon: "🍃", description: "Organic soil amendment for farming." },
];

function Marketplace() {
  const [products, setProducts] = useState(fallbackProducts);
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((response) => {
        if (!response.ok) throw new Error("Products API unavailable");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Keep sample products visible if the backend is unavailable.
      });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        category === "All Products" || product.category === category;
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, category, search, sort]);

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartTotal = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] || 0),
    0
  );

  function addToCart(product) {
    setCart((previous) => ({
      ...previous,
      [product.id]: (previous[product.id] || 0) + 1,
    }));
    setMessage(`${product.name} added to cart.`);
  }

  function changeQuantity(productId, amount) {
    setCart((previous) => {
      const next = { ...previous };
      const updated = (next[productId] || 0) + amount;

      if (updated <= 0) {
        delete next[productId];
      } else {
        next[productId] = updated;
      }

      return next;
    });
    setMessage("");
  }

  return (
    <section className="marketplace" id="marketplace">
      <div className="market-hero">
        <div>
          <span className="market-eyebrow">AGRICULTURE MADE SIMPLE</span>
          <h2>Farm Products Marketplace</h2>
          <p>
            Discover farming essentials, compare sample prices, and keep your
            farm supplies organized in one place.
          </p>
          <a href="#market-products" className="market-hero-btn">
            Explore Products ↓
          </a>
        </div>
        <div className="market-hero-icon" aria-hidden="true">🌾</div>
      </div>

      <div className="market-heading" id="market-products">
        <div>
          <span className="market-eyebrow">SHOP FARM ESSENTIALS</span>
          <h2>Products for Every Farm</h2>
          <p>Search products or select a category to get started.</p>
        </div>
        <div className="market-cart-summary">
          🛒 {cartCount} item(s)
          <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="market-controls">
        <input
          type="search"
          placeholder="Search seeds, tools, grains..."
          aria-label="Search farm products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      <div className="market-categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "market-category active" : "market-category"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {message && <p className="market-message" role="status">{message}</p>}

      <div className="market-results">
        Showing {filteredProducts.length} product(s)
      </div>

      <div className="market-grid">
        {filteredProducts.map((product) => (
          <article className="market-card" key={product.id}>
            <div className="market-product-icon">{product.icon || "🌱"}</div>
            <span className="market-product-category">{product.category}</span>
            <h3>{product.name}</h3>
            <p className="market-description">{product.description}</p>

            <div className="market-price">
              <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
              <span>/ {product.unit}</span>
            </div>

            {cart[product.id] ? (
              <div className="market-quantity">
                <button
                  type="button"
                  aria-label={`Remove one ${product.name}`}
                  onClick={() => changeQuantity(product.id, -1)}
                >
                  −
                </button>
                <span>{cart[product.id]}</span>
                <button
                  type="button"
                  aria-label={`Add one ${product.name}`}
                  onClick={() => changeQuantity(product.id, 1)}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="market-add-btn"
                type="button"
                onClick={() => addToCart(product)}
              >
                + Add to Cart
              </button>
            )}
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="market-empty">
          <span>🔎</span>
          <h3>No products found</h3>
          <p>Try another search or select a different category.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All Products");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <p className="market-disclaimer">
        Demo marketplace: prices and product listings are sample data, not
        verified live offers. Checkout and payment are not enabled yet.
      </p>
    </section>
  );
}

export default Marketplace;