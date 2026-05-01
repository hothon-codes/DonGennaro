const TELEFONE = "5512992107520";
const formatBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const state = {
  items: [],
  olives: false,
  obs: ""
};

const menu = {
  bebidas: [
    { nome: "Coca-Cola Zero 1L", preco: 9.9 },
    { nome: "Coca-Cola 1L", preco: 9.9 },
    { nome: "Coca-Cola Zero 2L", preco: 14.9 },
    { nome: "Coca-Cola 2L", preco: 14.9 },
    { nome: "Suco 1L", preco: 12.0 }
  ],
  bordas: [
    { nome: "Cheddar", preco: 12.0 },
    { nome: "Mussarela", preco: 12.0 },
    { nome: "Catupiry", preco: 12.0 },
    { nome: "Chocolate", preco: 12.0 }
  ]
};

function whatsappLink(message) {
  return `https://wa.me/${TELEFONE}?text=${encodeURIComponent(message)}`;
}

function updateWhatsAppLinks() {
  const message = "Olá! Vim pelo cardápio digital da Don Gennaro e gostaria de fazer um pedido.";
  ["whatsapp-hero", "whatsapp-float"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = whatsappLink(message);
  });
}

function buildItemKey(item) {
  return `${item.nome}-${item.tamanho}-${item.extra || ""}`;
}

function addItem(item) {
  const key = buildItemKey(item);
  const existing = state.items.find((x) => buildItemKey(x) === key);
  if (existing) {
    existing.qtd += 1;
  } else {
    state.items.push({ ...item, qtd: 1 });
  }
  renderCart();
}

function removeItem(index) {
  state.items.splice(index, 1);
  renderCart();
}

function renderPizzaCards(items, containerId, type) {
  const container = document.getElementById(containerId);
  const template = document.getElementById("pizza-template");
  if (!container || !template) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".pizza-card");
    const title = node.querySelector("h3");
    const desc = node.querySelector(".pizza-card__desc");
    const tag = node.querySelector(".price-tag");
    const buttons = node.querySelectorAll(".btn-size");

    title.textContent = item.nome;
    desc.textContent = item.descricao;
    tag.textContent = `A partir de ${formatBRL.format(Math.min(item.pequena, item.grande))}`;

    buttons[0].textContent = `P ${formatBRL.format(item.pequena)}`;
    buttons[1].textContent = `G ${formatBRL.format(item.grande)}`;

    buttons[0].addEventListener("click", () => addItem({ nome: item.nome, tamanho: "P", preco: item.pequena, type }));
    buttons[1].addEventListener("click", () => addItem({ nome: item.nome, tamanho: "G", preco: item.grande, type }));

    card.dataset.nome = item.nome;
    container.appendChild(node);
  });
}

function renderSimpleCards(items, containerId, kind) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  items.forEach((item) => {
    const el = document.createElement("article");
    el.className = "drink-card";
    el.innerHTML = `
      <h3>${item.nome}</h3>
      <p>${kind === "bebida" ? "Adicione ao pedido com um toque." : "Borda disponível para sua pizza."}</p>
      <strong>${formatBRL.format(item.preco)}</strong>
      <button class="btn btn--primary" type="button">Adicionar</button>
    `;
    el.querySelector("button").addEventListener("click", () => {
      addItem({ nome: item.nome, tamanho: "único", preco: item.preco, type: kind });
    });
    container.appendChild(el);
  });
}

function cartTotal() {
  return state.items.reduce((sum, item) => sum + item.preco * item.qtd, 0);
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const count = document.getElementById("cart-count");
  const total = document.getElementById("cart-total");
  const olives = document.getElementById("want-olives");

  if (!list || !count || !total || !olives) return;

  state.olives = olives.checked;
  count.textContent = `${state.items.reduce((sum, item) => sum + item.qtd, 0)} itens`;
  total.textContent = formatBRL.format(cartTotal());

  if (!state.items.length) {
    list.innerHTML = `<p class="empty">Seu pedido ainda está vazio.</p>`;
    return;
  }

  list.innerHTML = "";
  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <strong>${item.qtd}x ${item.nome} ${item.tamanho !== "único" ? `(${item.tamanho})` : ""}</strong>
        <p>${formatBRL.format(item.preco)} cada</p>
      </div>
      <button type="button" aria-label="Remover item">Remover</button>
    `;
    row.querySelector("button").addEventListener("click", () => removeItem(index));
    list.appendChild(row);
  });
}

function buildOrderMessage() {
  const lines = [];
  lines.push("Olá! Quero fazer meu pedido na Don Gennaro.");
  lines.push("");
  lines.push("Pedido:");

  state.items.forEach((item) => {
    const extra = item.extra ? ` - ${item.extra}` : "";
    lines.push(`- ${item.qtd}x ${item.nome} ${item.tamanho !== "único" ? `(${item.tamanho})` : ""}${extra}`);
  });

  if (state.olives) lines.push("- Quero azeitonas");
  if (state.obs.trim()) {
    lines.push("");
    lines.push(`Observações: ${state.obs.trim()}`);
  }

  lines.push("");
  lines.push(`Total estimado: ${formatBRL.format(cartTotal())}`);
  lines.push("");
  lines.push("Pode confirmar, por favor?");

  return lines.join("\n");
}

function confirmOrder() {
  if (!state.items.length) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const link = whatsappLink(buildOrderMessage());
  window.open(link, "_blank", "noopener,noreferrer");
}

function clearCart() {
  state.items = [];
  const olives = document.getElementById("want-olives");
  const obs = document.getElementById("obs");
  if (olives) olives.checked = false;
  if (obs) obs.value = "";
  renderCart();
}

async function loadMenu() {
  try {
    const res = await fetch("../data/cardapio.json");
    if (!res.ok) throw new Error("Falha ao carregar cardápio.");
    const data = await res.json();

    renderPizzaCards(data.categorias.salgadas, "lista-salgadas", "salgada");
    renderPizzaCards(data.categorias.doces, "lista-doces", "doce");
    renderSimpleCards(menu.bordas, "bordas", "borda");
    renderSimpleCards(menu.bebidas, "lista-bebidas", "bebida");
  } catch (e) {
    const target = document.getElementById("conteudo");
    if (target) {
      target.insertAdjacentHTML(
        "afterbegin",
        `<div class="container" style="padding: 16px 0; color: #ffb1b1;">Não foi possível carregar o cardápio.</div>`
      );
    }
  }
}

document.addEventListener("click", (event) => {
  const clear = event.target.closest("#btn-clear");
  const send = event.target.closest("#btn-whatsapp");
  if (clear) clearCart();
  if (send) confirmOrder();
});

document.addEventListener("input", (event) => {
  if (event.target.id === "obs") {
    state.obs = event.target.value;
  }
  if (event.target.id === "want-olives") {
    state.olives = event.target.checked;
  }
});

loadMenu();
updateWhatsAppLinks();
renderCart();
