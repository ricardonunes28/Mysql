var express = require("express");
const mysql = require('mysql');

const app = express();
const port = 8000;

//Conexão com o banco de dados
var con = mysql.createConnection({
    host: "localhost",
    user: "user",
    password: "user",
    database: "mercadinho_rs"
});


con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado!!")
})


//rota pagina principal 
app.get("/", (req, res) => {
    res.render("index")
});


app.set("view engine", "ejs");//use como montor de visualização o ejs
app.set("views", __dirname, "/views");//minhas visualizações que vou precisar utilizar 

//chamando o motor de visualização
app.use(express.urlencoded());//permitindo que os dados passos, que haja fluxo(transitem) enrte minhas paginas 
app.use(express.json());// o fluxo dos meus arquivos seja em formato json
app.use(express.static(__dirname + '/public')); //Minhas pasta com permisão para css e js


//  Select produtos 
app.get("/listaProdutos", (req, res) => {
    con.query(
        'SELECT * FROM produtos',
        (err, rows) => {
            if (err) throw err

            rows.forEach(rows => {
                console.log(`${rows.nome_prod}, ${rows.qnt_prod}, ${rows.valor_prod}`)
            });
            res.render("listaProdutos", { listaProdutos: rows })
        })

});

app.get("/cadastroProdutos", (req, res) => {
    res.render("index")
});

// inserir produtos
app.post("/cadastroProdutos", (req, res) => {

    produtos_nome = req.body.nome;
    produtos_quantidade = req.body.quantidade;
    produtos_valor = req.body.valor;

    var sql = `INSERT INTO produtos(nome_prod, qnt_prod, valor_prod) VALUES('${produtos_nome}', '${produtos_quantidade}', '${produtos_valor}')`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("dado inserido: " + sql);
    });
    return res.redirect("/listaProdutos");
});

// Editar Produtos
app.get("/editarProdutos/:id", (req, res) => {
    let id = req.params.id;
    con.query(
        'SELECT * FROM produtos WHERE id_prod = ' + id, (err, conteudo) => {
            if (err)
                return res.status(500).send("Erro ao editar produtos");
            res.render("formeditarProdutos", { conteudo_item: conteudo[0] });
        });
});

app.post("/editarProdutos", (req, res) => {

    var id = req.body.id_prod;
    var updateData = req.body;

    con.query('UPDATE produtos SET ? WHERE id_prod= ?', [updateData, id], function (err, data) {
        if (err) throw err;
        console.log(data.affectedRows + " record(s) updated");
    });
    res.redirect('/listaProdutos');
});


// deletar produtos
app.get("/deletarProdutos/:id", (req, res) => {
    let id = req.params.id;
    con.query('DELETE FROM produtos WHERE id_prod= ' + id, function (err, result) {
        if (err)
            return res.status(500).send("Erro ao excluir registro");
        res.redirect("/listaProdutos")
    });
});



//Rotas cadastro de vendas

app.get("/cadastroVendas", (req, res) => {
    res.render("formVendas")
})

//Rotas cadastro de clientes
app.get("/cadastroClientes", (req, res) => {
    res.render("cadastroClientes")
})

app.get("/comprarProduto/:id", (req, res) => {
    let id = req.params.id;
    var comprar = "UPDATE produtos SET qnt_prod = qnt_prod -1 WHERE id_prod= '" + id + "'";

    con.query(comprar, id, (err, result) => {

        if (err) throw err;

    })
    res.redirect("/listaProdutos");

})

app.listen(port, () => {
    console.log("Servidor rodando na porta " + port)
});

