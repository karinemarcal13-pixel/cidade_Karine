// Enviar reclamação e salvar no localStorage
document.querySelector('#reclamacoes form').addEventListener('submit', function (e) {
  e.preventDefault();

  const descricao = document.getElementById('reclamacao').value;

  if (descricao.trim() === '') {
    alert('Por favor, preencha a descrição da reclamação.');
    return;
  }

  // Recupera as reclamações salvas ou cria um array vazio
  const reclamacoes = JSON.parse(localStorage.getItem('reclamacoes')) || [];

  // Adiciona nova reclamação
  reclamacoes.push({
    descricao,
    data: new Date().toLocaleString()
  });

  // Salva no localStorage
  localStorage.setItem('reclamacoes', JSON.stringify(reclamacoes));

  alert('Reclamação salva com sucesso!');
  this.reset();
});

// Mostrar as reclamações salvas
function exibirReclamacoes() {
  const lista = document.getElementById('lista-reclamacoes');
  if (!lista) return;

  const reclamacoes = JSON.parse(localStorage.getItem('reclamacoes')) || [];

  lista.innerHTML = '';

  reclamacoes.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${item.descricao} (enviado em ${item.data})`;
    lista.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', exibirReclamacoes);
