"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/config/api';

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getPrecoUnitario(item) {
    if (item && typeof item.precoTotalUnitario === 'number') return item.precoTotalUnitario;
    if (item && typeof item.precoTotalUnitario === 'string') return Number(item.precoTotalUnitario);
    if (item && typeof item.preco === 'number') return item.preco;
    if (item && typeof item.preco === 'string') return Number(item.preco);
    return 0;
}

const burgerImages = [
    '/assets/burgers/burger1.png',
    '/assets/burgers/burger2.png',
    '/assets/burgers/burger3.png',
    '/assets/burgers/burger4.png',
    '/assets/burgers/burger5.png',
    '/assets/burgers/burger6.png',
];

function getBurgerImageFallback(itemId) {
    const id = Number(itemId) || 0;
    const index = Math.abs((id * 9301 + 49297) % burgerImages.length);
    return burgerImages[index];
}

function getItemImage(item) {
    if (item && typeof item.imagem === 'string' && item.imagem.trim().length > 0) return item.imagem;
    return getBurgerImageFallback(item?.id);
}

export default function PaginaCarrinho() {
    const [carrinho, setCarrinho] = useState([]);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const carrinhoSalvo = JSON.parse(localStorage.getItem('carrinho')) || [];
        setCarrinho(carrinhoSalvo);
        calcularTotal(carrinhoSalvo);
    }, []);

    const calcularTotal = (items) => {
        const novoTotal = items.reduce((acumulador, item) => {
            const unit = getPrecoUnitario(item);
            return acumulador + (unit * item.quantidade);
        }, 0);
        setTotal(novoTotal);
        localStorage.setItem("subtotal", novoTotal);
    };

    const removerItem = (itemId) => {
        const novoCarrinho = carrinho.filter(item => item.id !== itemId);
        setCarrinho(novoCarrinho);
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        window.dispatchEvent(new Event('cartUpdated'));
        calcularTotal(novoCarrinho);
        atualizarPedido(novoCarrinho);
    };

    const atualizarPedido = async (carrinhoAtual) => {
        try {
            const usuarioData = localStorage.getItem('usuario');
            const usuario = usuarioData ? JSON.parse(usuarioData) : null;
            
            if (usuario && carrinhoAtual.length > 0) {
                const pedidoData = {
                    usuario_id: usuario.id,
                    usuario_nome: usuario.nome,
                    usuario_email: usuario.email,
                    itens: carrinhoAtual.map(item => ({
                        id: item.id,
                        nome: item.nome,
                        preco: item.precoTotalUnitario,
                        quantidade: item.quantidade
                    }))
                };

                const response = await fetch(API_ENDPOINTS.PEDIDO_CRIAR, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pedidoData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Pedido atualizado com sucesso:', result);
                    localStorage.setItem('pedido_atual', JSON.stringify(result.pedido));
                } else {
                    console.error('Erro ao atualizar pedido:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
        }
    };

    const atualizarQuantidade = (itemId, novaQuantidade) => {
        if (novaQuantidade < 1) {
            removerItem(itemId);
            return;
        }

        const novoCarrinho = carrinho.map(item =>
            item.id === itemId ? { ...item, quantidade: novaQuantidade } : item
        );
        setCarrinho(novoCarrinho);
        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        window.dispatchEvent(new Event('cartUpdated'));
        calcularTotal(novoCarrinho);
        atualizarPedido(novoCarrinho);
    };

    const limparCarrinho = () => {
        setCarrinho([]);
        localStorage.removeItem('carrinho');
        window.dispatchEvent(new Event('cartUpdated'));
        setTotal(0);
    };

    const irParaDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-black">
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={irParaDashboard}
                        className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-semibold transition magic-shadow"
                    >
                        ← Voltar ao Cardápio
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-white text-center mb-8 magic-text-glow">Carrinho Aevy Burger</h1>

                <div className="bg-blackvivid-light rounded-lg p-6 magic-border">
                    {carrinho.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-blackvivid-muted text-xl mb-6">Seu carrinho está vazio.</p>
                            <button
                                onClick={irParaDashboard}
                                className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold transition magic-shadow"
                            >
                                Ver Cardápio
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {carrinho.map(item => (
                                    <div key={item.id} className="bg-black border border-gray-800 rounded-lg p-4 magic-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-20 h-20 bg-black border border-gray-700 rounded-lg overflow-hidden">
                                                <Image
                                                    src={getItemImage(item)}
                                                    alt={item.nome}
                                                    width={80}
                                                    height={80}
                                                    className="object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/assets/heroBurger.png';
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white">{item.nome}</h3>
                                                <p className="text-blackvivid-muted text-sm">{item.descricao}</p>
                                                {Array.isArray(item.adicionais) && item.adicionais.length > 0 && (
                                                    <p className="text-blackvivid-muted text-xs mt-2">
                                                        Adicionais: {item.adicionais.map(a => `${a.nome} (x${a.quantidade})`).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-white font-semibold mt-1 magic-text-glow">
                                                    {formatarPreco(getPrecoUnitario(item))} cada
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                                    className="bg-blackvivid-light hover:bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition magic-border"
                                                >
                                                    -
                                                </button>
                                                
                                                <span className="text-white font-semibold w-8 text-center">
                                                    {item.quantidade}
                                                </span>
                                                
                                                <button
                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                                    className="bg-blackvivid-light hover:bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition magic-border"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">
                                                    {formatarPreco(getPrecoUnitario(item) * item.quantidade)}
                                                </p>
                                                <button
                                                    onClick={() => removerItem(item.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm transition"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 border-t border-gray-800 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        onClick={limparCarrinho}
                                        className="text-white hover:text-gray-300 transition"
                                    >
                                        Limpar Carrinho
                                    </button>
                                    
                                    <div className="text-2xl font-bold text-white magic-text-glow">
                                        Total: {formatarPreco(total)}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => router.push('/pagamento')}
                                    className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg text-lg transition magic-shadow"
                                >
                                    Pagar com PIX
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
