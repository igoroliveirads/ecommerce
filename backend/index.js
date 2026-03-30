const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const db = new Database('ecommerce.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT
  )
`);

const rowCount = db.prepare('SELECT COUNT(*) as count FROM products').get();

if (rowCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)');
  const initialProducts = [
    { name: 'Smartphone Phoenix X', price: 4299.00, description: 'Tela OLED 120Hz, processador ultra rápido e câmera de 108MP.', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60' },
    { name: 'Fone Noise Cancelling Z', price: 1299.00, description: 'Silêncio absoluto e som de alta fidelidade para suas viagens.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60' },
    { name: 'Notebook Infinity Pro', price: 7499.00, description: 'O poder que você precisa para criar sem limites. 32GB RAM e SSD 1TB.', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=60' },
    { name: 'Monitor Vision 4K 27"', price: 2199.00, description: 'Cores vibrantes e detalhes impressionantes para seu setup profissional.', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60' },
    { name: 'Drone SkyCam 4K', price: 3500.00, description: 'Imagens aéreas cinematográficas com estabilização de 3 eixos.', image: 'https://images.unsplash.com/photo-1507500033025-5010b4e27c29?w=600&auto=format&fit=crop&q=60' },
    { name: 'Teclado Mecânico Nova', price: 599.00, description: 'Switches ópticos e iluminação RGB customizável.', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&auto=format&fit=crop&q=60' },
    { name: 'Câmera Focus Z1', price: 5800.00, description: 'Capture momentos inesquecíveis com qualidade profissional mirrorless.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60' },
    { name: 'Mouse Gamer Orion', price: 249.00, description: 'Precisão absoluta com 16.000 DPI e design ergonômico.', image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&auto=format&fit=crop&q=60' },
    { name: 'Relógio Smart Z', price: 1549.90, description: 'Monitoramento cardíaco, GPS e bateria que dura 14 dias.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60' },
    { name: 'Mochila Tech 20L', price: 199.00, description: 'Compartimento para notebook e à prova d\'água.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60' },
    { name: 'Tênis Running X', price: 299.90, description: 'Alta performance para corridas urbanas.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60' },
    { name: 'Lâmpada Smart RGB', price: 89.00, description: 'Controle o ambiente da sua casa pelo celular.', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&auto=format&fit=crop&q=60' },
  ];

  initialProducts.forEach(p => insert.run(p.name, p.price, p.description, p.image));
  console.log('Banco de dados populado com sucesso!');
}

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).send('Produto não encontrado');
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, price, description, image } = req.body;
  const info = db.prepare('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)').run(name, price, description, image);
  res.json({ id: info.lastInsertRowid, name, price, description, image });
});

app.put('/api/products/:id', (req, res) => {
  const { name, price, description, image } = req.body;
  db.prepare('UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?').run(name, price, description, image, req.params.id);
  res.json({ id: req.params.id, name, price, description, image });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
