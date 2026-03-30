import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, ArrowLeft, Search, X, Plus, Minus, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import API_URL from './api-config';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('nextstore-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('nextstore-cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erro ao carregar produtos:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        toast.success(`Mais um ${product.name} adicionado!`, { icon: '🛍️' });
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${product.name} adicionado ao carrinho!`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      toast.error(`${item.name} removido.`);
      setCart(prev => prev.filter(i => i.id !== id));
    }
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div whileHover={{ rotate: 15 }} className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors">
                  <ShoppingBag className="text-white w-6 h-6" />
                </motion.div>
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  NEXT<span className="text-indigo-600 group-hover:text-indigo-700">STORE</span>
                </span>
              </Link>

              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produtos premium..."
                    className="block w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-5">
                <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 group">
                  <div className="bg-slate-100 p-3 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <ShoppingCart size={24} />
                  </div>
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
                      {cart.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <AnimatedRoutes 
            products={filteredProducts} 
            addToCart={addToCart} 
            cart={cart} 
            updateQuantity={updateQuantity} 
            removeFromCart={removeFromCart} 
            total={total} 
            setCart={setCart}
            fetchProducts={fetchProducts}
          />
        </main>

        <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
            <div className="flex justify-center space-x-6 mb-8">
              <Link to="/" className="hover:text-indigo-600">Home</Link>
              <Link to="/cart" className="hover:text-indigo-600">Carrinho</Link>
              <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
            </div>
            <p className="text-sm">© 2026 NextStore. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const AnimatedRoutes: React.FC<any> = ({ products, addToCart, cart, updateQuantity, removeFromCart, total, setCart, fetchProducts }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><ProductList products={products} addToCart={addToCart} /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetail addToCart={addToCart} /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} total={total} /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><Checkout cart={cart} total={total} setCart={setCart} /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminPanel products={products} fetchProducts={fetchProducts} /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

const ProductList: React.FC<{ products: Product[], addToCart: (p: Product) => void }> = ({ products, addToCart }) => (
  <div>
    <h1 className="text-4xl font-black mb-10 tracking-tight">Novidades para você</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((p) => (
        <div key={p.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group shadow-sm">
          <div className="aspect-square relative overflow-hidden">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <button onClick={() => addToCart(p)} className="absolute bottom-4 right-4 bg-white p-4 rounded-2xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
              <Plus size={20} />
            </button>
          </div>
          <div className="p-6">
            <Link to={`/product/${p.id}`} className="font-bold text-lg hover:text-indigo-600 transition-colors">{p.name}</Link>
            <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10">{p.description}</p>
            <div className="flex justify-between items-center mt-6">
              <span className="text-2xl font-black text-slate-900">R$ {p.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProductDetail: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const productId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`http://localhost:3001/api/products/${productId}`).then(res => res.json()).then(data => setProduct(data));
  }, [productId]);

  if (!product) return <div className="text-center py-20 font-bold">Carregando...</div>;

  return (
    <div className="bg-white rounded-[40px] p-8 flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto shadow-sm border border-slate-100">
      <div className="flex-1 aspect-square rounded-[32px] overflow-hidden bg-slate-50">
        <img src={product.image} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <Link to="/" className="flex items-center gap-2 text-slate-400 mb-8 hover:text-indigo-600 transition-colors font-bold"><ArrowLeft size={18} /> Voltar</Link>
        <h1 className="text-5xl font-black mb-6 tracking-tight">{product.name}</h1>
        <p className="text-lg text-slate-500 mb-10 leading-relaxed">{product.description}</p>
        <div className="text-5xl font-black mb-10 text-indigo-600 tracking-tighter">R$ {product.price.toFixed(2)}</div>
        <button onClick={() => addToCart(product)} className="bg-indigo-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Adicionar ao Carrinho</button>
      </div>
    </div>
  );
};

const Cart: React.FC<{ cart: CartItem[], updateQuantity: (id: number, delta: number) => void, removeFromCart: (id: number) => void, total: number }> = ({ cart, updateQuantity, removeFromCart, total }) => (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-4xl font-black mb-10 tracking-tight">Seu Carrinho</h1>
    {cart.length === 0 ? (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-slate-400 mb-8 text-lg">Seu carrinho está vazio.</p>
        <Link to="/" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Explorar Produtos</Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex gap-6 items-center shadow-sm">
              <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{item.name}</h3>
                <p className="text-indigo-600 font-bold mt-1">R$ {item.price.toFixed(2)}</p>
                <div className="flex items-center gap-4 mt-4 bg-slate-100 w-fit rounded-xl px-3 py-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-indigo-600 transition-colors"><Minus size={16} /></button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-indigo-600 transition-colors"><Plus size={16} /></button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={24} /></button>
            </div>
          ))}
        </div>
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white h-fit sticky top-32 shadow-2xl shadow-indigo-600/20">
          <div className="flex justify-between items-end mb-10">
            <span className="font-medium text-indigo-100">Total Geral</span>
            <span className="text-4xl font-black text-white tracking-tight">R$ {total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="block text-center bg-white text-indigo-600 py-6 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">Finalizar Compra</Link>
        </div>
      </div>
    )}
  </div>
);

const Checkout: React.FC<{ cart: CartItem[], total: number, setCart: any }> = ({ cart, total, setCart }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '', expiry: '', cvc: '' });

  if (cart.length === 0 && step < 4) return <div className="text-center py-24 bg-white rounded-3xl"><h2 className="text-2xl font-bold mb-6">Carrinho Vazio</h2><Link to="/" className="text-indigo-600 font-bold underline">Voltar para a loja</Link></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-xl">
      <div className="p-12">
        <AnimatePresence mode="wait">
          {step < 4 ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key={step}>
              <h2 className="text-3xl font-black mb-10 tracking-tight">{step === 1 ? 'Endereço de Entrega' : step === 2 ? 'Pagamento' : 'Confirme seu Pedido'}</h2>
              {step === 1 && (
                <div className="space-y-4">
                  <input placeholder="Nome Completo" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Seu E-mail" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input placeholder="Endereço Completo" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={e => setFormData({...formData, address: e.target.value})} />
                  <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg mt-6 shadow-lg shadow-indigo-600/20">Continuar</button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <input placeholder="Número do Cartão" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={e => setFormData({...formData, card: e.target.value})} />
                  <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg mt-6 shadow-lg shadow-indigo-600/20">Revisar</button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100"><div className="flex justify-between items-end text-3xl font-black text-indigo-600"><span>Total</span><span>R$ {total.toFixed(2)}</span></div></div>
                  <button onClick={() => {setCart([]); setStep(4); toast.success('Pedido Realizado!', { icon: '📦' });}} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-2xl">Confirmar Pagamento</button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10"><ShoppingBag size={48} /></div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">Sucesso!</h2>
              <p className="text-slate-500 mb-12 text-lg">Seu pedido foi processado e já estamos preparando para o envio.</p>
              <Link to="/" className="bg-indigo-600 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-all">Explorar mais</Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{ products: Product[], fetchProducts: any }> = ({ products, fetchProducts }) => {
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `http://localhost:3001/api/products/${editing.id}` : 'http://localhost:3001/api/products';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, price: parseFloat(formData.price) })
    });

    if (res.ok) {
      toast.success(editing ? 'Produto atualizado!' : 'Produto cadastrado!');
      setEditing(null);
      setFormData({ name: '', price: '', description: '', image: '' });
      fetchProducts();
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const res = await fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.error('Produto excluído.');
        fetchProducts();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-black mb-10 tracking-tight">Gestão do Catálogo</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl h-fit space-y-5 sticky top-24">
          <h2 className="text-2xl font-black mb-2">{editing ? 'Editar Item' : 'Novo Cadastro'}</h2>
          <div className="space-y-4">
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome do Produto" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" required />
            <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Preço (R$)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" required />
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descrição Completa" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 h-32 resize-none" required />
            <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="URL da Imagem (Unsplash, etc)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">{editing ? 'Salvar Alteração' : 'Cadastrar Produto'}</button>
            {editing && <button onClick={() => {setEditing(null); setFormData({name:'', price:'', description:'', image:''})}} className="bg-slate-100 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-200">X</button>}
          </div>
        </form>

        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-6">Informações do Produto</th>
                <th className="px-8 py-6">Preço</th>
                <th className="px-8 py-6 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 flex items-center gap-5">
                    <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                    <div>
                      <div className="font-black text-slate-900 truncate max-w-[200px]">{p.name}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">ID: #{p.id}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-indigo-600 text-lg">R$ {p.price.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => {setEditing(p); setFormData({name:p.name, price:p.price.toString(), description:p.description, image:p.image})}} className="p-3 text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-slate-100 hover:scale-110 transition-all">
                        Editar
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 hover:bg-white rounded-xl shadow-sm border border-slate-100 hover:scale-110 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">Nenhum produto cadastrado no banco.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
