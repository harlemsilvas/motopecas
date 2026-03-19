import React, { createContext, useState, useContext } from 'react';

const CarrinhoContext = createContext();

export const useCarrinho = () => useContext(CarrinhoContext);

export const CarrinhoProvider = ({ children }) => {
  const [itens, setItens] = useState([]);

  const adicionarItem = (produto) => {
    setItens(prev => {
      const existe = prev.find(item => item._id === produto._id);
      if (existe) return prev;
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerItem = (id) => {
    setItens(prev => prev.filter(item => item._id !== id));
  };

  const limparCarrinho = () => setItens([]);

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionarItem, removerItem, limparCarrinho, total }}>
      {children}
    </CarrinhoContext.Provider>
  );
};
