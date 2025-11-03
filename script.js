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
