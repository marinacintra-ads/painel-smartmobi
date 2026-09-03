import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

// --- ÍCONES REUTILIZÁVEIS (SVGs) ---
const Icons = {
  Dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  PDV: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Produtos: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Estoque: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Logout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Money: <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Boxes: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const [lojas, setLojas] = useState<any[]>([]);
  const [lojaAtiva, setLojaAtiva] = useState<number>(0); 
  const [produtosLista, setProdutosLista] = useState<any[]>([]);
  const [estoqueLista, setEstoqueLista] = useState<any[]>([]);
  const [vendasLista, setVendasLista] = useState<any[]>([]);

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [salvando, setSalvando] = useState(false);
  
  const [codigoBuscado, setCodigoBuscado] = useState('');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [totalVenda, setTotalVenda] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  const cdLoja = lojas.find(l => String(l.nome).toLowerCase().includes('centro de distribui'));
  const cdId = cdLoja ? cdLoja.id : null;

  const handleMudarLoja = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novaLojaId = Number(e.target.value);
    setLojaAtiva(novaLojaId);
    if (activeView === 'produtos' && novaLojaId !== cdId) {
      setActiveView('dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aqui estava o erro! Removemos o "data" pois ele não tem uso no código
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Erro ao acessar: ' + error.message);
    } else {
      setIsLoggedIn(true);
    }
    setLoading(false);
  };

  const carregarDadosGerenciais = async () => {
    const { data: dataLojas } = await supabase.from('lojas').select('*').order('id');
    if (dataLojas) setLojas(dataLojas);

    const { data: dataProdutos } = await supabase.from('produtos').select('*');
    if (dataProdutos) setProdutosLista(dataProdutos);

    const { data: dataEstoque } = await supabase.from('estoque').select('*');
    if (dataEstoque) setEstoqueLista(dataEstoque);

    const { data: dataVendas } = await supabase.from('vendas').select('*');
    if (dataVendas) setVendasLista(dataVendas);
  };

  useEffect(() => {
    if (isLoggedIn) {
      carregarDadosGerenciais();
      const interval = setInterval(carregarDadosGerenciais, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const capitalTotal = estoqueLista
    .filter(item => lojaAtiva === 0 || item.loja_id === lojaAtiva)
    .reduce((acc, itemEstoque) => {
      const produto = produtosLista.find(p => p.id === itemEstoque.produto_id);
      const preco = produto ? Number(produto.preco) : 0;
      return acc + (itemEstoque.quantidade * preco);
  }, 0);

  const volumeTotal = estoqueLista
    .filter(item => lojaAtiva === 0 || item.loja_id === lojaAtiva)
    .reduce((acc, item) => acc + item.quantidade, 0);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCodigo(valor);
    const produtoEncontrado = produtosLista.find(p => p.codigo_barras === valor);
    if (produtoEncontrado) {
      setNome(produtoEncontrado.nome);
      setPreco(produtoEncontrado.preco.toString().replace('.', ','));
    } else {
      setNome('');
      setPreco('');
    }
  };

  const handleProdutoNoCD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdId) return;
    setSalvando(true);
    const qtdNum = parseInt(quantidade);

    let produtoAtual = produtosLista.find(p => p.codigo_barras === codigo);

    if (!produtoAtual) {
      const { data: novoProduto, error: erroProd } = await supabase.from('produtos').insert([
        { codigo_barras: codigo, nome, preco: parseFloat(preco.replace(',', '.')) }
      ]).select().single();
      
      if (erroProd) {
        alert('Erro ao salvar produto: ' + erroProd.message);
        setSalvando(false);
        return;
      }
      produtoAtual = novoProduto;
    }

    const estoqueNoCD = estoqueLista.find(e => e.loja_id === cdId && e.produto_id === produtoAtual?.id);
    if (estoqueNoCD) {
      await supabase.from('estoque').update({ quantidade: estoqueNoCD.quantidade + qtdNum }).eq('id', estoqueNoCD.id);
    } else {
      await supabase.from('estoque').insert([{ loja_id: cdId, produto_id: produtoAtual.id, quantidade: qtdNum }]);
    }

    alert(`Operação concluída com sucesso!`);
    setCodigo(''); setNome(''); setPreco(''); setQuantidade('1');
    carregarDadosGerenciais();
    setSalvando(false);
  };

  const handleTransferenciaParaLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lojaAtiva === 0 || lojaAtiva === cdId) return;
    setSalvando(true);
    
    const qtdNum = parseInt(quantidade);
    const produtoExistente = produtosLista.find(p => p.codigo_barras === codigo);

    if (!produtoExistente) {
      alert("Produto não existe no sistema.");
      setSalvando(false);
      return;
    }

    const estoqueNoCD = estoqueLista.find(e => e.loja_id === cdId && e.produto_id === produtoExistente.id);
    
    if (!estoqueNoCD || estoqueNoCD.quantidade < qtdNum) {
      alert(`Estoque insuficiente no CD! Disponível: ${estoqueNoCD ? estoqueNoCD.quantidade : 0}`);
      setSalvando(false);
      return;
    }

    await supabase.from('estoque').update({ quantidade: estoqueNoCD.quantidade - qtdNum }).eq('id', estoqueNoCD.id);

    const estoqueNaLoja = estoqueLista.find(e => e.loja_id === lojaAtiva && e.produto_id === produtoExistente.id);
    if (estoqueNaLoja) {
      await supabase.from('estoque').update({ quantidade: estoqueNaLoja.quantidade + qtdNum }).eq('id', estoqueNaLoja.id);
    } else {
      await supabase.from('estoque').insert([{ loja_id: lojaAtiva, produto_id: produtoExistente.id, quantidade: qtdNum }]);
    }
    
    alert(`Transferência realizada com sucesso!`);
    setCodigo(''); setNome(''); setPreco(''); setQuantidade('1');
    carregarDadosGerenciais();
    setSalvando(false);
  };

  const handleAdicionarAoCarrinho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBuscado.trim()) return;
    const produtoEncontrado = produtosLista.find(p => p.codigo_barras === codigoBuscado);
    if (!produtoEncontrado) {
      alert('Produto não localizado.');
    } else {
      setCarrinho([...carrinho, produtoEncontrado]);
      setTotalVenda((prev) => prev + Number(produtoEncontrado.preco));
      setCodigoBuscado('');
    }
  };

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) return;
    if (lojaAtiva === 0 || lojaAtiva === cdId) {
      alert('Selecione um caixa de Loja Física.');
      return;
    }
    setFinalizando(true);
    const { error } = await supabase.from('vendas').insert([{
      codigo_venda: `V-${Date.now()}`,
      valor_total: totalVenda,
      status: 'FINALIZADA',
      forma_pagamento: 'BALCAO',
      loja_id: lojaAtiva 
    }]);

    if (!error) {
      alert(`Venda registrada com sucesso!`);
      setCarrinho([]);
      setTotalVenda(0);
      carregarDadosGerenciais();
    } else {
      alert('Erro ao registrar venda.');
    }
    setFinalizando(false);
  };

  const obterEstoqueExibicao = () => {
    if (lojaAtiva === 0) {
      const mapa = new Map();
      estoqueLista.forEach(e => {
        const atual = mapa.get(e.produto_id) || 0;
        mapa.set(e.produto_id, atual + e.quantidade);
      });
      return Array.from(mapa.entries()).map(([prodId, qtd]) => {
        const p = produtosLista.find(prod => prod.id === prodId);
        return p ? { ...p, quantidade: qtd, nome_loja: 'Todas', loja_id: 0 } : null;
      }).filter(Boolean);
    } else if (lojaAtiva === cdId) {
      return estoqueLista.map(e => {
        const p = produtosLista.find(prod => prod.id === e.produto_id);
        const l = lojas.find(loja => loja.id === e.loja_id);
        return p && l ? { ...p, quantidade: e.quantidade, nome_loja: l.nome, loja_id: l.id } : null;
      }).filter(Boolean);
    } else {
      return estoqueLista.filter(e => e.loja_id === lojaAtiva).map(e => {
        const p = produtosLista.find(prod => prod.id === e.produto_id);
        return p ? { ...p, quantidade: e.quantidade, nome_loja: '', loja_id: lojaAtiva } : null;
      }).filter(Boolean);
    }
  };

  // --- COMPONENTES VISUAIS AUXILIARES ---
  const NavButton = ({ id, icon, label }: { id: string, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => setActiveView(id)} 
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
        activeView === id 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20 translate-x-1' 
          : 'hover:bg-white/5 text-slate-300 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  if (isLoggedIn) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
        
        {/* BARRA LATERAL REDESENHADA */}
        <aside className="w-72 bg-[#0B0F19] text-white flex flex-col shadow-2xl z-20 border-r border-slate-800">
          <div className="p-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="text-2xl font-bold tracking-tight">SmartMobi<span className="font-light text-blue-400">Pdv</span></div>
          </div>
          
          <div className="px-6 pb-6 border-b border-slate-800/50">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Unidade de Operação</label>
            <div className="relative">
              <select
                value={lojaAtiva}
                onChange={handleMudarLoja}
                className="w-full bg-[#1A202C] text-slate-200 border border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value={0}>Visão Global (Rede)</option>
                {lojas.map(loja => (
                  <option key={loja.id} value={loja.id}>{loja.nome}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <NavButton id="dashboard" icon={Icons.Dashboard} label="Visão Geral" />
            <NavButton id="pdv" icon={Icons.PDV} label="Frente de Caixa" />
            {lojaAtiva === cdId && (
              <NavButton id="produtos" icon={Icons.Produtos} label="Criação de Produtos" />
            )}
            <NavButton id="estoque" icon={Icons.Estoque} label="Estoque & Logística" />
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors font-medium text-sm">
              {Icons.Logout} Sair do Sistema
            </button>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 overflow-y-auto">
          {/* HEADER SUPERIOR INVISÍVEL PARA DAR RESPIRO */}
          <div className="h-24 px-10 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeView === 'dashboard' && 'Visão Geral'}
                {activeView === 'pdv' && 'Frente de Caixa'}
                {activeView === 'produtos' && 'Gestão de Produtos'}
                {activeView === 'estoque' && 'Controle de Estoque'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {lojaAtiva === 0 ? "Visão Global da Rede" : lojas.find(l => l.id === lojaAtiva)?.nome}
              </p>
            </div>
          </div>

          <div className="p-10 max-w-7xl mx-auto animate-fade-in">
            
            {/* DASHBOARD */}
            {activeView === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CARD PREMIUM 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      {Icons.Money}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capital Imobilizado</p>
                      <h3 className="text-4xl font-black text-slate-800">R$ {capitalTotal.toFixed(2).replace('.', ',')}</h3>
                    </div>
                  </div>

                  {/* CARD PREMIUM 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      {Icons.Boxes}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Volume em Estoque</p>
                      <h3 className="text-4xl font-black text-slate-800">{volumeTotal} <span className="text-lg font-medium text-slate-400">itens</span></h3>
                    </div>
                  </div>
                </div>

                {lojaAtiva === 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Faturamento por Unidade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {lojas.filter(l => l.id !== cdId).map(loja => {
                        const vendasDaLoja = vendasLista.filter(v => v.loja_id === loja.id);
                        const valorTotal = vendasDaLoja.reduce((acc, v) => acc + Number(v.valor_total), 0);
                        return (
                          <div key={loja.id} className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-6 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h4 className="font-bold text-slate-700 text-lg mb-4">{loja.nome}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Receita Hoje</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">R$ {valorTotal.toFixed(2).replace('.', ',')}</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-500">{vendasDaLoja.length} cupons emitidos</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FRENTE DE CAIXA POLIDA */}
            {activeView === 'pdv' && (
              <div className="flex gap-8 h-[calc(100vh-12rem)]">
                <div className="flex-1 flex flex-col">
                  {lojaAtiva === 0 || lojaAtiva === cdId ? (
                     <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center bg-white/50">
                       <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">Caixa Indisponível</h3>
                       <p className="text-slate-500 max-w-sm">Selecione uma loja física no menu lateral para iniciar as vendas.</p>
                     </div>
                  ) : (
                    <>
                      <form onSubmit={handleAdicionarAoCarrinho} className="mb-6 flex gap-4">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </div>
                          <input type="text" value={codigoBuscado} onChange={(e) => setCodigoBuscado(e.target.value)} className="w-full pl-12 pr-5 py-4 text-lg bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all" placeholder="Bipe o código de barras do produto..." autoFocus />
                        </div>
                        <button type="submit" className="px-8 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl shadow-sm transition-transform active:scale-95">Inserir</button>
                      </form>
                      
                      <div className="flex-1 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col">
                        <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">Cupom Eletrônico</span>
                          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{carrinho.length} itens</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {carrinho.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                              {Icons.PDV}
                              <p className="mt-4 font-medium">Aguardando produtos...</p>
                            </div>
                          ) : (
                            carrinho.map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                                <div><p className="font-bold text-slate-700 text-lg">{item.nome}</p></div>
                                <div className="font-black text-indigo-600 text-xl">R$ {Number(item.preco).toFixed(2).replace('.', ',')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="w-96 flex flex-col">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl text-white p-8 mb-6 flex flex-col justify-center h-56 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-3 z-10">Total a Pagar</p>
                    <h1 className="text-6xl font-black tracking-tighter z-10">
                      <span className="text-3xl text-slate-500 mr-1">R$</span>
                      {totalVenda.toFixed(2).replace('.', ',')}
                    </h1>
                  </div>
                  <button onClick={handleFinalizarVenda} disabled={carrinho.length === 0 || finalizando} className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-3xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2">
                    {finalizando ? 'Processando...' : (
                      <>Finalizar Compra <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* FORMULÁRIOS DE CRIAÇÃO E ESTOQUE */}
            {activeView === 'produtos' && lojaAtiva === cdId && (
              <div className="max-w-4xl animate-fade-in">
                <form onSubmit={handleProdutoNoCD} className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Código de Barras</label>
                      <input type="text" value={codigo} onChange={handleCodigoChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono" required placeholder="00000000" autoFocus />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Descrição do Produto</label>
                      <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled={produtosLista.some(p => p.codigo_barras === codigo)} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400 transition-all" required placeholder="Ex: Monitor Dell 24" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Preço Unit. (R$)</label>
                      <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} disabled={produtosLista.some(p => p.codigo_barras === codigo)} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400 transition-all" required placeholder="0,00" />
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Qtd. Inicial (Centro de Distribuição)</label>
                      <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full px-4 py-3.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold text-lg" min="1" required />
                    </div>
                    <button type="submit" disabled={salvando || !codigo} className="px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 disabled:opacity-50">
                      {produtosLista.some(p => p.codigo_barras === codigo) ? "Dar Entrada de Estoque" : "Cadastrar e Alocar Estoque"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ABA ESTOQUE - TABELAS CLEAN UI */}
            {activeView === 'estoque' && (
              <div className="animate-fade-in space-y-8">
                
                {lojaAtiva !== 0 && lojaAtiva !== cdId && (
                  <form onSubmit={handleTransferenciaParaLoja} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 border-l-4 border-l-indigo-500">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      Solicitar Transferência do CD
                    </h3>
                    <div className="flex gap-4 items-end">
                      <div className="w-1/3">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Cód. Barras</label>
                        <input type="text" value={codigo} onChange={handleCodigoChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono text-sm" required placeholder="Bipe o item..." />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Produto</label>
                        <input type="text" value={nome} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm" readOnly placeholder="Automático..." />
                      </div>
                      <div className="w-1/4">
                        <label className="block text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-wider">Quantidade</label>
                        <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-sm" min="1" required />
                      </div>
                      <button type="submit" disabled={salvando || !nome} className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 text-sm">
                        Puxar Item
                      </button>
                    </div>
                  </form>
                )}

                {lojaAtiva === cdId ? (
                  [...lojas].sort((a, b) => (a.id === cdId ? -1 : b.id === cdId ? 1 : a.nome.localeCompare(b.nome))).map(loja => {
                      const itens = obterEstoqueExibicao().filter((item: any) => item.loja_id === loja.id);
                      if (itens.length === 0) return null;
                      
                      const isCD = loja.id === cdId;
                      return (
                        <div key={loja.id} className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                          <div className={`p-5 flex justify-between items-center ${isCD ? 'bg-indigo-50/50 border-b border-indigo-100' : 'bg-slate-50/50 border-b border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCD ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                {isCD ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                              </div>
                              <span className={`font-bold text-sm ${isCD ? 'text-indigo-900' : 'text-slate-700'}`}>{loja.nome}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isCD ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                              {itens.length} SKUs
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100 bg-white">
                                  <th className="px-6 py-4 font-bold">Código</th>
                                  <th className="px-6 py-4 font-bold">Produto</th>
                                  <th className="px-6 py-4 font-bold">Preço Unit.</th>
                                  <th className="px-6 py-4 font-bold text-right">Qtd</th>
                                </tr>
                              </thead>
                              <tbody>
                                {itens.map((item: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.codigo_barras}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">{item.nome}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">R$ {Number(item.preco).toFixed(2).replace('.', ',')}</td>
                                    <td className="px-6 py-4 text-right">
                                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold ${isCD ? 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'} transition-colors`}>
                                        {item.quantidade}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    <div className="p-5 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-700">Inventário Consolidado</span>
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {obterEstoqueExibicao().length} SKUs
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100 bg-white">
                            <th className="px-6 py-4 font-bold">Código</th>
                            <th className="px-6 py-4 font-bold">Produto</th>
                            <th className="px-6 py-4 font-bold">Preço Unit.</th>
                            <th className="px-6 py-4 font-bold text-right">Qtd</th>
                          </tr>
                        </thead>
                        <tbody>
                          {obterEstoqueExibicao().length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Nenhum registro encontrado.</td></tr>
                          ) : (
                            obterEstoqueExibicao().map((item: any, idx) => (
                              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.codigo_barras}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{item.nome}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">R$ {Number(item.preco).toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors">
                                    {item.quantidade}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans bg-white">
      <div className="hidden md:flex md:w-[55%] relative bg-cover bg-center" style={{ backgroundImage: "url('/SmartMobiPDV3.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B35]/95 via-[#1A0B35]/75 to-[#1A0B35]/30"></div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white h-full max-w-2xl">
          <div className="mb-6"><span className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">Gestão Conectada</span></div>
          <h1 className="text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight drop-shadow-md">Seu PDV inteiro,<br />na palma da mão.</h1>
          <p className="text-lg text-gray-200 mb-10 max-w-md leading-relaxed drop-shadow">Produtos, estoque e vendas unidos em uma operação simples, segura e inteligente.</p>
        </div>
      </div>
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Painel Administrativo</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Acesso ao Sistema</h2>
            <p className="text-slate-500 text-sm">Insira suas credenciais para continuar.</p>
          </div>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 transition-all text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 transition-all text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl mt-4 transition-transform active:scale-95 shadow-lg shadow-slate-900/20">
              {loading ? 'Autenticando...' : 'Entrar no painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;