from flask import Blueprint, request, jsonify
from apps.lanche.model_lanche import Lanche
from apps.app import db_serv 

bd_Lanche = Blueprint('Lanche', __name__)

@bd_Lanche.route("/lanche", methods=["GET"])
def listar_lanche():
    """
    Listar todos os lanches
    ---
    tags:
      - Lanches
    responses:
      200:
        description: Lista de lanches
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nome:
                type: string
              preco:
                type: number
              descricao:
                type: string
      500:
        description: Erro interno do servidor
    """
    try:
        lanches = list(db_serv.lanches.find({}, {"_id": 0}))
        return jsonify(lanches), 200
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500


@bd_Lanche.route("/lanche", methods=["POST"])
def criar_lanche():
    """
    Criar um novo lanche
    ---
    tags:
      - Lanches
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            id:
              type: integer
            nome:
              type: string
            preco:
              type: number
            descricao:
              type: string
    responses:
      201:
        description: Lanche criado com sucesso
      400:
        description: Campos obrigatórios ausentes ou id/preço inválidos
      409:
        description: Lanche com o mesmo ID já existe
      500:
        description: Erro interno do servidor
    """
    dados = request.get_json()
    if not dados or 'id' not in dados or 'nome' not in dados or 'preco' not in dados:
        return jsonify({"Erro": "Campos 'id', 'nome' e 'preco' são obrigatórios."}), 400

    if db_serv.lanches.find_one({"id": dados['id']}):
        return jsonify({"Erro": f"Lanche com ID {dados['id']} já existe."}), 409

    try:
        novo_lanche = {
            "id": int(dados['id']),
            "nome": dados['nome'],
            "preco": float(dados['preco']),
            "descricao": dados.get('descricao', '')
        }

        db_serv.lanches.insert_one(novo_lanche)
        
        return jsonify({"Mensagem": "Lanche criado com sucesso!"}), 201

    except ValueError:
        return jsonify({"Erro": "Requisição inválida. 'id' e 'preco' devem ser números."}), 400
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500


@bd_Lanche.route("/lanche/<int:id_lanche>", methods=["PUT"])
def atualizar_lanche(id_lanche):
    """
    Atualizar um lanche existente
    ---
    tags:
      - Lanches
    parameters:
      - in: path
        name: id_lanche
        required: true
        type: integer
        description: ID do lanche
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            nome:
              type: string
            preco:
              type: number
            descricao:
              type: string
    responses:
      200:
        description: Lanche atualizado com sucesso
      404:
        description: Lanche não encontrado
      400:
        description: Campos obrigatórios ausentes ou dados inválidos
      500:
        description: Erro interno do servidor
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({"erro": "Dados do lanche são obrigatórios"}), 400
        
        nome = dados.get('nome')
        preco = dados.get('preco')
        descricao = dados.get('descricao')
        
        if not nome:
            return jsonify({"erro": "Nome do lanche é obrigatório"}), 400
        
        if preco is None or preco <= 0:
            return jsonify({"erro": "Preço do lanche é obrigatório e deve ser maior que zero"}), 400
        
        lanche_existente = db_serv.lanches.find_one({"id": id_lanche})
        if not lanche_existente:
            return jsonify({"erro": "Lanche não encontrado"}), 404
        
        db_serv.lanches.update_one(
            {"id": id_lanche},
            {"$set": {
                "nome": nome,
                "preco": float(preco),
                "descricao": descricao or ""
            }}
        )
        
        return jsonify({
            "mensagem": "Lanche atualizado com sucesso",
            "lanche": {
                "id": id_lanche,
                "nome": nome,
                "preco": float(preco),
                "descricao": descricao or ""
            }
        }), 200
        
    except Exception as e:
        return jsonify({"erro": f"Erro interno do servidor: {str(e)}"}), 500

@bd_Lanche.route("/lanche/<int:id_lanche>", methods=["DELETE"])
def deletar_lanche(id_lanche):
    """
    Deletar um lanche pelo ID
    ---
    tags:
      - Lanches
    parameters:
      - in: path
        name: id_lanche
        type: integer
        required: true
        description: ID do lanche a ser deletado
    responses:
      200:
        description: Lanche deletado com sucesso
      404:
        description: Lanche não encontrado
      500:
        description: Erro interno do servidor
    """
    try:
        result = db_serv.lanches.delete_one({"id": id_lanche})

        if result.deleted_count == 0:
            return jsonify({"Mensagem": "Lanche não encontrado."}), 404
        
        return jsonify({"Mensagem": "Lanche deletado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500
