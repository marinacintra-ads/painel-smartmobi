import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { SeletorLoja } from './components/SeletorLoja'; // <-- NOSSA NOVA IMPORTAÇÃO AQUI

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [salvando, setSalvando] = useState(false);
  const [produtosLista, setProdutosLista] = useState<any[]>([]);

  const [codigoBuscado, setCodigoBuscado] = useState('');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [totalVenda, setTotalVenda] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Erro ao acessar: ' + error.message);
    } else {
      setIsLoggedIn(true);
      setUserId(data.user.id);
    }
    setLoading(false);
  };

  const carregarProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false });
    if (data) setProdutosLista(data);
  };

  useEffect(() => {
    if (isLoggedIn) carregarProdutos();
  }, [isLoggedIn]);

  const handleCadastrarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from('produtos').insert([
      { 
        codigo_barras: codigo, 
        nome, 
        preco: parseFloat(preco.replace(',', '.')), 
        estoque_atual: parseInt(quantidade) 
      }
    ]);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setCodigo(''); setNome(''); setPreco(''); setQuantidade('1');
      carregarProdutos();
    }
    setSalvando(false);
  };

  const handleAdicionarAoCarrinho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBuscado.trim()) return;

    const { data, error } = await supabase.from('produtos').select('*').eq('codigo_barras', codigoBuscado).single();

    if (error || !data) {
      alert('⚠️ Produto não encontrado no estoque!');
    } else if (data.estoque_atual <= 0) {
      alert('⚠️ Atenção: Produto sem estoque no banco de dados!');
    } else {
      setCarrinho([...carrinho, data]);
      setTotalVenda((prev) => prev + Number(data.preco));
      setCodigoBuscado('');
    }
  };

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0 || !userId) return;
    setFinalizando(true);

    const contagemItens: Record<string, number> = {};
    carrinho.forEach(item => {
      contagemItens[item.id] = (contagemItens[item.id] || 0) + 1;
    });

    const itensParaVenda = Object.keys(contagemItens).map(id => ({
      produto_id: id,
      quantidade: contagemItens[id]
    }));

    const { data, error } = await supabase.rpc('finalizar_venda', {
      p_usuario_id: userId,
      p_itens: itensParaVenda
    });

    if (error) {
      alert('Erro crítico ao finalizar venda: ' + error.message);
    } else {
      alert(`Venda finalizada com sucesso!\nCódigo: ${data.codigo_venda}\nTotal: R$ ${data.valor_total.toFixed(2).replace('.', ',')}`);
      setCarrinho([]);
      setTotalVenda(0);
      carregarProdutos();
    }
    setFinalizando(false);
  };

  if (isLoggedIn) {
    return (
      <div className="flex h-screen bg-[var(--color-mobi-bg)] font-sans">
        <aside className="w-64 bg-[var(--color-mobi-purple)] text-[var(--color-mobi-white)] flex flex-col shadow-xl z-10">
          <div className="p-6 text-2xl font-bold tracking-tight border-b border-[#442080]">
            SmartMobi<span className="font-light">Pdv</span>
          </div>
          <nav className="flex-1 p-4 space-y-2 mt-4">
            <button onClick={() => setActiveView('dashboard')} className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${activeView === 'dashboard' ? 'bg-[#442080]' : 'hover:bg-[#442080] text-gray-300'}`}>Visão Geral</button>
            <button onClick={() => setActiveView('pdv')} className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${activeView === 'pdv' ? 'bg-[#442080]' : 'hover:bg-[#442080] text-gray-300'}`}>Frente de Caixa</button>
            <button onClick={() => setActiveView('estoque')} className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${activeView === 'estoque' ? 'bg-[#442080]' : 'hover:bg-[#442080] text-gray-300'}`}>Estoque</button>
          </nav>
          <div className="p-4 border-t border-[#442080]">
            <button onClick={() => setIsLoggedIn(false)} className="w-full text-left p-3 rounded-lg hover:bg-red-500 transition-colors font-medium text-sm">Sair do Sistema</button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* NOSSO SELETOR DE LOJAS GLOBAL ESTÁ AQUI */}
          {activeView !== 'pdv' && <SeletorLoja />}

          {activeView === 'dashboard' && (
            <div className="max-w-6xl mx-auto flex flex-col h-full animate-fade-in">
              <header className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-mobi-purple)] tracking-tight">Visão Geral</h2>
                <p className="mt-2 text-gray-500 font-medium">Acompanhe os indicadores do seu negócio em tempo real.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Capital em Estoque</p>
                    <h3 className="text-3xl font-bold text-[var(--color-mobi-purple)]">
                      R$ {produtosLista.reduce((acc, item) => acc + (Number(item.preco) * Number(item.estoque_atual)), 0).toFixed(2).replace('.', ',')}
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Volume de Produtos</p>
                    <h3 className="text-3xl font-bold text-[var(--color-mobi-purple)]">
                      {produtosLista.reduce((acc, item) => acc + Number(item.estoque_atual), 0)} <span className="text-lg font-medium text-gray-400">unidades totais</span>
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h4 className="text-xl font-bold text-gray-700 mb-2">Relatórios em Tempo Real</h4>
                 <p className="text-gray-500 max-w-md">O SmartMobiPDV calcula automaticamente o seu capital imobilizado com base nos produtos cadastrados no estoque.</p>
              </div>
            </div>
          )}

          {activeView === 'pdv' && (
            <div className="flex gap-6 h-full">
              <div className="flex-1 flex flex-col">
                <header className="mb-6"><h2 className="text-2xl font-bold text-[var(--color-mobi-purple)]">Frente de Caixa (PDV)</h2></header>
                <form onSubmit={handleAdicionarAoCarrinho} className="mb-6 flex gap-4">
                  <input type="text" value={codigoBuscado} onChange={(e) => setCodigoBuscado(e.target.value)} className="flex-1 px-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-mobi-primary)] shadow-sm font-mono" placeholder="Bipe ou digite o código de barras e aperte Enter..." autoFocus />
                  <button type="submit" className="px-8 bg-[var(--color-mobi-primary)] hover:bg-[var(--color-mobi-secondary)] text-white font-medium rounded-xl transition-colors shadow-sm">Adicionar</button>
                </form>
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="bg-[var(--color-mobi-bg)] p-4 border-b border-gray-100 font-medium text-[var(--color-mobi-gray)] text-sm">Lista de Compras</div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {carrinho.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400">Caixa Livre. Aguardando produtos...</div>
                    ) : (
                      <div className="space-y-3">
                        {carrinho.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div><p className="font-medium text-[var(--color-mobi-purple)]">{item.nome}</p><p className="text-xs text-gray-400 font-mono mt-1">{item.codigo_barras}</p></div>
                            <div className="font-bold text-[var(--color-mobi-primary)] text-lg">R$ {Number(item.preco).toFixed(2).replace('.', ',')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-80 flex flex-col">
                <div className="bg-[var(--color-mobi-purple)] rounded-xl shadow-lg text-white p-6 mb-6 flex flex-col justify-center items-center h-48">
                  <p className="text-mobi-bg opacity-80 uppercase tracking-widest text-sm font-medium mb-2">Total da Venda</p>
                  <h1 className="text-5xl font-bold tracking-tighter">R$ {totalVenda.toFixed(2).replace('.', ',')}</h1>
                </div>
                <button onClick={handleFinalizarVenda} disabled={carrinho.length === 0 || finalizando} className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
                  {finalizando ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
          )}

          {activeView === 'estoque' && (
            <div className="max-w-4xl">
               <header className="mb-8"><h2 className="text-2xl font-bold text-[var(--color-mobi-purple)]">Gestão de Estoque</h2></header>
              <form onSubmit={handleCadastrarProduto} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1">Código de Barras</label><input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" required /></div>
                  <div><label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1">Nome</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" required /></div>
                  <div><label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1">Preço</label><input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" required /></div>
                  <div><label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1">Quantidade</label><input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" min="0" required /></div>
                </div>
                <button type="submit" disabled={salvando} className="px-8 bg-[var(--color-mobi-primary)] text-white font-medium py-2.5 rounded-lg mt-2 hover:bg-[var(--color-mobi-secondary)] transition-colors">Adicionar Produto</button>
              </form>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-[var(--color-mobi-bg)] text-[var(--color-mobi-gray)] text-sm border-b border-gray-100"><th className="p-4 font-medium">Código</th><th className="p-4 font-medium">Produto</th><th className="p-4 font-medium">Preço</th><th className="p-4 font-medium text-center">Qtd. Estoque</th></tr></thead>
                  <tbody>
                    {produtosLista.map((prod) => (
                      <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td className="p-4 text-sm text-gray-500">{prod.codigo_barras}</td><td className="p-4 font-medium text-[var(--color-mobi-purple)]">{prod.nome}</td><td className="p-4 text-sm font-medium text-[var(--color-mobi-primary)]">R$ {Number(prod.preco).toFixed(2).replace('.', ',')}</td><td className="p-4 text-sm text-center font-bold bg-gray-50/50">{prod.estoque_atual}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-mobi-bg)] flex items-center justify-center font-sans p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-mobi-purple)] mb-2 tracking-tight">SmartMobi<span className="font-light">Pdv</span></h1>
          <p className="text-[var(--color-mobi-gray)] text-sm">Seu mercado inteligente começa aqui.</p>
        </div>
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1.5">E-mail do Administrador</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" placeholder="admin@smartmobipdv.com.br" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-mobi-gray)] mb-1.5">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-mobi-primary)]" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[var(--color-mobi-primary)] hover:bg-[var(--color-mobi-secondary)] text-white font-medium py-3 rounded-lg mt-4 shadow-sm">
            {loading ? 'Validando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;