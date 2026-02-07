const form = document.getElementById("formTarefas");
const container = document.getElementById("cards");
const btnFiltro = document.getElementById("btnFiltro");
const menuFiltro = document.getElementById("menuFiltro");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let textoPesquisa = document.getElementById("textoPesquisa");
let btnPesquisar = document.getElementById("btnPesquisar");
let caixaPesquisa = document.getElementById("caixaPesquisa");
let timeoutId;

textoPesquisa.addEventListener("input", () => {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    const filtro = textoPesquisa.value.trim().toLowerCase();

    if (filtro === "") {
      renderizarTarefas(tarefas);
      return;
    }

    const tarefasFiltro = tarefas.filter((tarefa) => {
      return tarefa.tarefa.toLowerCase().includes(filtro);
    });

    renderizarTarefas(tarefasFiltro);
  }, 300);
});

btnPesquisar.addEventListener("click", () => {
  caixaPesquisa.classList.toggle("ativa");

  if (caixaPesquisa.classList.contains("ativa")) {
    textoPesquisa.focus();
  } else {
    textoPesquisa.value = "";
    renderizarTarefas();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logoSite");
  const conteudoBusca = document.getElementById("caixaPesquisa");
  const filtroContainer = document.querySelector(".filtroContainer");

  if (window.innerWidth <= 600) {
    // Inicialmente, mostrar logo e esconder filtro/pesquisa
    if (logo) {
      logo.classList.remove("fade-out");
      logo.style.display = "flex";
    }
    if (filtroContainer) {
      filtroContainer.classList.remove("fade-in");
      filtroContainer.classList.remove("fade-out");
      // manter oculto inicialmente (CSS mobile define display:none)
    }
    if (conteudoBusca) {
      conteudoBusca.classList.remove("fade-in");
    }

    // Após 3 segundos, fazer transição
    setTimeout(() => {
      if (logo) {
        logo.classList.add("fade-out");
      }
      // ativar layout de busca no header e mostrar filtro + pesquisa
      const header = document.querySelector("header");
      if (header) header.classList.add("search-active");

      if (filtroContainer) {
        filtroContainer.classList.add("fade-in");
      }

      setTimeout(() => {
        if (conteudoBusca) {
          conteudoBusca.classList.add("fade-in");
          // focar o campo de pesquisa ao aparecer
          if (textoPesquisa) textoPesquisa.focus();
        }
      }, 50);
    }, 3000);
  } else {
    logo.style.position = "static";
    conteudoBusca.style.display = "flex";
    conteudoBusca.style.opacity = "1";
  }
});

btnFiltro.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = menuFiltro.classList.toggle("ativo");
  btnFiltro.setAttribute("aria-expanded", isOpen);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuFiltro.classList.contains("ativo")) {
    menuFiltro.classList.remove("ativo");
    btnFiltro.setAttribute("aria-expanded", "false");
    btnFiltro.focus();
  }
});

document.addEventListener("click", (e) => {
  if (!menuFiltro.contains(e.target) && e.target !== btnFiltro) {
    menuFiltro.classList.remove("ativo");
  }
});

const allCheckboxes = document.querySelectorAll(
  '.menuFiltro input[type="checkbox"]',
);
allCheckboxes.forEach((cb) => {
  cb.addEventListener("change", () => {
    console.log("Filtro alterado!");
  });
});

function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function renderizarTarefas(listaParaExibir = tarefas) {
  container.innerHTML = "";

  if (listaParaExibir.length === 0) {
    const mensagemVazia = document.createElement("p");
    mensagemVazia.textContent =
      "Nenhuma tarefa encontrada. Adicione uma nova tarefa para começar!";
    mensagemVazia.setAttribute("role", "status");
    container.appendChild(mensagemVazia);
    return;
  }

  listaParaExibir.forEach((tarefa, index) => {
    criarCard(tarefa, index);
  });

  container.setAttribute(
    "aria-label",
    `${listaParaExibir.length} tarefa${listaParaExibir.length !== 1 ? "s" : ""} encontrada${listaParaExibir.length !== 1 ? "s" : ""}`,
  );
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nomeTarefa = document.getElementById("tarefa").value.trim();

  if (nomeTarefa) {
    if (nomeTarefa.length > 255) {
      exibirMensagem("Tarefa muito longa! Máximo de 255 caracteres.");
      return;
    }

    const novaTarefa = new Tarefa(nomeTarefa);
    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
    form.reset();
    exibirMensagem("Tarefa adicionada com sucesso!");
    document.getElementById("tarefa").focus();
  } else {
    exibirMensagem("Por favor, digite uma tarefa válida.");
  }
});

class Tarefa {
  constructor(nome) {
    this.tarefa = nome;
  }
}

function criarCard(instancia, index) {
  const card = document.createElement("article");
  card.classList.add("card");
  card.setAttribute("role", "listitem");

  const paragrafo = document.createElement("p");
  paragrafo.innerText = instancia.tarefa;

  const btnExcluir = document.createElement("button");
  btnExcluir.innerText = "Excluir";
  btnExcluir.type = "button";
  btnExcluir.setAttribute("aria-label", `Excluir tarefa: ${instancia.tarefa}`);
  btnExcluir.onclick = () => {
    if (
      confirm(`Tem certeza que deseja excluir a tarefa: "${instancia.tarefa}"?`)
    ) {
      tarefas.splice(index, 1);
      salvarTarefas();
      renderizarTarefas();
      exibirMensagem("Tarefa removida com sucesso!");
    }
  };

  card.appendChild(paragrafo);
  card.appendChild(btnExcluir);
  container.appendChild(card);
}

function exibirMensagem(texto, tempo = 1000) {
  const msg = document.getElementById("mensagem");
  msg.textContent = texto;
  setTimeout(() => {
    msg.textContent = "";
  }, tempo);
}

renderizarTarefas();
