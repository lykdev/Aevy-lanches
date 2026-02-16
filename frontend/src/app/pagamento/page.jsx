"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_ENDPOINTS } from '../../config/api';

export default function PagamentoPage() {
  const [qrcodeData, setQrcodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(300);
  const router = useRouter();

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    const carrinhoData = localStorage.getItem('carrinho');

    console.log('Dados do localStorage:', { usuarioData, carrinhoData });

    if (!usuarioData || !carrinhoData) {
      console.log('Redirecionando para login - dados ausentes');
      router.push('/login');
      return;
    }

    const usuario = JSON.parse(usuarioData);
    const carrinho = JSON.parse(carrinhoData);

    console.log('Dados parseados:', { usuario, carrinho });

    if (carrinho.length === 0) {
      console.log('Redirecionando para carrinho - carrinho vazio');
      router.push('/carrinho');
      return;
    }

    gerarQRCode(usuario.id || 'anonymous', carrinho);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          router.push('/carrinho');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const gerarQRCode = async (usuarioId, carrinho) => {
    try {
      setLoading(true);
      
      const usuarioData = localStorage.getItem('usuario');
      const carrinhoData = localStorage.getItem('carrinho');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      const itens = carrinhoData ? JSON.parse(carrinhoData) : [];
      
      const requestData = {
        usuario_id: usuario?.id || usuarioId,
        usuario_nome: usuario?.nome || '',
        usuario_email: usuario?.email || '',
        itens
      };
      
      console.log('Enviando requisição com dados de teste:', requestData);
      
      const response = await fetch(API_ENDPOINTS.PAGAMENTO_GERAR_QRCODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(requestData),
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro bruto da API:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('Erro da API (JSON):', errorData);
        } catch (e) {
          console.error('Resposta não é JSON válido:', errorText);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const raw = await response.text();
        throw new Error(`Resposta não JSON da API: ${raw.slice(0, 200)}`);
      }
      const data = await response.json();
      console.log('Resposta da API:', data);

      if (data.sucesso) {
        setQrcodeData(data);
        localStorage.setItem('pedido_atual', data.pedido_id);
        iniciarVerificacaoAutomatica(data.pedido_id);
      } else {
        alert('Erro ao gerar QR Code: ' + (data.erro || 'Erro desconhecido'));
        router.push('/carrinho');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão: ' + error.message);
      router.push('/carrinho');
    } finally {
      setLoading(false);
    }
  };

  const iniciarVerificacaoAutomatica = (pedidoId) => {
    const verificarInterval = setInterval(async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PAGAMENTO_VERIFICAR(pedidoId));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ct = response.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const raw = await response.text();
          throw new Error(`Resposta não JSON da verificação: ${raw.slice(0, 200)}`);
        }
        const data = await response.json();

        if (data.sucesso && (data.status === 'pago' || data.status === 'concluido')) {
          clearInterval(verificarInterval);
          setVerificando(false);
          
          localStorage.removeItem('carrinho');
          localStorage.removeItem('pedido_atual');
          
          alert('Pagamento confirmado! Seu pedido está sendo preparado.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 10000);

    return () => clearInterval(verificarInterval);
  };

  const verificarPagamentoManual = async () => {
    if (!qrcodeData) return;
    
    setVerificando(true);
    try {
      const response = await fetch(API_ENDPOINTS.PAGAMENTO_VERIFICAR(qrcodeData.pedido_id));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const raw = await response.text();
        throw new Error(`Resposta não JSON da verificação: ${raw.slice(0, 200)}`);
      }
      const data = await response.json();

      if (data.sucesso) {
        if (data.status === 'pago' || data.status === 'concluido') {
          localStorage.removeItem('carrinho');
          localStorage.removeItem('pedido_atual');
          
          alert('Pagamento confirmado! Seu pedido está sendo preparado.');
          router.push('/dashboard');
        } else if (data.status === 'cancelado') {
          alert('Pagamento cancelado.');
          router.push('/carrinho');
        } else {
          alert('Pagamento ainda não confirmado. Aguarde...');
        }
      } else {
        alert('Erro ao verificar pagamento.');
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setVerificando(false);
    }
  };

  const cancelarPagamento = async () => {
    if (!qrcodeData) return;
    
    if (!confirm('Tem certeza que deseja cancelar este pagamento?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.PAGAMENTO_CANCELAR(qrcodeData.pedido_id), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const raw = await response.text();
        throw new Error(`Resposta não JSON do cancelamento: ${raw.slice(0, 200)}`);
      }
      const data = await response.json();

      if (data.sucesso) {
        alert('Pagamento cancelado.');
        localStorage.removeItem('pedido_atual');
        router.push('/carrinho');
      } else {
        alert('Erro ao cancelar pagamento.');
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.');
    }
  };

  const copiarChavePix = async () => {
    if (qrcodeData?.chave_pix) {
      try {
        await navigator.clipboard.writeText(qrcodeData.chave_pix);
        alert('Chave PIX copiada com sucesso!');
      } catch (err) {
        console.error('Erro ao copiar chave:', err);
        alert('Erro ao copiar chave. Tente novamente.');
      }
    }
  };

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl magic-text-glow text-center">
          <div>Gerando QR Code...</div>
          <div className="mt-4 text-sm">
            Verifique o console do navegador para detalhes
          </div>
        </div>
      </div>
    );
  }

  if (!qrcodeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl magic-text-glow">Erro ao carregar QR Code</div>
      </div>
    );
  }

  return (
    <main className="container bg-black min-h-screen py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title text-center mb-8">Pagamento via PIX</h1>

        <div className="bg-blackvivid-light rounded-lg p-8 magic-border">
          <div className="text-center mb-8">
            <div className="bg-white p-4 rounded-lg inline-block">
              {qrcodeData.qrcode ? (
                <Image
                  src={`data:image/png;base64,${qrcodeData.qrcode}`}
                  alt="QR Code PIX"
                  width={256}
                  height={256}
                  className="rounded"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-600">QR Code não disponível</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 magic-text-glow">
              Escaneie o QR Code
            </h2>
            <p className="text-blackvivid-muted mb-4">
              Use o app do seu banco para escanear o QR Code e realizar o pagamento
            </p>

            <div className="text-3xl font-bold text-white magic-text-glow mb-2">
              R$ {parseFloat(qrcodeData.valor || qrcodeData.valor_total || 0).toFixed(2)}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-blackvivid-muted mb-4">
              <i className="fas fa-clock"></i>
              <span>Tempo restante: {formatarTempo(tempoRestante)}</span>
            </div>

            <button
              onClick={copiarChavePix}
              className="bg-blackvivid-light hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition border border-gray-800 mb-4"
            >
              <i className="fas fa-copy mr-2"></i>
              Copiar Chave PIX
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={verificarPagamentoManual}
              disabled={verificando}
              className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-lg transition magic-shadow disabled:opacity-50"
            >
              {verificando ? 'Verificando...' : 'Verificar Pagamento'}
            </button>
            
            <button
              onClick={cancelarPagamento}
              className="flex-1 bg-blackvivid-light hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition border border-gray-800"
            >
              Cancelar
            </button>
          </div>

          <div className="mt-8 p-4 bg-black rounded-lg border border-gray-800">
            <h3 className="text-white font-bold mb-2 magic-text-glow">Como pagar:</h3>
            <ol className="text-blackvivid-muted text-sm space-y-1 list-decimal list-inside">
              <li>Abra o aplicativo do seu banco</li>
              <li>Selecione a opção PIX</li>
              <li>Escolha &quot;Pagar com QR Code&quot;</li>
              <li>Escaneie o QR Code acima</li>
              <li>Confirme o pagamento do valor total</li>
              <li>Aguarde a confirmação (automática ou clique em &quot;Verificar Pagamento&quot;)</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
