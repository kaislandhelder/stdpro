import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Minus, Archive, AlertTriangle, ArrowLeft, Edit, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categorias = ['Shampoo', 'Condicionador', 'Máscara', 'Tintura', 'Química', 'Ferramentas', 'Acessórios', 'Outros'];

const ProductForm = ({ onSave, onCancel, playSound, productToEdit }) => {
    const [product, setProduct] = useState(
      productToEdit || { nome: '', foto: '', quantidade: 0, minimo: 5, categoria: '', preco: 0 }
    );
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const handleSave = () => {
        if (!product.nome || !product.categoria) {
            toast({ title: "Campos obrigatórios", description: "Preencha nome e categoria do produto.", variant: "destructive" });
            return;
        }
        onSave({ id: productToEdit ? product.id : Date.now(), ...product });
    };
    
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProduct(p => ({ ...p, foto: reader.result }));
                toast({ title: "🖼️ Imagem carregada!", description: "A imagem do produto foi atualizada." });
            };
            reader.readAsDataURL(file);
        } else {
            toast({ title: "Arquivo inválido", description: "Por favor, selecione um arquivo de imagem.", variant: "destructive" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-foreground">{productToEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
                <Button onClick={onCancel} variant="ghost" size="sm" className="btn-sound"><ArrowLeft className="mr-2" size={16} /> Voltar</Button>
            </div>
            <div className="luxury-card rounded-xl p-6 space-y-4">
                <div className="flex justify-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button onClick={handleImageClick} className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition-all">
                        {product.foto ? (
                            <img src={product.foto} alt="Preview do produto" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon size={40} className="mx-auto" />
                                <p className="text-xs mt-1">Adicionar Foto</p>
                            </div>
                        )}
                    </button>
                </div>
                <div><label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Produto *</label><input type="text" value={product.nome} onChange={(e) => setProduct(p => ({ ...p, nome: e.target.value }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" placeholder="Ex: Shampoo Hidratante" /></div>
                <div><label className="block text-sm font-medium text-muted-foreground mb-2">Categoria *</label><select value={product.categoria} onChange={(e) => setProduct(p => ({ ...p, categoria: e.target.value }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"><option value="">Selecione a categoria</option>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-muted-foreground mb-2">Qtd. Atual</label><input type="number" value={product.quantidade} onChange={(e) => setProduct(p => ({ ...p, quantidade: parseInt(e.target.value, 10) || 0 }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" min="0" /></div>
                    <div><label className="block text-sm font-medium text-muted-foreground mb-2">Estoque Mínimo</label><input type="number" value={product.minimo} onChange={(e) => setProduct(p => ({ ...p, minimo: parseInt(e.target.value, 10) || 1 }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" min="1" /></div>
                </div>
                <div><label className="block text-sm font-medium text-muted-foreground mb-2">Preço (R$)</label><input type="number" step="0.01" value={product.preco} onChange={(e) => setProduct(p => ({ ...p, preco: parseFloat(e.target.value) || 0 }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" min="0" /></div>
                <Button onClick={handleSave} className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound text-lg">
                    {productToEdit ? <Save className="mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                    {productToEdit ? 'Salvar Alterações' : 'Salvar Produto'}
                </Button>
            </div>
        </motion.div>
    );
};

const EstoqueView = ({ produtos, onUpdateQuantidade, onEdit, onDelete, onNew, playSound }) => {
    const getProdutosAcabando = () => produtos.filter(p => p.quantidade <= p.minimo && p.quantidade > 0);
    const getProdutosZerados = () => produtos.filter(p => p.quantidade === 0);

    return (
        <div className="space-y-4">
            {getProdutosZerados().length > 0 && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><h3 className="font-semibold text-red-600 mb-2 flex items-center"><AlertTriangle className="mr-2" size={20} />Produtos Zerados ({getProdutosZerados().length})</h3><div className="text-sm text-red-500">{getProdutosZerados().map(p => p.nome).join(', ')}</div></motion.div>}
            {getProdutosAcabando().length > 0 && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"><h3 className="font-semibold text-yellow-600 mb-2 flex items-center"><AlertTriangle className="mr-2" size={20} />Produtos Acabando ({getProdutosAcabando().length})</h3><div className="text-sm text-yellow-500">{getProdutosAcabando().map(p => `${p.nome} (${p.quantidade})`).join(', ')}</div></motion.div>}
            
            {produtos.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <Archive size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-2xl font-semibold text-foreground mb-2">Estoque vazio</h3>
                    <p className="text-muted-foreground mb-4">Adicione seus primeiros produtos!</p>
                    <Button onClick={onNew} className="bg-primary text-primary-foreground btn-sound"><Plus className="mr-2" size={16} /> Primeiro Produto</Button>
                </motion.div>
            ) : (
                produtos.map((produto, index) => (
                    <motion.div key={produto.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`luxury-card rounded-xl p-4 border-l-4 ${produto.quantidade === 0 ? 'border-red-500' : produto.quantidade <= produto.minimo ? 'border-yellow-500' : 'border-green-500'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => onEdit(produto)} className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-transparent hover:border-primary transition-all">
                                    {produto.foto ? (
                                        <img src={produto.foto} alt={produto.nome} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-muted-foreground" size={32} />
                                    )}
                                </button>
                                <div>
                                    <h4 className="font-bold text-foreground text-lg">{produto.nome}</h4>
                                    <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                                    {produto.preco > 0 && <p className="text-sm text-green-600 font-medium">R$ {produto.preco.toFixed(2)}</p>}
                                </div>
                            </div>
                            <div className="text-right"><p className={`text-3xl font-bold ${produto.quantidade === 0 ? 'text-red-600' : produto.quantidade <= produto.minimo ? 'text-yellow-600' : 'text-green-600'}`}>{produto.quantidade}</p><p className="text-xs text-muted-foreground">mín: {produto.minimo}</p></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                <Button onClick={() => onUpdateQuantidade(produto.id, -1)} size="icon" variant="outline" className="w-10 h-10 text-red-600 hover:bg-red-500/10 btn-sound" disabled={produto.quantidade === 0}><Minus size={16} /></Button>
                                <Button onClick={() => onUpdateQuantidade(produto.id, 1)} size="icon" variant="outline" className="w-10 h-10 text-green-600 hover:bg-green-500/10 btn-sound"><Plus size={16} /></Button>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={() => onEdit(produto)} size="icon" variant="ghost" className="text-muted-foreground btn-sound"><Edit size={16} /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-500 hover:bg-red-500/10 btn-sound"><Trash2 size={16} /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto "{produto.nome}" do seu estoque.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDelete(produto.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default function Estoque({ playSound }) {
    const [produtos, setProdutos] = useState([]);
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [productToEdit, setProductToEdit] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem('studiogestor_estoque');
        if (saved) {
            setProdutos(JSON.parse(saved));
        } else {
            const mockProdutos = [
                { id: 1, nome: 'Shampoo Hidratante', foto: '', quantidade: 15, minimo: 5, categoria: 'Shampoo', preco: 25.90 },
                { id: 2, nome: 'Condicionador Nutritivo', foto: '', quantidade: 3, minimo: 5, categoria: 'Condicionador', preco: 28.50 },
                { id: 3, nome: 'Tintura Loiro Dourado', foto: '', quantidade: 8, minimo: 3, categoria: 'Tintura', preco: 45.00 },
                { id: 4, nome: 'Escova Profissional', foto: '', quantidade: 2, minimo: 2, categoria: 'Ferramentas', preco: 85.00 }
            ];
            setProdutos(mockProdutos);
            localStorage.setItem('studiogestor_estoque', JSON.stringify(mockProdutos));
        }
    }, []);

    const saveProdutos = (novosProdutos) => {
        setProdutos(novosProdutos);
        localStorage.setItem('studiogestor_estoque', JSON.stringify(novosProdutos));
    };

    const handleSaveProduct = (productData) => {
        const isEditing = !!productToEdit;
        const novosProdutos = isEditing
            ? produtos.map(p => p.id === productData.id ? productData : p)
            : [...produtos, { ...productData, id: Date.now() }];
        saveProdutos(novosProdutos);
        toast({ title: `✅ Produto ${isEditing ? 'atualizado' : 'adicionado'}!`, description: `${productData.nome} foi salvo com sucesso.` });
        setView('list');
        setProductToEdit(null);
        playSound();
    };

    const updateQuantidade = (produtoId, delta) => {
        playSound();
        const novosProdutos = produtos.map(p => {
            if (p.id === produtoId) {
                const novaQuantidade = Math.max(0, p.quantidade + delta);
                if (novaQuantidade <= p.minimo && novaQuantidade > 0 && p.quantidade > p.minimo) {
                    toast({ title: "⚠️ Produto acabando!", description: `${p.nome} está com estoque baixo (${novaQuantidade} unidades)`, variant: "destructive" });
                }
                return { ...p, quantidade: novaQuantidade };
            }
            return p;
        });
        saveProdutos(novosProdutos);
    };
    
    const handleEdit = (produto) => {
        playSound();
        setProductToEdit(produto);
        setView('form');
    };

    const handleDelete = (produtoId) => {
        playSound();
        const novosProdutos = produtos.filter(p => p.id !== produtoId);
        saveProdutos(novosProdutos);
        toast({ title: "🗑️ Produto excluído!", description: "O item foi removido do seu estoque." });
    };

    const handleNew = () => {
        playSound();
        setProductToEdit(null);
        setView('form');
    };
    
    const handleCancelForm = () => {
        setView('list');
        setProductToEdit(null);
    };

    if (view === 'form') {
        return <ProductForm onSave={handleSaveProduct} onCancel={handleCancelForm} playSound={playSound} productToEdit={productToEdit} />;
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-foreground">Estoque</h2>
                <Button onClick={handleNew} className="bg-primary text-primary-foreground btn-sound"><Plus className="mr-2" size={16} /> Novo Produto</Button>
            </div>
            <EstoqueView produtos={produtos} onUpdateQuantidade={updateQuantidade} onEdit={handleEdit} onDelete={handleDelete} onNew={handleNew} playSound={playSound} />
        </div>
    );
}