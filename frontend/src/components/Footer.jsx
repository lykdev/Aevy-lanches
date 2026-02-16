import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20 py-10 border-t border-gray-800">
      <div className="container mx-auto px-4 flex justify-center items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/">
            Aevy <span className="text-white">•</span> Burger
          </Link>
        </div>
        
      </div>
    </footer>
  );
}