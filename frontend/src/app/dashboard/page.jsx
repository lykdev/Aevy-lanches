'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';
import Image from 'next/image';

export default function DashboardPage() {
  const burgerImages = [
    '/assets/burgers/burger1.png',
    '/assets/burgers/burger2.png',
    '/assets/burgers/burger3.png',
    '/assets/burgers/burger4.png',
    '/assets/burgers/burger5.png',
    '/assets/burgers/burger6.png',
  ];

  const getBurgerImageForLanche = (lancheId) => {
    const id = Number(lancheId) || 0;
    const index = Math.abs((id * 9301 + 49297) % burgerImages.length);
    return burgerImages[index];
  };

  const [lanches, setLanches] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
      router.push('/login');
      return;
    }
    setUsuario(JSON.parse(usuarioData));
    
    const carrinhoData = localStorage.getItem('carrinho');
    if (carrinhoData) {
      setCarrinho(JSON.parse(carrinhoData));
    }
    
    fetchLanches();
  }, []);

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

  const abrirPersonalizacao = (lanche) => {
    const lancheParaPersonalizar = {
      ...lanche,
      imagem: getBurgerImageForLanche(lanche.id),
    };

    localStorage.removeItem('itemParaEditar');
    localStorage.setItem('lancheParaPersonalizar', JSON.stringify(lancheParaPersonalizar));
    router.push('/personalizacao');
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const irParaCarrinho = () => {
    router.push('/carrinho');
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrinho');
    window.dispatchEvent(new Event('authUpdated'));
    window.dispatchEvent(new Event('cartUpdated'));
    router.push('/');
  };

  const totalItensCarrinho = carrinho.reduce((total, item) => total + item.quantidade, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl magic-text-glow">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 magic-text-glow">Cardápio Aevy Burger</h2>
            <p className="text-blackvivid-muted">Olá, {usuario?.nome}. Escolha seus hambúrgueres favoritos e adicione ao carrinho</p>
          </div>

          <div className="flex items-center gap-3">
            {usuario?.email === 'admin@codeburger.com' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition magic-shadow"
              >
                Área Admin
              </button>
            )}
            <button
              onClick={logout}
              className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition magic-shadow"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lanches.map((lanche) => (
            <div key={lanche.id} className="bg-blackvivid-light rounded-lg overflow-hidden magic-shadow hover:scale-105 transition-all magic-border">
              <div className="relative h-48 bg-black border-b border-gray-800">
                <Image
                  src={getBurgerImageForLanche(lanche.id)}
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
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white magic-text-glow">
                    R$ {lanche.preco.toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => abrirPersonalizacao(lanche)}
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-semibold transition magic-shadow"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lanches.length === 0 && (
          <div className="text-center text-blackvivid-muted py-12">
            <p className="text-xl">Nenhum lanche disponível no momento.</p>
          </div>
        )}
      </main>
    </div>
  );
}
