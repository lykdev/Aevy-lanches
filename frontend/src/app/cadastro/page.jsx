'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';
import './cadastro.css';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const showToast = (title, description, isError = false) => {
    setMessage({ title, description, isError });
    const toastElement = document.getElementById('toast');
    if (toastElement) {
      toastElement.classList.remove('hidden', 'translate-x-full');
      toastElement.classList.add('translate-x-0');
      setTimeout(() => {
        toastElement.classList.remove('translate-x-0');
        toastElement.classList.add('translate-x-full');
        setTimeout(() => toastElement.classList.add('hidden'), 300);
      }, 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      showToast('Erro de Senha', 'A senha e a confirmação de senha não coincidem.', true);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(API_ENDPOINTS.USUARIO_CADASTRO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          endereco,
          senha: password,
        }),
      });

      if (response.ok || response.status === 201) {
        showToast('Cadastro Sucesso!', 'Sua conta foi criada. Faça login para continuar.', false);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Erro ao cadastrar. Verifique os dados.';
        showToast('Falha no Cadastro', errorMessage, true);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      showToast('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.', true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="cadastro-bg min-h-screen flex items-center justify-center">
        <div className="cadastro-card p-10 rounded-xl shadow-xl w-full max-w-md animate-fadeIn">
          <div className="text-center mb-6">
            <img
              src="/assets/logo_codeburguer.png"
              alt="Code Burger"
              className="h-16 w-16 mx-auto mb-3 rounded-full"
            />
            <h1 className="text-3xl font-bold text-gradient mb-1 magic-text-glow">Aevy Burger</h1>
            <p className="text-sm text-blackvivid-muted">
              Crie sua conta e faça parte da nossa comunidade
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-blackvivid-muted">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <div>
              <label className="text-sm text-blackvivid-muted">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <div>
              <label className="text-sm text-blackvivid-muted">Telefone</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <div>
              <label className="text-sm text-blackvivid-muted">Endereço</label>
              <input
                type="text"
                placeholder="Rua Galvão Bueno"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <div>
              <label className="text-sm text-blackvivid-muted">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <div>
              <label className="text-sm text-blackvivid-muted">Confirmar senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="cadastro-input"
              />
            </div>

            <button
              type="submit"
              className={`cadastro-btn ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-blackvivid-muted mt-5">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-white hover:text-gray-300">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        id="toast"
        className={`fixed top-8 right-8 bg-blackvivid-light border border-gray-800 rounded-lg p-4 max-w-xs magic-glow transition-all duration-300 ease-in-out z-50 transform ${
          message ? 'translate-x-0' : 'translate-x-full hidden'
        } ${message?.isError ? 'border-red-600' : 'border-gray-800'}`}
      >
        <div className="flex flex-col gap-1">
          <h3
            className={`text-base font-semibold ${
              message?.isError ? 'text-red-400' : 'text-white'
            }`}
          >
            {message?.title}
          </h3>
          <p className="text-sm text-gray-400">{message?.description}</p>
        </div>
      </div>
    </>
  );
}
