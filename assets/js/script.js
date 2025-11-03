document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      const newUser = {
        nome: nome,
        email: email,
        senha: senha,
      };

      try {
        localStorage.setItem("registeredUser", JSON.stringify(newUser));
        alert("Usuário cadastrado com sucesso! Faça o login.");

        const loginTabButton = document.getElementById("login-tab");
        if (loginTabButton) {
          new bootstrap.Tab(loginTabButton).show();
        }
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
        alert("Falha ao cadastrar. O armazenamento local pode estar cheio.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const loginEmail = document.getElementById("loginEmail").value;
      const loginPassword = document.getElementById("loginPassword").value;

      const userDataString = localStorage.getItem("registeredUser");

      if (!userDataString) {
        alert("Nenhum usuário cadastrado. Por favor, crie uma conta.");
        return;
      }

      try {
        const registeredUser = JSON.parse(userDataString);

        if (
          loginEmail === registeredUser.email &&
          loginPassword === registeredUser.senha
        ) {
          const sessionData = {
            email: registeredUser.email,
            nome: registeredUser.nome,
            loginTime: new Date().getTime(),
          };

          sessionStorage.setItem("activeSession", JSON.stringify(sessionData));

          alert(`Bem-vindo, ${registeredUser.nome}!`);

          globalThis.location.href = "../index.html";
        } else {
          alert("Email ou senha incorretos.");
        }
      } catch (error) {
        console.error("Erro ao ler dados do localStorage:", error);
        alert("Ocorreu um erro ao tentar fazer login.");
      }
    });
  }

  const calcForm = document.getElementById("calcForm");
  if (calcForm) {
    $(document).ready(function () {
      $("#toleranceInput").mask("00S0S0");
    });

    calcForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const input = document.getElementById("toleranceInput").value;
      const toleranceRegex = /^\d+[A-Za-z]\d+[A-Za-z]\d+$/;

      if (toleranceRegex.test(input)) {
        console.log("Formato válido!");
        saveCalculation(input);
      } else {
        alert("Formato inválido! Use um formato como 90H7p8.");
      }
    });
  }

  if (document.getElementById("historyListContainer")) {
    loadHistory();
  }

  const cepInput = document.getElementById("cep");
  if (cepInput) {
    cepInput.addEventListener("blur", async () => {
      const cepValue = cepInput.value.replace(/\D/g, "");

      if (cepValue.length === 8) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${cepValue}/json/`,
          );
          const data = await response.json();

          if (data.erro) {
            alert("CEP não encontrado.");
            return;
          }

          document.getElementById("rua").value = data.logradouro;
          document.getElementById("bairro").value = data.bairro;
          document.getElementById("cidade").value = data.localidade;
          document.getElementById("estado").value = data.uf;

          document.getElementById("numero").focus();
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
          alert("Não foi possível buscar o CEP.");
        }
      }
    });
  }
});

async function saveCalculation(inputValue) {
  const newCalc = {
    value: inputValue,
    date: new Date().toLocaleDateString("pt-BR"),
  };

  try {
    const response = await fetch("http://localhost:3000/calculations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCalc),
    });

    if (response.ok) {
      alert("Cálculo salvo com sucesso!");
      globalThis.location.href = "history.html";
    }
  } catch (error) {
    console.error("Falha ao salvar cálculo:", error);
  }
}

async function loadHistory() {
  try {
    const response = await fetch("http://localhost:3000/calculations");
    const calculations = await response.json();

    const container = document.getElementById("historyListContainer");
    container.innerHTML = "";

    calculations.forEach((calc) => {
      container.innerHTML += `
                <div class="list-group mb-2">
                    <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Tolerance Calculation</strong> <br>
                            <small>${calc.value}</small> <br>
                            <small>${calc.date}</small>
                        </div>
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            `;
    });
  } catch (error) {
    console.error("Falha ao carregar histórico:", error);
  }
}
