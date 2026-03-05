'use client';

import Image from 'next/image'
import BurgerCard from '@/components/BurgerCard'; 
import { API_ENDPOINTS } from '@/config/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function getLanches() {
  const urlAPI = API_ENDPOINTS.LANCHES; 
  try {
    const response = await fetch(urlAPI, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.statusText}`);
    }
    return response.json();

  } catch (error) {
    console.error('Ocorreu um erro ao buscar os lanches:', error);
    return []; 
  }
}
export default function Home() {
  const [lanches, setLanches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const usuarioData = localStorage.getItem('usuario');
      setUserLoggedIn(!!usuarioData);
    }

    const loadLanches = async () => {
      try {
        const data = await getLanches();
        setLanches(data);
      } catch (error) {
        console.error('Erro ao carregar lanches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLanches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl magic-text-glow">Carregando...</div>
      </div>
    );
  }

  if (userLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4 magic-text-glow">Redirecionando...</h1>
          <p className="text-blackvivid-muted mb-6">Você será redirecionado para o dashboard</p>
          <a 
            href="/dashboard" 
            className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold transition-all magic-shadow inline-block"
          >
            Ir para Dashboard
          </a>
        </div>
      </div>
    );
  }
  return (
    <>
      <section className="hero bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-20 flex items-center">
          <div className="leftside w-1/2">
            <h1 className="text-5xl font-bold mb-4 magic-text-glow">Bem-vindo à Aevy Burger!</h1>
            <p className="text-lg text-blackvivid-muted mb-8">A hamburgueria virtual com o melhor sabor e experiência online.</p>
            <a href="/login" className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-lg text-lg transition-all magic-shadow">
              Fazer pedido
            </a>
          </div>
          <div className="rightside w-1/2 flex justify-center">
            <Image src="/assets/heroBurger.png"
              alt="Burger delicioso"
              width={500}
              height={500}
              className='animate-float' />
          </div>
        </div>
      </section>
      <section className="search container mx-auto px-4 py-16">
        <div className="title text-3xl font-bold mb-6 magic-text-glow">
          Pesquise o seu<br />Hamburguer favorito!
        </div>
        <div className="sides flex flex-col md:flex-row gap-4">
          <div className="leftside flex-grow">
            <input
              type="text"
              placeholder="Digite o nome do Burger"
              className="w-full bg-blackvivid-light border border-gray-800 rounded-lg p-4 text-white placeholder-blackvivid-muted magic-border transition-all"
            />
          </div>
          <div className="rightside">
            <select className="w-full md:w-auto bg-blackvivid-light border border-gray-800 rounded-lg p-4 text-white magic-border transition-all">
              <option value="">Selecionar categoria</option>
              <option value="burgers">Burgers</option>
            </select>
          </div>
        </div>
      </section>
      <section className="menu py-20 bg-blackvivid">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-12 magic-text-glow">Nosso Cardápio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lanches.map(lanche => (
              <BurgerCard key={lanche.id} lanche={lanche} />
            ))}
          </div>
        </div>
      </section>
      <main className="container mx-auto px-4 py-4">
        <div id="lista-lanches" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lanches.length > 0 ? (
            lanches.map(lanche => (
              <BurgerCard key={lanche.id} lanche={lanche} />
            ))
          ) : (
            <p className="text-gray-400 col-span-3">Desculpe, não foi possível carregar o cardápio.</p>
          )}
        </div>
      </main>
    </>
  )
}
