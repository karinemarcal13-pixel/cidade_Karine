document.getElementById('form-contato').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const msg = document.getElementById('mensagem').value;
    const resposta = document.getElementById('resposta');

    if (nome && email && msg) {
        resposta.textContent = `Obrigada, ${nome}! Sua mensagem foi enviada com sucesso 💌`;
        resposta.style.color = "green";
        this.reset();
    } else {
        resposta.textContent = "Por favor, preencha todos os campos!";
        resposta.style.color = "red";
    }
});
