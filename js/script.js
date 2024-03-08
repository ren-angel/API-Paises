// Varíavel com o input
const nome = document.getElementById('nome');

// Varíaveis para guardar os dados buscados dos fontes externos
let nomeIngles = '';
let linguasSiglas = '';

// Varíavel com a representação em string do objeto Languages
let linguasString = '';

// Adiciona o evento de busca ao pressionar Enter no input
nome.addEventListener('keydown', function(event) {

    if(event.key === "Enter") {

        // Chama a função que consome a API
        consumoAPI();
    }
});

// Função assíncrona para buscar os dados da API
async function consumoAPI() {

    try {

        const resposta = await fetch('https://restcountries.com/v3.1/all');

        // Verifica se a resposta é não okay (status diferente de 200)
        if(!resposta.ok) throw resposta.status;

        const dados = await resposta.json();

        // Espera por ambas estas funções assíncronas completarem para continuar
        await Promise.all([pegaNomeIngles(), pegaLingua()]);
        
        // Chama a função que escreve os dados no documento
        escreverDocumento(dados);
    } catch (err) {

        // Trata erros através de escrevendo a mensagem de erro no elemento info
        document.getElementById('info').innerHTML = '';

        const p = document.createElement('p');
        p.appendChild(document.createTextNode(`Um erro ${err} ocorreu ao consumir a API dos países`));

        document.getElementById('info').appendChild(p);
    }
}

// Função assíncrona para buscar o nome em Inglês dos países em um arquivo local
async function pegaNomeIngles() {

    try {
        
        const resposta = await fetch('localFiles/countries.txt');

        // Verifica se a resposta é não okay (status diferente de 200)
        if (!resposta.ok) throw resposta.status;

        // Diferente do .json() que converte a Response como JSON, o .text() extraí o texto da Response
        const conteudo = await resposta.text();

        // Dividi o conteudo do texto numa array com os nomes de cada país, usando os caracteres de quebra de linhas como delimitador
        nomeIngles = conteudo.split('\r\n');
    } catch (err) {

        // Trata erros através de escrevendo a mensagem de erro no elemento info
        document.getElementById('info').innerHTML = '';

        const p = document.createElement('p');
        p.appendChild(document.createTextNode(`Um erro ${err} ocorreu ao consultar o dicionário`));

        document.getElementById('info').appendChild(p);
    }
}

// Função assíncrona para buscar o código das línguas suportadas pela API em um arquivo local
async function pegaLingua() {
    
    try {

        const resposta = await fetch('localFiles/language-codes.txt');

        // Verifica se a resposta é não okay (status diferente de 200)
        if (!resposta.ok) throw resposta.status;

        // Diferente do .json() que converte a Response como JSON, o .text() extraí o texto da Response
        const conteudo = await resposta.text();

        // Dividi o conteudo do texto numa array com os códigos de cada língua, usando os caracteres de quebra de linhas como delimitador
        linguasSiglas = conteudo.split('\r\n');
    } catch (err) {

        // Trata erros através de escrevendo a mensagem de erro no elemento info
        document.getElementById('info').innerHTML = '';

        const p = document.createElement('p');
        p.appendChild(document.createTextNode(`Um erro ${err} ocorreu ao consultar o língua`));

        document.getElementById('info').appendChild(p);
    }
}

// Função para converter o objeto Languages numa string formatada
function stringifyLinguasObjeto(pais) {

    // Esvazia a varíavel caso ela já possua um valor
    linguasString = '';

    // Itera sobre cada língua do objeto
    for (const lingua in pais.languages) {
        
        // Concatena cada língua seguida por uma vírgula e um espaço
        linguasString += `${pais.languages[lingua]}, `;
    }

    // Remove a vírgula e espaço final da string caso haja alguma após a última língua concatenada
    linguasString = linguasString.slice(0, -2);
}


// Função para escrever no documento baseado nos dados buscados
function escreverDocumento(dados) {

    // Converte o valor do input e os nomes em Inglês dos países para minúsculo
    const nomeMinusculo = nome.value.toLowerCase();
    const nomeInglesMinusculo = nomeIngles.map(palavras => palavras.toLowerCase());

    // Normaliza o valor do input minúsculo e os nomes minúsculos em Inglês dos países para forma decomposta do Unicode, e remove os diacríticos usando RegEx
    const nomeMinusculoSemAcentuacao = nomeMinusculo.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const nomeInglesMinusculoSemAcentuacao = nomeInglesMinusculo.map(palavras => palavras.normalize("NFD").replace(/\p{Diacritic}/gu, ""));

    // Sinalizador para rastrear se o país foi encontrado
    let encontrado = false;

    // Verifica se o valor do input minúsculo sem acentuação está incluso na array de nomes minúsculos sem acentuação em Inglês dos países
    if(nomeInglesMinusculoSemAcentuacao.includes(nomeMinusculoSemAcentuacao)) {

        // Acha nos dados o objeto Country que corresponde ao valor do input minúsculo sem acentuação
        const pegarPais = dados.find(pais => pais.name.common.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") === nomeMinusculoSemAcentuacao);

        // Chama a função que converterá o objeto da língua do país em string formatada
        stringifyLinguasObjeto(pegarPais);

        // Constrói o conteúdo HTML com as informações do país
        let infoPais = '';
        infoPais = `<div class="pais">
                        <p>País: ${pegarPais.name.common}</p>
                        <p>Capital(is): ${pegarPais.capital}</p>
                        <p>Região: ${pegarPais.region}</p>
                        <p>Sub-região: ${pegarPais.subregion}</p>
                        <p>Continente(s): ${pegarPais.continents}</p>
                        <p>Língua(s): ${linguasString}</p>
                        <p>População: ${pegarPais.population}</p>
                        <p>Fuso horário: ${pegarPais.timezones}</p>
                    </div>`;

        // Define o conteúdo do elemento 'info' para o conteúdo HTML construído
        document.getElementById('info').innerHTML = infoPais;
    } else {

        // Itera sobre cada país dos dados
        dados.forEach(pais => {

            // Itera sobre o código de cada língua
            linguasSiglas.forEach(codigo => {

                // Verifica se o valor do input minúsculo sem acentuação corresponde a tradução do nome minúsculo sem acentuação de algum país
                if(pais.translations[codigo]?.common.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") == nomeMinusculoSemAcentuacao) {

                    // Chama a função que converterá o objeto da língua do país em string formatada
                    stringifyLinguasObjeto(pais);
            
                    // Constrói o conteúdo HTML com as informações do país
                    let infoPais = '';
                    infoPais = `<div class="pais">
                                    <p>País: ${pais.name.common}</p>
                                    <p>Capital(is): ${pais.capital}</p>
                                    <p>Região: ${pais.region}</p>
                                    <p>Sub-região: ${pais.subregion}</p>
                                    <p>Continente(s): ${pais.continents}</p>
                                    <p>Língua(s): ${linguasString}</p>
                                    <p>População: ${pais.population}</p>
                                    <p>Fuso horário: ${pais.timezones}</p>
                                </div>`;

                    // Define o conteúdo do elemento 'info' para o conteúdo HTML construído
                    document.getElementById('info').innerHTML = infoPais;

                    // Define o sinalizador "encontrado" como verdadeiro, pois um país foi encontrado
                    encontrado = true;
                }
            });
        });

        // Se o sinalizador "encontrado" continua sendo falso, ou seja, se nenhum país foi encontrado
        if (!encontrado) {

            // Escreve uma mensagem indicando que o país não foi encontrado
            document.getElementById('info').innerHTML = '';

            const p = document.createElement('p');
            p.appendChild(document.createTextNode("País não encontrado"));

            document.getElementById('info').appendChild(p);
        }
    }
}