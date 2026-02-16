"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BurgerCard({ lanche }) {
  const router = useRouter();

  const precoFormatado = Number(lanche.preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const handleSelectLanche = () => {
    const imageUrl = `/assets/burgers/burger${lanche.id}.png`;

    const lancheSelecionado = {
      nome: lanche.nome,
      imagem: imageUrl,
      preco: lanche.preco
    };
    localStorage.removeItem('itemParaEditar');
    localStorage.removeItem('lancheParaPersonalizar');
    localStorage.setItem('lancheParaPersonalizar', JSON.stringify(lancheSelecionado));
    router.push('/personalizacao');
  };
  const imageUrl = `/assets/burgers/burger${lanche.id}.png`;
  return (
    <div 
      onClick={handleSelectLanche} 
      className="bg-blackvivid-light rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 magic-border magic-shadow"
    >
      <div 
        className="w-full h-[220px] relative bg-black flex items-center justify-center p-5"
      >
        <Image
          src={imageUrl}
          alt={lanche.nome}
          width={400} 
          height={400} 
          className="w-full h-full" 
          style={{ objectFit: "contain" }} 
          quality={100}
        />
      </div>
      <div 
        className="relative -mt-[50px] pt-[60px] px-[30px] pb-[30px]"
      >
        <div className="text-sm text-blackvivid-muted">Tradicional</div>
        <div className="text-3xl font-bold text-white my-2">{lanche.nome}</div>
        <div className="text-sm text-blackvivid-muted h-14 line-clamp-3 mb-2">{lanche.descricao}</div>
        <div className="text-3xl font-bold text-white mt-2 magic-text-glow">{precoFormatado}</div>
      </div>
    </div>
  );
}