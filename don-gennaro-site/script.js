// 1. Função de envio para o WhatsApp
function enviarPedido(nomePizza, tamanho, preco) {
    const telefone = "5512992107520";
    const msg = `Olá! Quero pedir uma pizza de ${nomePizza} (${tamanho}) por R$ ${preco}`;
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`, "_blank");
}

// 2. Função para criar os itens na tela
function renderizar(lista, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    lista.forEach(p => {
        const div = document.createElement("div");
        div.className = "pizza";
        div.innerHTML = `
            <h3>${p.nome}</h3>
            <p>${p.descricao}</p>
            <div class="opcoes-venda">
                <button onclick="enviarPedido('${p.nome}', 'P', '${p.pequena.toFixed(2)}')">P: R$ ${p.pequena.toFixed(2)}</button>
                <button onclick="enviarPedido('${p.nome}', 'G', '${p.grande.toFixed(2)}')">G: R$ ${p.grande.toFixed(2)}</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. O Carregamento (Tenta os dois caminhos possíveis no Windows)
const caminhos = ["../data/cardapio.json", "cardapio.json"];

async function carregar() {
    for (let path of caminhos) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                const dados = await res.json();
                renderizar(dados.categorias.salgadas, "lista-salgadas");
                renderizar(dados.categorias.doces, "lista-doces");
                console.log("Cardápio carregado via: " + path);
                return; // Para se achar o arquivo
            }
        } catch (e) { continue; }
    }
    alert("Erro: O arquivo cardapio.json não foi encontrado. Verifique se ele está dentro da pasta 'data'.");
}

carregar();