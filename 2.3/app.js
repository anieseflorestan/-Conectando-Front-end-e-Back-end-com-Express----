const pratosDiv = document.getElementById("pratos");
const categoriaSelect = document.getElementById("categoria");


// Carregar categorias
async function carregarCategorias() {
    const resposta = await fetch("/api/categorias");
    const categorias = await resposta.json();

    categorias.forEach(categoria => {
        const option = document.createElement("option");

        option.value = categoria.nome;
        option.textContent = categoria.nome;

        categoriaSelect.appendChild(option);
    });
}


// Carregar pratos
async function carregarPratos() {
    const resposta = await fetch("/api/pratos");
    const pratos = await resposta.json();

    mostrarPratos(pratos);
}


// Mostrar pratos na tela
function mostrarPratos(pratos) {

    pratosDiv.innerHTML = "";

    pratos.forEach(prato => {

        const card = document.createElement("div");

        card.innerHTML = `
            <h2>${prato.nome}</h2>

            <p>${prato.descricao || ""}</p>

            <p>Categoria: ${prato.categoria}</p>

            <p>Preço: R$ ${Number(prato.preco).toFixed(2)}</p>

            <p>
                ${prato.disponivel
                    ? "Disponível"
                    : "Indisponível"}
            </p>

            <button onclick="removerPrato(${prato.id})">
                Remover
            </button>

            <hr>
        `;

        pratosDiv.appendChild(card);
    });
}


// Remover prato
async function removerPrato(id) {

    const resposta = await fetch(`/api/pratos/${id}`, {
        method: "DELETE"
    });

    if (resposta.ok) {
        carregarPratos();
    } else {
        alert("Erro ao remover prato");
    }
}


// Filtro de categoria
categoriaSelect.addEventListener("change", async () => {

    const categoria = categoriaSelect.value;

    let url = "/api/pratos";

    if (categoria) {
        url += `?categoria=${encodeURIComponent(categoria)}`;
    }

    const resposta = await fetch(url);
    const pratos = await resposta.json();

    mostrarPratos(pratos);
});


carregarCategorias();
carregarPratos();

const formulario = document.getElementById("formulario");
const categoria = document.getElementById("categoria");
const mensagem = document.getElementById("mensagem");


// Carregar categorias
async function carregarCategorias() {

    const resposta = await fetch("/api/categorias");
    const categorias = await resposta.json();

    categorias.forEach(item => {

        const option = document.createElement("option");

        option.value = item.id;
        option.textContent = item.nome;

        categoria.appendChild(option);
    });
}


// Cadastrar prato
formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        descricao: document.getElementById("descricao").value,
        preco: Number(document.getElementById("preco").value),
        categoria_id: Number(categoria.value)
    };

    const resposta = await fetch("/api/pratos", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {

        mensagem.textContent = "Prato cadastrado com sucesso!";

        formulario.reset();

    } else {

        mensagem.textContent =
            resultado.erro || "Erro ao cadastrar prato";
    }
});


carregarCategorias();