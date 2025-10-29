// Mostrar eventos culturais
document.getElementById("ver-eventos").addEventListener("click", () => {
    const lista = document.getElementById("lista-eventos");
    lista.classList.toggle("oculto");
});

// Ação de “explorar”
document.getElementById("explorar-btn").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

// Envio do formulário
document.getElementById("form-contato").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mensagem enviada com sucesso! 💌");
    e.target.reset();
});
