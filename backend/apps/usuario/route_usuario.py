from flask import request, jsonify, Blueprint
from werkzeug.security import generate_password_hash
from apps.app import db_serv
from apps.usuario.model_usuario import Usuario 

bd_usuario = Blueprint('usuario', __name__)

@bd_usuario.route('/cadastro', methods=['POST'])
def cadastrar_usuario():
    """
    Cadastrar um novo usuário
    ---
    tags:
      - Usuários
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            nome:
              type: string
            email:
              type: string
            telefone:
              type: string
            endereco:
              type: string
            senha:
              type: string
    responses:
      201:
        description: Usuário criado com sucesso
      400:
        description: Todos os campos obrigatórios (nome, email, senha) devem ser preenchidos
      409:
        description: Este email já está cadastrado
      500:
        description: Erro interno ao criar usuário
    """
    data = request.get_json()

    nome = data.get('nome')
    email = data.get('email')
    telefone = data.get('telefone')
    endereco = data.get('endereco') 
    senha = data.get('senha')

    if not all([nome, email, senha]):
        return jsonify({"erro": "Todos os campos (nome, email, senha) são obrigatórios"}), 400

    if db_serv.usuarios.find_one({"email": email}):
        return jsonify({"erro": "Este email já está cadastrado."}), 409

    senha_hash = generate_password_hash(senha)

    try:
        usuario_count = db_serv.usuarios.count_documents({})
        novo_usuario = {
            "id": usuario_count + 1,
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "endereco": endereco,
            "senha_hash": senha_hash
        }

        db_serv.usuarios.insert_one(novo_usuario)
        return jsonify({"mensagem": "Usuário criado com sucesso!"}), 201
    except Exception as e:
        print(f"Erro ao salvar usuário: {e}")
        return jsonify({"erro": "Erro interno ao criar usuário."}), 500


@bd_usuario.route('/', methods=['GET'])
def listar_usuarios():
    """
    Listar todos os usuários
    ---
    tags:
      - Usuários
    responses:
      200:
        description: Lista de usuários
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nome:
                type: string
              email:
                type: string
              telefone:
                type: string
              endereco:
                type: string
      500:
        description: Erro interno ao buscar usuários
    """
    try:
        usuarios = list(db_serv.usuarios.find({}, {"_id": 0, "senha_hash": 0}))
        return jsonify(usuarios), 200
        
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")
        return jsonify({"erro": "Erro interno ao buscar usuários."}), 500
