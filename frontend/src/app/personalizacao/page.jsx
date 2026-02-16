"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Extras from '@/components/Extras';
import { API_ENDPOINTS } from '@/config/api';

const adicionaisDisponiveis = [
    { nome: 'Molho Tasty', preco: 2.00, imagem: '/assets/adicionais/molho_tasty.png' },
    { nome: 'Cebola fresca', preco: 1.00, imagem: '/assets/adicionais/cebola.png' },
    { nome: 'Alface', preco: 0.50, imagem: '/assets/adicionais/alface.png' },
    { nome: 'Bacon', preco: 3.00, imagem: '/assets/adicionais/bacon.png' },
    { nome: 'Carne', preco: 5.00, imagem: '/assets/adicionais/carne.png' },
    { nome: 'Queijo', preco: 2.50, imagem: '/assets/adicionais/queijo.png' },
];

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export default function PaginaPersonalizar() {
    const router = useRouter();

    const [lanche, setLanche] = useState(null);
    const [adicionais, setAdicionais] = useState({});
    const [precoTotal, setPrecoTotal] = useState(0);
    const [estaEditando, setEstaEditando] = useState(false);

    useEffect(() => {
        const itemParaEditar = JSON.parse(localStorage.getItem('itemParaEditar'));
        const lancheNovo = JSON.parse(localStorage.getItem('lancheParaPersonalizar'));

        let itemBase = null;
        let quantidadesIniciais = {};

        adicionaisDisponiveis.forEach(adicional => {
            quantidadesIniciais[adicional.nome] = 0;
        });

        if (itemParaEditar) {
            itemBase = itemParaEditar;
            setEstaEditando(true);

            itemParaEditar.adicionais.forEach(adicional => {
                quantidadesIniciais[adicional.nome] = adicional.quantidade;
            });
        } else if (lancheNovo) {
            itemBase = {
                ...lancheNovo,
                precoBase: lancheNovo.preco,
                descricao: "Experimente essa combinação que está irresistível!",
            };
            setEstaEditando(false);
        } else {
            router.push('/');
            return;
        }

        setLanche(itemBase);
        setAdicionais(quantidadesIniciais);

    }, [router]);

    useEffect(() => {
        if (!lanche) return;

        let total = Number(lanche.precoBase);

        adicionaisDisponiveis.forEach(adicional => {
            const quantidade = adicionais[adicional.nome] || 0;
            total += adicional.preco * quantidade;
        });

        setPrecoTotal(total);

    }, [lanche, adicionais]);

    const mudarQuantidadeAdicional = (nomeAdicional, novaQuantidade) => {
        setAdicionais(adicionaisAnteriores => ({
            ...adicionaisAnteriores,
            [nomeAdicional]: novaQuantidade
        }));
    };

    const salvarNoCarrinho = async () => {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

        const adicionaisSelecionados = adicionaisDisponiveis
            .filter(adicional => adicionais[adicional.nome] > 0)
            .map(adicional => ({
                nome: adicional.nome,
                quantidade: adicionais[adicional.nome]
            }));

        const itemParaSalvar = {
            id: estaEditando ? lanche.id : Date.now(),
            nome: lanche.nome,
            imagem: lanche.imagem,
            precoBase: lanche.precoBase,
            precoTotalUnitario: precoTotal,
            quantidade: estaEditando ? lanche.quantidade : 1,
            adicionais: adicionaisSelecionados
        };

        let novoCarrinho;

        if (estaEditando) {
            novoCarrinho = carrinho.map(item =>
                item.id === itemParaSalvar.id ? itemParaSalvar : item
            );
            localStorage.removeItem('itemParaEditar');
        } else {
            novoCarrinho = [...carrinho, itemParaSalvar];
        }

        localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
        
        try {
            const usuarioData = localStorage.getItem('usuario');
            const usuario = usuarioData ? JSON.parse(usuarioData) : null;
            
            if (usuario) {
                const pedidoData = {
                    usuario_id: usuario.id,
                    usuario_nome: usuario.nome,
                    usuario_email: usuario.email,
                    itens: novoCarrinho.map(item => ({
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
                    console.log('Pedido criado com sucesso:', result);
                    localStorage.setItem('pedido_atual', JSON.stringify(result.pedido));
                } else {
                    console.error('Erro ao criar pedido:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
        router.push('/carrinho');
    };

    if (!lanche) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl magic-text-glow">Carregando...</div>;
    }

    return (
        <main className="container mx-auto px-4 py-12 bg-black min-h-screen">
            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 text-center">
                    <Image src={lanche.imagem} alt={lanche.nome} width={400} height={400} className="mx-auto object-cover rounded-lg" />
                    <h1 className="text-4xl font-bold mt-4 text-white magic-text-glow">{lanche.nome}</h1>
                    <p className="text-blackvivid-muted mt-2 text-lg">{lanche.descricao}</p>
                    <p className="text-white text-3xl font-bold my-4 magic-text-glow">{formatarPreco(precoTotal)}</p>
                    <button
                        onClick={salvarNoCarrinho}
                        className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-16 rounded-lg text-lg transition magic-shadow w-full"
                    >
                        {estaEditando ? 'Salvar Alterações' : 'Adicionar ao carrinho'}
                    </button>
                </div>

                <div className="flex-1">
                    <div className="bg-blackvivid-light p-6 rounded-lg magic-border">
                        <h2 className="text-white font-bold text-xl mb-2 magic-text-glow">Personalize seu Aevy Burger</h2>
                        <p className="text-blackvivid-muted text-sm mb-4">Adicione os ingredientes de sua preferência</p>

                        <div className="flex flex-col gap-2">
                            {adicionaisDisponiveis.map(adicional => (
                                <Extras
                                    key={adicional.nome}
                                    adicional={adicional}
                                    quantidade={adicionais[adicional.nome] || 0}
                                    aoMudarQuantidade={mudarQuantidadeAdicional}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}