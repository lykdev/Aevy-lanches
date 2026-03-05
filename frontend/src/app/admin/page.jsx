'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';
import Image from 'next/image';

export default function AdminPage() {
  const burgerImages = [
    '/assets/burgers/burger1.png',
    '/assets/burgers/burger2.png',
    '/assets/burgers/burger3.png',
    '/assets/burgers/burger4.png',
    '/assets/burgers/burger5.png',
    '/assets/burgers/burger6.png',
  ];

  const getRandomBurgerImage = (lancheId) => {
    const id = Number(lancheId) || 0;
    const index = Math.abs((id * 9301 + 49297) % burgerImages.length);
    return burgerImages[index];
  };

  const [lanches, setLanches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLanche, setEditingLanche] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    preco: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAdminAccess();
    fetchLanches();
  }, []);

  const checkAdminAccess = () => {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
      router.push('/login');
      return;
    }
    
    const usuario = JSON.parse(usuarioData);
    if (usuario.email !== 'admin@codeburger.com') {
      router.push('/dashboard');
      return;
    }
  };

  const fetchLanches = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.LANCHES);
      if (response.ok) {
        const data = await response.json();
        setLanches(data);
      }
    } catch (error) {
      console.error('Erro ao buscar lanches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingLanche 
      ? `${API_ENDPOINTS.LANCHES}/${editingLanche.id}`
      : API_ENDPOINTS.LANCHES;
    
    const method = editingLanche ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: parseInt(formData.id),
          preco: parseFloat(formData.preco)
        })
      });

      if (response.ok) {
        showNotification(editingLanche ? 'Lanche atualizado com sucesso!' : 'Lanche criado com sucesso!');
        resetForm();
        fetchLanches();
      } else {
        const error = await response.json();
        showNotification(error.Erro || 'Erro ao salvar lanche', true);
      }
    } catch (error) {
      console.error('Erro ao salvar lanche:', error);
      showNotification('Erro de conexão', true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este lanche?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.LANCHES}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Lanche excluído com sucesso!');
        fetchLanches();
      } else {
        showNotification('Erro ao excluir lanche', true);
      }
    } catch (error) {
      console.error('Erro ao excluir lanche:', error);
      showNotification('Erro de conexão', true);
    }
  };

  const handleEdit = (lanche) => {
    setEditingLanche(lanche);
    setFormData({
      id: lanche.id.toString(),
      nome: lanche.nome,
      preco: lanche.preco.toString(),
      descricao: lanche.descricao
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ id: '', nome: '', preco: '', descricao: '' });
    setEditingLanche(null);
    setShowForm(false);
  };

  const showNotification = (message, isError = false) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${isError ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const irParaDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl magic-text-glow">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 magic-text-glow">Gerenciar Lanches</h2>
          <p className="text-blackvivid-muted">Adicione, edite ou remova produtos do cardápio</p>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-blackvivid-light rounded-lg p-6 w-full max-w-md magic-border">
              <h3 className="text-xl font-bold text-white mb-4 magic-text-glow">
                {editingLanche ? 'Editar Lanche' : 'Novo Lanche'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blackvivid-muted mb-1">ID</label>
                  <input
                    type="number"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white magic-border"
                    disabled={!!editingLanche}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blackvivid-muted mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white magic-border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blackvivid-muted mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white magic-border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blackvivid-muted mb-1">Descrição</label>
                  <textarea
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    rows={3}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white magic-border"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-gray-200 text-black py-2 rounded-lg transition magic-shadow"
                  >
                    {editingLanche ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-blackvivid-light hover:bg-gray-700 text-white py-2 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lanches.map((lanche) => (
            <div key={lanche.id} className="bg-blackvivid-light rounded-lg overflow-hidden magic-shadow">
              <div className="relative h-48 bg-black border-b border-gray-800">
                <Image
                  src={getRandomBurgerImage(lanche.id)}
                  alt={lanche.nome}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.target.src = '/assets/heroBurger.png';
                  }}
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{lanche.nome}</h3>
                <p className="text-blackvivid-muted text-sm mb-4 line-clamp-3">{lanche.descricao}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-white magic-text-glow">
                    R$ {lanche.preco.toFixed(2)}
                  </span>
                  <span className="text-blackvivid-muted text-sm">ID: {lanche.id}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lanche)}
                    className="flex-1 bg-white hover:bg-gray-200 text-black py-2 rounded-lg transition magic-shadow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(lanche.id)}
                    className="flex-1 bg-white hover:bg-gray-200 text-black py-2 rounded-lg transition magic-shadow"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lanches.length === 0 && (
          <div className="text-center text-blackvivid-muted py-12">
            <p className="text-xl">Nenhum lanche cadastrado.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg transition magic-shadow"
            >
              Adicionar Primeiro Lanche
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
