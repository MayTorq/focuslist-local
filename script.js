const form = document.getElementById("formTarefas");
const container = document.getElementById("listaTarefas");
const btnFiltro = document.getElementById("btnFiltro");
const menuFiltro = document.getElementById("menuFiltro");
const modalEditar = document.getElementById("modalEditar");
const formModalEditar = document.getElementById("formModalEditar");
const inputNomeTarefa = document.getElementById("inputNomeTarefa");
const inputDataTarefa = document.getElementById("inputDataTarefa");
const btnCancelarModal = document.querySelector(".btnCancelar");

let tarefas = [];
let tarefaEmEdicao = null;

try {
  tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
} catch (e) {
  console.error("Erro ao carregar tarefas:", e);
  exibirMensagem("Erro ao carregar tarefas. Começando do zero.");
  tarefas = [];
}
let textoPesquisa = document.getElementById("textoPesquisa");
let btnPesquisar = document.getElementById("btnPesquisar");
let caixaPesquisa = document.getElementById("caixaPesquisa");
let timeoutId;

// Modal handlers
btnCancelarModal.addEventListener("click", () => {
  modalEditar.close();
  tarefaEmEdicao = null;
});

formModalEditar.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!tarefaEmEdicao) return;

  const novaDescricao = inputNomeTarefa.value.trim();
  const novaDataStr = inputDataTarefa.value.trim();

  if (!novaDescricao) {
    exibirMensagem("Nome da tarefa não pode estar vazio.");
    return;
  }

  if (novaDescricao.length > 255) {
    exibirMensagem("Tarefa muito longa! Máximo de 255 caracteres.");
    return;
  }

  tarefaEmEdicao.tarefa = novaDescricao;

  if (novaDataStr === "" || novaDataStr === "xx/xx") {
    tarefaEmEdicao.dataEntrega = null;
  } else {
    if (!validarDataDDMM(novaDataStr)) {
      exibirMensagem("Formato inválido. Use DD/MM (ex: 25/12).");
      return;
    }

    const anoAtual = new Date().getFullYear();
    const dataConvertida = converterDDMMParaData(novaDataStr, anoAtual);
    if (!dataConvertida) {
      exibirMensagem("Data inválida.");
      return;
    }
    tarefaEmEdicao.dataEntrega = dataConvertida;
  }

  salvarTarefas();
  aplicarFiltros();
  exibirMensagem("Tarefa editada com sucesso!");

  modalEditar.close();
  tarefaEmEdicao = null;
});

// debounce na pesquisa para não ficar filtrando a cada letra digitada
textoPesquisa.addEventListener("input", () => {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    aplicarFiltros();
  }, 300);
});

btnPesquisar.addEventListener("click", () => {
  textoPesquisa.focus(); // foca no campo de pesquisa quando clica no botão
});

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logoSite");
  const conteudoBusca = document.getElementById("caixaPesquisa");
  const filtroContainer = document.querySelector(".filtroContainer");

  if (window.innerWidth <= 600) {
    if (logo) logo.classList.remove("desaparecer");
    if (filtroContainer) {
      filtroContainer.classList.remove("aparecer");
      filtroContainer.classList.remove("desaparecer");
    }
    if (conteudoBusca) conteudoBusca.classList.remove("aparecer");

    setTimeout(() => {
      if (logo) logo.classList.add("desaparecer");
      const header = document.querySelector("header");
      if (header) header.classList.add("pesquisaAtiva");
      if (filtroContainer) filtroContainer.classList.add("aparecer");

      setTimeout(() => {
        if (conteudoBusca) {
          conteudoBusca.classList.add("aparecer");
          if (textoPesquisa) textoPesquisa.focus();
        }
      }, 50);
    }, 3000);
  } else {
    if (logo) logo.style.position = "static";
    if (conteudoBusca) {
      conteudoBusca.style.display = "flex";
      conteudoBusca.style.opacity = "1";
    }
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
    aplicarFiltros();
  });
});

function aplicarFiltros() {
  // pegando os valores dos checkboxes de filtro
  const statusConcluido =
    document.querySelector('input[value="concluido"]')?.checked || false;
  const statusPendente =
    document.querySelector('input[value="pendente"]')?.checked || false;
  const semData =
    document.querySelector('input[value="sem-data"]')?.checked || false;
  const atraso =
    document.querySelector('input[value="atraso"]')?.checked || false;
  const umDia =
    document.querySelector('input[value="um-dia"]')?.checked || false;
  const umMes =
    document.querySelector('input[value="uma-semana"]')?.checked || false;

  const temFiltroStatus = statusConcluido || statusPendente;
  const temFiltroData = semData || atraso || umDia || umMes;

  let tarefasFiltradas = [...tarefas];
  const textoPesquisaValue = textoPesquisa.value.trim().toLowerCase();

  // se não tem filtro selecionado, só aplica pesquisa se tiver
  if (!temFiltroStatus && !temFiltroData) {
    if (textoPesquisaValue) {
      tarefasFiltradas = tarefasFiltradas.filter((t) =>
        t.tarefa.toLowerCase().includes(textoPesquisaValue),
      );
    }
    renderizarTarefas(tarefasFiltradas);
    return;
  }

  // filtrando por status
  if (temFiltroStatus) {
    if (statusConcluido && !statusPendente) {
      tarefasFiltradas = tarefasFiltradas.filter((t) => t.concluida);
    } else if (statusPendente && !statusConcluido) {
      tarefasFiltradas = tarefasFiltradas.filter((t) => !t.concluida);
    }
  }

  // filtrando por data
  if (temFiltroData) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrosDataAtivos = [];
    if (semData) filtrosDataAtivos.push((t) => !t.dataEntrega);
    if (atraso) {
      filtrosDataAtivos.push((t) => {
        if (!t.dataEntrega || t.concluida) return false;
        // parsear manualmente para evitar problema de timezone
        const partes = t.dataEntrega.split("-");
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        const dataEntrega = new Date(ano, mes - 1, dia);
        dataEntrega.setHours(0, 0, 0, 0);
        return dataEntrega < hoje;
      });
    }
    if (umDia) {
      filtrosDataAtivos.push((t) => {
        if (!t.dataEntrega || t.concluida) return false;
        // parsear manualmente para evitar problema de timezone
        const partes = t.dataEntrega.split("-");
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        const dataEntrega = new Date(ano, mes - 1, dia);
        dataEntrega.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        return (
          dataEntrega.getTime() === hoje.getTime() ||
          dataEntrega.getTime() === amanha.getTime()
        );
      });
    }
    if (umMes) {
      filtrosDataAtivos.push((t) => {
        if (!t.dataEntrega || t.concluida) return false;
        // parsear manualmente para evitar problema de timezone
        const partes = t.dataEntrega.split("-");
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        const dataEntrega = new Date(ano, mes - 1, dia);
        dataEntrega.setHours(0, 0, 0, 0);
        const umMesFuturo = new Date(hoje);
        umMesFuturo.setMonth(umMesFuturo.getMonth() + 1);
        return dataEntrega >= hoje && dataEntrega <= umMesFuturo;
      });
    }

    tarefasFiltradas = tarefasFiltradas.filter((t) =>
      filtrosDataAtivos.some((filtro) => filtro(t)),
    );
  }

  // aplicando pesquisa também se tiver texto
  if (textoPesquisaValue) {
    tarefasFiltradas = tarefasFiltradas.filter((t) =>
      t.tarefa.toLowerCase().includes(textoPesquisaValue),
    );
  }

  renderizarTarefas(tarefasFiltradas);
}

function salvarTarefas() {
  try {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  } catch (e) {
    console.error("Erro ao salvar tarefas:", e);
    exibirMensagem("Erro ao salvar. Tente novamente.");
  }
}

function renderizarTarefas(listaParaExibir = tarefas) {
  container.innerHTML = ""; // limpa o container antes de renderizar

  if (listaParaExibir.length === 0) {
    const mensagemVazia = document.createElement("p");
    mensagemVazia.textContent =
      "Nenhuma tarefa encontrada. Adicione uma nova tarefa para começar!";
    mensagemVazia.setAttribute("role", "status");
    mensagemVazia.classList.add("tarefaVazia");
    container.appendChild(mensagemVazia);
    return;
  }

  // criando um card para cada tarefa
  listaParaExibir.forEach((tarefa, index) => {
    criarCard(tarefa, index);
  });

  const plural = listaParaExibir.length !== 1 ? "s" : "";
  container.setAttribute(
    "aria-label",
    `${listaParaExibir.length} tarefa${plural} encontrada${plural}`,
  );
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nomeTarefa = document.getElementById("tarefa").value.trim();
  const dataEntrega = document.getElementById("dataEntrega").value || null;

  if (nomeTarefa) {
    if (nomeTarefa.length > 255) {
      exibirMensagem("Tarefa muito longa! Máximo de 255 caracteres.");
      return;
    }

    try {
      const novaTarefa = new Tarefa(nomeTarefa, dataEntrega);
      tarefas.push(novaTarefa);
      salvarTarefas();
      aplicarFiltros();
      form.reset();
      exibirMensagem("Tarefa adicionada com sucesso!");
      document.getElementById("tarefa").focus();
    } catch (e) {
      console.error("Erro ao adicionar tarefa:", e);
      exibirMensagem("Erro ao adicionar tarefa.");
    }
  } else {
    exibirMensagem("Por favor, digite uma tarefa válida.");
  }
});

class Tarefa {
  constructor(nome, dataEntrega = null) {
    this.tarefa = nome;
    this.dataEntrega = dataEntrega;
    this.concluida = false;
    this.id = Date.now() + Math.random(); // id único para cada tarefa
  }
}

function formatarDataParaDDMM(dataString) {
  if (!dataString) return null;
  // parsear manualmente para evitar problema de timezone
  const partes = dataString.split("-");
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`; // retorna no formato brasileiro
}

function validarDataDDMM(dataStr) {
  if (!dataStr || dataStr.length !== 5) return false;
  const regex = /^\d{2}\/\d{2}$/;
  if (!regex.test(dataStr)) return false;
  const partes = dataStr.split("/");
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  // validando se os valores fazem sentido
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return false;
  return true;
}

function converterDDMMParaData(ddmm, anoAtual) {
  if (!ddmm || ddmm === "xx/xx") return null;
  const partes = ddmm.split("/");
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const data = new Date(anoAtual, mes - 1, dia);
  return data.toISOString().split("T")[0];
}

function criarCard(instancia, index) {
  const template = document.getElementById("templateCard");
  const card = template.content.cloneNode(true);
  const article = card.querySelector(".card");

  const realIndex = tarefas.findIndex((t) => t.id === instancia.id);

  // adicionando classe de concluída se necessário
  if (instancia.concluida) {
    article.classList.add("completed");
  }

  const titulo = card.querySelector(".tituloCard");
  if (titulo) titulo.textContent = "Tarefa";

  const descricao = card.querySelector(".descricaoCard");
  if (descricao) {
    descricao.textContent = instancia.tarefa;
  }

  const dataCard = card.querySelector(".dataCard");
  if (dataCard) {
    if (instancia.dataEntrega) {
      const dataFormatada = formatarDataParaDDMM(instancia.dataEntrega);
      dataCard.textContent = dataFormatada;

      // calculando se está atrasada ou próxima do vencimento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      // parsear manualmente para evitar problema de timezone
      const partes = instancia.dataEntrega.split("-");
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const dia = parseInt(partes[2], 10);
      const dataEntrega = new Date(ano, mes - 1, dia);
      dataEntrega.setHours(0, 0, 0, 0);
      const diffTime = dataEntrega - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // só mostra indicador se não estiver concluída
      if (!instancia.concluida) {
        const indicador = document.createElement("div");
        indicador.classList.add("indicadorCard");

        if (diffDays < 0) {
          indicador.classList.add("ativo", "vermelho");
          indicador.setAttribute("title", "Tarefa em atraso");
        } else if (diffDays === 0 || diffDays === 1) {
          indicador.classList.add("ativo", "amarelo");
          indicador.setAttribute(
            "title",
            diffDays === 0 ? "Vence hoje" : "Vence amanhã",
          );
        }

        if (indicador.classList.contains("ativo")) {
          article.appendChild(indicador);
        }
      }
    } else {
      dataCard.textContent = "xx/xx";
    }
  }

  const btnEditar = card.querySelector(".btn-editar");
  btnEditar.classList.add("btnEditar");
  btnEditar.onclick = () => {
    tarefaEmEdicao = instancia;
    inputNomeTarefa.value = instancia.tarefa;
    inputDataTarefa.value = instancia.dataEntrega
      ? formatarDataParaDDMM(instancia.dataEntrega)
      : "";

    modalEditar.showModal();
    inputNomeTarefa.focus();
  };

  const btnConcluir = card.querySelector(".btn-concluir");
  btnConcluir.classList.add("btnAcao");
  btnConcluir.onclick = () => {
    instancia.concluida = !instancia.concluida;
    salvarTarefas();
    aplicarFiltros();
    exibirMensagem(
      instancia.concluida ? "Tarefa concluída!" : "Tarefa reaberta!",
    );
  };

  const btnExcluir = card.querySelector(".btn-excluir");
  btnExcluir.classList.add("btnAcao");
  btnExcluir.onclick = () => {
    if (
      confirm(`Tem certeza que deseja excluir a tarefa: "${instancia.tarefa}"?`)
    ) {
      try {
        tarefas.splice(realIndex, 1);
        salvarTarefas();
        aplicarFiltros();
        exibirMensagem("Tarefa removida com sucesso!");
      } catch (e) {
        console.error("Erro ao excluir tarefa:", e);
        exibirMensagem("Erro ao excluir tarefa.");
      }
    }
  };

  container.appendChild(card);
}

function exibirMensagem(texto, tempo = 1000) {
  const msg = document.getElementById("mensagem");
  msg.textContent = texto;
  setTimeout(() => {
    msg.textContent = ""; // limpa a mensagem depois de um tempo
  }, tempo);
}

aplicarFiltros();
