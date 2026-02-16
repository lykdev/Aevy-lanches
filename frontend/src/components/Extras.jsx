"use client";
import Image from 'next/image';

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export default function Extras({ adicional, quantidade, aoMudarQuantidade }) {
    
    const diminuir = () => {
        aoMudarQuantidade(adicional.nome, Math.max(0, quantidade - 1));
    };

    const aumentar = () => {
        aoMudarQuantidade(adicional.nome, quantidade + 1);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-lg mb-2 magic-shadow">
            <div className="flex items-center gap-3">
                <Image src={adicional.imagem} alt={adicional.nome} width={40} height={40} className="rounded object-cover" />
                <span className="text-white">{adicional.nome}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-blackvivid-muted">{formatarPreco(adicional.preco)}</span>
                <div className="flex items-center gap-2 bg-blackvivid-light p-1 rounded magic-border">
                    <button 
                        onClick={diminuir}
                        className="text-white font-bold w-6 h-6 rounded flex items-center justify-center hover:bg-gray-700 transition"
                    >
                        -
                    </button>
                    <span className="w-6 text-center text-white">{quantidade}</span>
                    <button 
                        onClick={aumentar}
                        className="text-white font-bold w-6 h-6 rounded flex items-center justify-center hover:bg-gray-700 transition"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}