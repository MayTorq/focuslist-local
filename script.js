const form = document.getElementById("formTarefas");
const container = document.getElementById("cards");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let textoPesquisa = document.getElementById("textoPesquisa");
let btnPesquisar = document.getElementById("btnPesquisar");
let caixaPesquisa = document.getElementById("caixaPesquisa");

textoPesquisa.addEventListener("input", () => {
  const filtro = textoPesquisa.value.toLowerCase();

  const tarefasFiltro = tarefas.filter((tarefa) => {
    return tarefa.tarefa.toLowerCase().includes(filtro);
  });

  renderizarTarefas(tarefasFiltro);
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
