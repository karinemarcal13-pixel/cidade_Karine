// Mostrar eventos culturais
document.getElementById("ver-eventos").addEventListener("click", () => {
  document.getElementById("lista-eventos").classList.toggle("oculto");
});

// Rolagem suave
document.getElementById("explorar-btn").addEventListener("click", () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

// Doações
document.getElementById("form-doacao").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("💖 Obrigado pela sua doação! Sua contribuição faz a diferença!");
  e.target.reset();
});

// Reclamações
document.getElementById("form-reclamacao").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("📢 Reclamação enviada com sucesso! A Prefeitura retornará em breve.");
  e.target.reset();
});

// Agendamento médico
document.getElementById("form-agendamento").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("🩺 Consulta agendada com sucesso! A Prefeitura entrará em contato para confirmar.");
  e.target.reset();
});

// Contato
document.getElementById("form-contato").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("📬 Mensagem enviada! Responderemos o mais breve possível.");
  e.target.reset();
});
