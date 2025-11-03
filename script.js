// === Rolagem suave ===
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  });
});

// === Botão explorar ===
const explorarBtn = document.getElementById('explorar-btn');
explorarBtn.addEventListener('click', () => {
  document.querySelector('#historia').scrollIntoView({ behavior: 'smooth' });
});

// === Ver eventos ===
const verEventosBtn = document.getElementById('ver-eventos');
const listaEventos = document.getElementById('lista-eventos');

verEventosBtn.addEventListener('click', () => {
  const isHidden = listaEventos.hasAttribute('hidden');
  listaEventos.toggleAttribute('hidden');
  verEventosBtn.textContent = isHidden ? 'Ocultar Eventos' : 'Ver Próximos Eventos';
});

// === Formulários ===
function handleFormSubmit(formId, successMessage) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', e => {
    e.preventDefault();
    alert(successMessage);
    form.reset();
  });
}

handleFormSubmit('form-doacao', '💖 Obrigado pela sua doação!');
handleFormSubmit('form-reclamacao', '📢 Reclamação enviada com sucesso!');
handleFormSubmit('form-agendamento', '🩺 Consulta agendada com sucesso!');
handleFormSubmit('form-contato', '📬 Mensagem enviada com sucesso!');
// Seletores principais
const inicio = document.getElementById('inicio');
const formulario = document.getElementById('formulario');
const historico = document.getElementById('historico');
const listaAtendimentos = document.getElementById('listaAtendimentos');

// Navegação
document.getElementById('abrirAtendimento').onclick = () => mostrar('formulario');
document.getElementById('btnInicio').onclick = () => mostrar('inicio');
document.getElementById('btnAtendimento').onclick = () => mostrar('formulario');
document.getElementById('btnHistorico').onclick = () => { atualizarHistorico(); mostrar('historico'); };
document.getElementById('voltarInicio').onclick = () => mostrar('inicio');
document.getElementById('voltarInicio2').onclick = () => mostrar('inicio');

function mostrar(secao) {
  [inicio, formulario, historico].forEach(s => s.classList.remove('ativo'));
  document.getElementById(secao).classList.add('ativo');
}

// Geração de protocolo único
function gerarProtocolo() {
  const data = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CIDD-${data}-${aleatorio}`;
}

// Envio do formulário
document.getElementById('formAtendimento').addEventListener('submit', e => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const contato = document.getElementById('contato').value.trim();
  const tipo = document.getElementById('tipo').value;
  const descricao = document.getElementById('descricao').value.trim();

  if (!nome || !contato || !tipo || !descricao) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const atendimento = {
    id: gerarProtocolo(),
    nome,
    contato,
    tipo,
    descricao,
    data: new Date().toLocaleString()
  };

  salvarAtendimento(atendimento);
  alert(`Atendimento registrado com sucesso!\nProtocolo: ${atendimento.id}`);

  e.target.reset();
  mostrar('inicio');
});

// Salvar no localStorage
function salvarAtendimento(atendimento) {
  const dados = JSON.parse(localStorage.getItem('atendimentos')) || [];
  dados.push(atendimento);
  localStorage.setItem('atendimentos', JSON.stringify(dados));
}

// Atualizar histórico
function atualizarHistorico() {
  const dados = JSON.parse(localStorage.getItem('atendimentos')) || [];
  listaAtendimentos.innerHTML = dados.length === 0 
    ? "<p>Nenhum atendimento registrado ainda.</p>"
    : dados.map(a => `
      <div class="card">
        <strong>${a.tipo}</strong><br>
        <small><b>Protocolo:</b> ${a.id}</small><br>
        <small><b>Nome:</b> ${a.nome}</small><br>
        <small><b>Data:</b> ${a.data}</small><br>
        <p>${a.descricao}</p>
      </div>
    `).join('');
}
