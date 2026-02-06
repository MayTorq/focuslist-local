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
    const filtro = textoPesquisa.value.toLowerCase();

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
  const pesquisa = document.getElementById("caixaPesquisa");

  if (window.innerWidth <= 600) {
    if (pesquisa) {
      pesquisa.style.display = "none";
      pesquisa.style.opacity = "0";
    }

    setTimeout(() => {
      if (logo) {
        logo.classList.add("fade-out");

        setTimeout(() => {
          logo.style.display = "none";
          if (pesquisa) {
            pesquisa.style.display = "flex";
            void pesquisa.offsetWidth;
            pesquisa.classList.add("fade-in");
          }
        }, 600);
      }
    }, 2000);
  }

  renderizarTarefas();
});

btnFiltro.addEventListener("click", (e) => {
  e.stopPropagation();
  menuFiltro.classList.toggle("ativo");
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
  listaParaExibir.forEach((tarefa, index) => {
    criarCard(tarefa, index);
  });
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nomeTarefa = document.getElementById("tarefa").value.trim();

  if (nomeTarefa) {
    const novaTarefa = new Tarefa(nomeTarefa);
    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
    form.reset();
    exibirMensagem("Tarefa adicionada!");
  }
});

class Tarefa {
  constructor(nome) {
    this.tarefa = nome;
  }
}

function criarCard(instancia, index) {
  const card = document.createElement("div");
  card.classList.add("card");

  const paragrafo = document.createElement("p");
  paragrafo.innerText = `${instancia.tarefa}`;

  const btnExcluir = document.createElement("button");
  btnExcluir.innerText = "Excluir tarefa";
  btnExcluir.onclick = () => {
    tarefas.splice(index, 1);
    salvarTarefas();
    renderizarTarefas();
    exibirMensagem("Tarefa removida!");
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
