# Sistema Hamburgueria - Backend com MongoDB

## Pré-requisitos

- Python 3.8+
- MongoDB instalado e rodando localmente (ou acesso a um MongoDB Atlas)

## Instalação do MongoDB

### Windows

1. Baixe o MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Instale seguindo o assistente de instalação
3. O MongoDB será instalado como serviço do Windows e iniciará automaticamente

### Verificar se MongoDB está rodando

```powershell
# No PowerShell
Get-Service MongoDB
```

## Configuração do Projeto

### 1. Instalar dependências Python

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variável de ambiente (opcional)

Por padrão, o sistema conecta em `mongodb://localhost:27017/hamburgueria_db`

Para usar outra URI do MongoDB, defina a variável de ambiente:

```powershell
# Windows PowerShell
$env:MONGO_URI = "mongodb://localhost:27017/hamburgueria_db"

# Ou para MongoDB Atlas
$env:MONGO_URI = "mongodb+srv://usuario:senha@cluster.mongodb.net/hamburgueria_db"
```

### 3. Inicializar o banco de dados

```bash
python -m apps.init_db
```

Este comando irá:
- Apagar coleções existentes (lanches e usuarios)
- Criar índices únicos
- Popular a coleção de lanches com 6 hambúrgueres de exemplo

### 4. Executar o servidor

```bash
python run.py
```

O servidor estará disponível em: http://localhost:5002

## Documentação da API (Swagger)

Acesse: http://localhost:5002/apidocs

## Estrutura do Banco de Dados MongoDB

### Coleção: `lanches`

```json
{
  "id": 1,
  "nome": "Java Burguer",
  "preco": 31.99,
  "descricao": "Pão com gergelim, um suculento hambúrguer..."
}
```

**Índice único:** `id`

### Coleção: `usuarios`

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "endereco": "Rua Exemplo, 123",
  "senha_hash": "$pbkdf2-sha256$..."
}
```

**Índice único:** `email`

## Endpoints da API

### Lanches

- **GET** `/lanche` - Listar todos os lanches
- **POST** `/lanche` - Criar novo lanche
- **DELETE** `/lanche/<id>` - Deletar lanche por ID

### Usuários

- **GET** `/usuario/` - Listar todos os usuários
- **POST** `/usuario/cadastro` - Cadastrar novo usuário

### Login

- **POST** `/login` - Realizar login

## Diferenças da Migração

### O que mudou:

1. **Banco de dados**: MongoDB
2. **ORM**: PyMongo
3. **Modelos**: Classes Python simples (sem herança de db.Model)
4. **Queries**: Sintaxe MongoDB (find, insert_one, delete_one, etc.)


## Troubleshooting

### Erro: "No module named 'pymongo'"

```bash
pip install pymongo flask-pymongo
```

### Erro: "Connection refused" ao conectar no MongoDB

Verifique se o MongoDB está rodando:

```powershell
Get-Service MongoDB
# Se não estiver rodando:
Start-Service MongoDB
```

### Erro ao inicializar banco de dados

Certifique-se de que o MongoDB está acessível e que você tem permissões de escrita.

## Comandos Úteis MongoDB

```bash
# Conectar ao MongoDB via shell
mongosh

# Listar bancos de dados
show dbs

# Usar o banco hamburgueria_db
use hamburgueria_db

# Listar coleções
show collections

# Ver todos os lanches
db.lanches.find()

# Ver todos os usuários (sem senha)
db.usuarios.find({}, {senha_hash: 0})

# Limpar coleção
db.lanches.deleteMany({})
```

## Tecnologias Utilizadas

- **Flask** 3.0.0 - Framework web
- **PyMongo** 4.6.1 - Driver MongoDB para Python
- **Flask-PyMongo** 2.3.0 - Integração Flask + MongoDB
- **Werkzeug** 3.0.1 - Utilitários (hash de senha)
- **Flask-CORS** 4.0.0 - CORS
- **Flasgger** 0.9.7.1 - Documentação Swagger
