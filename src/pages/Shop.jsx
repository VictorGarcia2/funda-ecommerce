import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Shop = () => {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Sample product data (replace with actual data from your backend)
  const products = [
    {
      id: 1,
      name: 'Funda Clásica',
      category: 'classic',
      price: 19.99,
      image: '/images/classic-case.jpg',
      description: 'Funda protectora con diseño clásico y elegante',
    },
    {
      id: 2,
      name: 'Funda Transparente',
      category: 'clear',
      price: 14.99,
      image: '/images/clear-case.jpg',
      description: 'Funda transparente que muestra la belleza original de tu dispositivo',
    },
    {
      id: 3,
      name: 'Funda Resistente',
      category: 'rugged',
      price: 24.99,
      image: '/images/rugged-case.jpg',
      description: 'Protección máxima para tu dispositivo',
    },
    // Add more products as needed
  ];

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'classic', name: 'Clásicos' },
    { id: 'clear', name: 'Transparentes' },
    { id: 'rugged', name: 'Resistentes' },
  ];

  const sortOptions = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price-low', label: 'Precio: Menor a Mayor' },
    { value: 'price-high', label: 'Precio: Mayor a Menor' },
    { value: 'newest', label: 'Más Recientes' },
  ];

  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-blue dark:text-light-darker">
          Nuestra Colección
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Buscar fundas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-blue/10 bg-white dark:bg-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-2 dark:text-light-darker"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-blue/60 dark:text-light-darker/60" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-blue/10 bg-white dark:bg-dark text-slate-blue dark:text-light-darker focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-2"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary dark:bg-accent-2 text-white'
                : 'bg-white dark:bg-dark text-slate-blue dark:text-light-darker hover:bg-light-darker dark:hover:bg-slate-blue/20'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white dark:bg-dark rounded-2xl border border-slate-blue/10 overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-slate-blue dark:text-light-darker">
                {product.name}
              </h3>
              <p className="text-sm text-slate-blue/80 dark:text-light-darker/80">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-primary dark:text-accent-2">
                  ${product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="px-4 py-2 rounded-lg bg-primary dark:bg-accent-2 text-white font-medium hover:bg-primary/90 dark:hover:bg-accent-2/90 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <FunnelIcon className="mx-auto h-12 w-12 text-slate-blue/40 dark:text-light-darker/40" />
          <h3 className="mt-4 text-lg font-medium text-slate-blue dark:text-light-darker">
            No se encontraron productos
          </h3>
          <p className="mt-2 text-slate-blue/60 dark:text-light-darker/60">
            Intenta ajustar los filtros o el término de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;