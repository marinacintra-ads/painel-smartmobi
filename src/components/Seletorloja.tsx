import { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Puxando do seu arquivo correto!

interface Loja {
  id: number;
  nome: string;
}

export function SeletorLoja() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<number | string>('');

  useEffect(() => {
    async function buscarLojas() {
      const { data, error } = await supabase
        .from('lojas')
        .select('id, nome')
        .order('id', { ascending: true });

      if (error) {
        console.error("Erro ao buscar lojas:", error);
      } else if (data) {
        setLojas(data);
        if (data.length > 0) {
          setLojaSelecionada(data[0].id);
        }
      }
    }

    buscarLojas();
  }, []);

  return (
    <div className="p-5 bg-gray-100 rounded-lg mb-5 shadow-sm">
      <h2 className="m-0 mb-3 text-lg font-bold text-gray-800">
        Painel Gerencial - Visão por Unidade
      </h2>
      
      <select 
        value={lojaSelecionada} 
        onChange={(e) => setLojaSelecionada(Number(e.target.value))}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {lojas.map((loja) => (
          <option key={loja.id} value={loja.id}>
            {loja.nome}
          </option>
        ))}
      </select>

      <p className="mt-3 text-sm text-gray-500">
        ID da unidade visualizada agora: <strong className="text-gray-700">{lojaSelecionada}</strong>
      </p>
    </div>
  );
}