"use client";
import Link from 'next/link';

import { useEffect, useState } from 'react';
export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncFromStorage = () => {
      const usuarioData = localStorage.getItem('usuario');
      setIsLoggedIn(!!usuarioData);
      
      const isAdmin = usuarioData && JSON.parse(usuarioData).email === 'admin@codeburger.com';
      setIsAdmin(isAdmin);

      const carrinhoData = localStorage.getItem('carrinho');
      try {
        const carrinho = carrinhoData ? JSON.parse(carrinhoData) : [];
        const total = Array.isArray(carrinho)
          ? carrinho.reduce((acc, item) => acc + (Number(item?.quantidade) || 0), 0)
          : 0;
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('authUpdated', syncFromStorage);
    window.addEventListener('cartUpdated', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('authUpdated', syncFromStorage);
      window.removeEventListener('cartUpdated', syncFromStorage);
    };
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <header className="bg-black text-white border-b border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <div className="text-2xl font-bold">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            Aevy <span className="text-white">•</span> Burger
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {!isLoggedIn && (
            <ul className="flex gap-4">
              <li><Link href="/" className="hover:text-white">Início</Link></li>
              <li><Link href="/" className="hover:text-white">Burgers</Link></li>
              <li><Link href="/" className="hover:text-white">Contato</Link></li>
            </ul>
          )}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <Link href="/admin" className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-lg text-sm transition magic-shadow">
                  + Novo Lanche
                </Link>
                <Link href="/dashboard" className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-lg text-sm transition magic-shadow">
                  Voltar
                </Link>
              </>
            ) : (
              <>
                <Link href={isLoggedIn ? "/dashboard" : "/login"} className="bg-white text-black font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition">
                  Fazer pedido
                </Link>
                <Link href="/carrinho" className="relative text-2xl hover:text-white">
                  <i className="fas fa-shopping-cart"></i>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link href="/login" className="border border-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-zinc-800 transition">
                  Login
                </Link>
                <Link href="/cadastro" className="border border-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-zinc-800 transition">
                  Cadastro
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="md:hidden text-3xl">
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </header>
  );
}