// Utilitários para importação de produtos via CSV

export function parseCSV(text) {
  // Simples parser CSV (não cobre todos os casos complexos)
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // separa por vírgula, ignora vírgulas dentro de aspas
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = cols[i]?.replace(/^"|"$/g, "").trim();
    });
    return obj;
  });
}

export function validarProdutoCSV(prod) {
  // Valida campos obrigatórios
  if (!prod.nome || !prod.preco || !prod.imagens) return false;
  return true;
}
