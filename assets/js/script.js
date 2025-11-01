document.addEventListener('DOMContentLoaded', () => {
    const calcForm = document.getElementById('calcForm');
    if (calcForm) {

        $(document).ready(function() {
            $('#toleranceInput').mask('SS0S0S0');
        });

        calcForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const input = document.getElementById('toleranceInput').value;
            const toleranceRegex = /^\d+[A-Za-z]\d+[A-Za-z]\d+$/;

            if (toleranceRegex.test(input)) {
                console.log('Formato válido!');
                saveCalculation(input);
            } else {
                alert('Formato inválido! Use um formato como 90H7p8.');
            }
        });
    }

    if (document.getElementById('historyListContainer')) {
        loadHistory();
    }

    const cepInput = document.getElementById('cep');
    if (cepInput) {
        
        cepInput.addEventListener('blur', async () => {
            const cepValue = cepInput.value.replace(/\D/g, '');

            if (cepValue.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
                    const data = await response.json();

                    if (data.erro) {
                        alert('CEP não encontrado.');
                        return;
                    }

                    // Preenche os campos
                    document.getElementById('rua').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('estado').value = data.uf;

                    // Foca no campo "número" para o usuário
                    document.getElementById('numero').focus();

                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                    alert('Não foi possível buscar o CEP.');
                }
            }
        });
    }
});

async function saveCalculation(inputValue) {
    const newCalc = {
        value: inputValue,
        date: new Date().toLocaleDateString('pt-BR') 
    };

    try {
        const response = await fetch('http://localhost:3000/calculations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCalc)
        });

        if (response.ok) {
            alert('Cálculo salvo com sucesso!');
            globalThis.location.href = '/pages/history.html';
        }
    } catch (error) {
        console.error('Falha ao salvar cálculo:', error);
    }
}

async function loadHistory() {
    try {
        const response = await fetch('http://localhost:3000/calculations');
        const calculations = await response.json();

        const container = document.getElementById('historyListContainer');
        container.innerHTML = ''; // Limpa o container

        calculations.forEach(calc => {
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
        console.error('Falha ao carregar histórico:', error);
    }
}