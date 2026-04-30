const TELEFONE_WHATSAPP = "5512992107520";
const MENSAGEM_INICIAL = "Olá! Vim pelo cardápio digital da Don Gennaro e gostaria de fazer um pedido.";

const formatadorPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function criarLinkWhatsApp(mensagem) {
  return `https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

function atualizarLinksWhatsApp() {
  const links = document.querySelectorAll("#btn-whatsapp-top, #btn-whatsapp-promo, #whatsapp-float");
  links.forEach((link) => {
    link.href = criarLinkWhatsApp(MENSAGEM_INICIAL);
  });
}

function criarCardPizza(pizza) {
  const article = document.createElement("article");
  article.className = "pizza-card";

  article.innerHTML = `
    <div class="pizza-card__body">
      <div class="pizza-card__top">
        <h4 class="pizza-card__name">${pizza.nome}</h4>
        <span class="pizza-card__price-tag">A partir de ${formatadorPreco.format(Math.min(pizza.pequena, pizza.grande))}</span>
      </div>
      <p class="pizza-card__desc">${pizza.descricao}</p>
      <div class="pizza-card__buttons">
        <button type="button" data-nome="${pizza.nome}" data-tamanho="P" data-preco="${pizza.pequena}">
          P ${formatadorPreco.format(pizza.pequena)}
        </button>
        <button type="button" data-nome="${pizza.nome}" data-tamanho="G" data-preco="${pizza.grande}">
          G ${formatadorPreco.format(pizza.grande)}
        </button>
      </div>
    </div>
  `;

  return article;
}

function renderizar(lista, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  lista.forEach((pizza) => container.appendChild(criarCardPizza(pizza)));
}

function enviarPedido(nomePizza, tamanho, preco) {
  const mensagem = `Olá! Quero pedir uma pizza ${nomePizza} no tamanho ${tamanho}, por ${formatadorPreco.format(Number(preco))}.`;
  window.open(criarLinkWhatsApp(mensagem), "_blank", "noopener");
}

async function carregarCardapio() {
  try {
    const resposta = await fetch("../data/cardapio.json");
    if (!resposta.ok) throw new Error("Falha ao carregar o cardápio.");
    const dados = await resposta.json();

    renderizar(dados.categorias.salgadas, "lista-salgadas");
    renderizar(dados.categorias.doces, "lista-doces");
    atualizarLinksWhatsApp();
  } catch (erro) {
    const secao = document.getElementById("cardapio");
    if (secao) {
      secao.insertAdjacentHTML(
        "afterbegin",
        `<p style="color:#ffb4a8; margin-bottom: 16px;">Não foi possível carregar o cardápio agora. Verifique o arquivo JSON e o deploy.</p>`
      );
    }
  }
}

document.addEventListener("click", (event) => {
  const botao = event.target.closest(".pizza-card__buttons button");
  if (!botao) return;

  enviarPedido(
    botao.dataset.nome,
    botao.dataset.tamanho,
    botao.dataset.preco
  );
});

carregarCardapio();