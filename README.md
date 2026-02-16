# Aevy Burger (Next.js)

Este é um projeto acadêmico de uma aplicação web fullstack para uma hamburgueria virtual. O objetivo foi construir um novo frontend utilizando **Next.js** e **Tailwind CSS** para consumir uma API backend existente feita em **Python (Flask)** e **MongoDB**.

## Este projeto é dividido em duas partes principais que rodam de forma independente:

* **Frontend (Este repositório):**
    * **Next.js:** Framework React para renderização e gerenciamento de páginas.
    * **React (useState, useEffect):** Para gerenciamento de estado e interatividade.
    * **Tailwind CSS:** Para estilização moderna e responsiva (mobile-first).
    * **JavaScript (ES6+):** Para a lógica do lado do cliente (carrinho, localStorage).

* **Backend (Pasta `/backend`):**
    * **Python:** Linguagem principal da API.
    * **Flask:** Micro-framework para a criação da API RESTful.
    * **PyMongo:** Driver para comunicação com o banco de dados MongoDB.
    * **MongoDB:** Banco de dados NoSQL (instalado localmente ou MongoDB Atlas).

## Funcionalidades

### 🍔 **Dashboard Pós-Login**
* Interface completa com cardápio visual e imagens dos lanches
* Sistema de carrinho de compras dinâmico com soma automática de valores
* Adição/remoção de produtos com controle de quantidade
* Navegação intuitiva entre cardápio e carrinho

### 🛒 **Sistema de Pedidos**
* Carrinho persistente em localStorage
* Cálculo automático de totais
* Interface responsiva com imagens dos produtos
* Fluxo completo: Dashboard → Carrinho → Pagamento

### 👨‍💼 **Área Administrativa**
* Painel exclusivo para administradores
* CRUD completo de produtos (Criar, Ler, Atualizar, Deletar)
* Interface visual para gerenciamento de lanches
* Acesso restrito ao usuário admin@codeburger.com

### 🔐 **Autenticação**
* Sistema de login com redirecionamento automático
* Sessão persistente no localStorage
- Proteção de rotas administrativas
* Logout com limpeza de dados

### 📱 **Interface Responsiva**
* Design moderno com Tailwind CSS
* Layout mobile-first
- Animações e transições suaves
- Notificações visuais de feedback

<br>


Para executar este projeto, você precisará ter **Git**, **Node.js (v18+)**, **Python 3.8+** e **MongoDB** instalados na sua máquina.

Siga os passos abaixo na ordem correta, pois o frontend depende do backend estar no ar.

# 1. Clonar o Repositório

```bash
git clone https://github.com/Recomece/Aevy.git
cd Aevy
``` 

# 2. Iniciar o Backend (MongoDB)
O backend (API em Python) roda com MongoDB instalado localmente.

## 1. Instale o MongoDB
- **Windows:** Baixe em https://www.mongodb.com/try/download/community
- **macOS:** `brew install mongodb-community`
- **Linux:** Siga as instruções em https://docs.mongodb.com/manual/installation/

## 2. Verifique se o MongoDB está rodando
```powershell
# Windows
Get-Service MongoDB
# Se não estiver rodando:
Start-Service MongoDB
```

## 3. Configure o Backend
```bash
cd backend
pip install -r requirements.txt
```

## 4. Inicialize o banco de dados
```bash
python -m apps.init_db
```

## 5. Inicie o servidor
```bash
python run.py
```
# 3. Iniciar o Frontend (Next.js)
Agora, abra um novo terminal (mantenha o terminal do backend rodando).
Neste novo terminal, execute os comandos para iniciar o site:
## 1. Entre na pasta do frontend
cd frontend

## 2. Instale as dependências (apenas na primeira vez)
npm install

## 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acessar o Projeto
Pronto! O servidor do frontend estará rodando.
Basta abrir o seu navegador e acessar: http://localhost:3000

# 5. Documentação da API
A documentação Swagger está disponível em: http://localhost:5002/apidocs

# 6. Acessar o Sistema

## 🌐 **Acesso Principal**
- **Aplicação**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard (após login)

## 👤 **Credenciais de Teste**

### Usuário Comum:
- **Email**: `test@example.com`
- **Senha**: `password123`

### Administrador:
- **Email**: `admin@codeburger.com`
- **Senha**: `admin123`

### 📋 **Fluxo de Uso**
1. Faça login na página inicial
2. Será redirecionado automaticamente para o Dashboard
3. Adicione produtos ao carrinho
4. Acesse o carrinho para visualizar/editar o pedido
5. Finalize o pedido na página de pagamento

### 👨‍💼 **Acesso Administrativo**
1. Faça login com as credenciais de admin
2. No dashboard, clique em "Área Admin"
3. Gerencie produtos (criar, editar, excluir)

---

## Estrutura do Banco de Dados MongoDB

### Coleções:
- **lanches**: Cardápio de hambúrgueres
- **usuarios**: Usuários cadastrados
- **pedidos**: Histórico de pedidos dos usuários

### Endpoints Principais:
- `GET /lanche` - Listar lanches
- `POST /lanche` - Criar lanche
- `DELETE /lanche/<id>` - Deletar lanche
- `POST /usuario/cadastro` - Cadastrar usuário
- `POST /login` - Login de usuário
- `GET /usuario/` - Listar usuários

### Endpoints de Pedidos:
- `POST /pedido` - Criar novo pedido
- `GET /pedidos` - Listar todos os pedidos
- `GET /pedidos?usuario_id=<id>` - Listar pedidos de um usuário
- `GET /pedido/<id>` - Buscar pedido por ID
- `PUT /pedido/<id>/status` - Atualizar status do pedido
- `DELETE /pedido/<id>` - Deletar pedido

### Estrutura da Coleção Pedidos:
```json
{
  "_id": "string",
  "usuario_id": "number",
  "usuario_nome": "string",
  "usuario_email": "string",
  "itens": [
    {
      "id": "number",
      "nome": "string",
      "preco": "number",
      "quantidade": "number"
    }
  ],
  "valor_total": "number",
  "status": "string",
  "data_criacao": "string",
  "data_atualizacao": "string"
}
```

### Status de Pedidos:
- `pendente` - Pedido aguardando confirmação
- `confirmado` - Pedido confirmado e em preparação
- `entregue` - Pedido entregue ao cliente
- `cancelado` - Pedido cancelado

Para mais detalhes sobre a configuração do MongoDB e troubleshooting, consulte o arquivo `backend/README_MONGODB.md`.
