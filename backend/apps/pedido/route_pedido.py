from flask import Blueprint, request, jsonify
from apps.app import db_serv
from apps.pedido.model_pedido import criar_pedido, listar_pedidos, buscar_pedido, atualizar_status_pedido, deletar_pedido

bd_pedido = Blueprint('pedido', __name__)

@bd_pedido.route('/pedido', methods=['POST'])
def criar_novo_pedido():
    """
    Criar um novo pedido
    ---
    tags:
      - Pedidos
    parameters:
      - in: body
        name: pedido
        description: Dados do pedido
        required: true
        schema:
          type: object
          properties:
            usuario_id:
              type: integer
            usuario_nome:
              type: string
            usuario_email:
              type: string
            itens:
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
                  quantidade:
                    type: integer
            valor_total:
              type: number
    responses:
      201:
        description: Pedido criado com sucesso
      400:
        description: Dados inválidos
      500:
        description: Erro interno do servidor
    """
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['usuario_id', 'usuario_nome', 'usuario_email', 'itens']):
            return jsonify({"erro": "Dados incompletos. Campos obrigatórios: usuario_id, usuario_nome, usuario_email, itens."}), 400
        
        if not data['itens'] or len(data['itens']) == 0:
            return jsonify({"erro": "O pedido deve conter pelo menos um item."}), 400
        
        if isinstance(data.get('usuario_nome'), str):
            data['usuario_nome'] = data['usuario_nome'].encode('utf-8', errors='ignore').decode('utf-8')
        if isinstance(data.get('usuario_email'), str):
            data['usuario_email'] = data['usuario_email'].encode('utf-8', errors='ignore').decode('utf-8')
        
        result, status_code = criar_pedido(db_serv, data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500

@bd_pedido.route('/pedidos', methods=['GET'])
def listar_todos_pedidos():
    """
    Listar todos os pedidos (admin) ou pedidos do usuário logado
    ---
    tags:
      - Pedidos
    parameters:
      - in: query
        name: usuario_id
        type: integer
        required: false
        description: ID do usuário (opcional, para filtrar pedidos de um usuário específico)
    responses:
      200:
        description: Lista de pedidos
      500:
        description: Erro interno do servidor
    """
    try:
        usuario_id = request.args.get('usuario_id')
        if usuario_id:
            usuario_id = int(usuario_id)
            
        result, status_code = listar_pedidos(db_serv, usuario_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500

@bd_pedido.route('/pedido/<pedido_id>', methods=['GET'])
def buscar_pedido_por_id(pedido_id):
    """
    Buscar pedido por ID
    ---
    tags:
      - Pedidos
    parameters:
      - in: path
        name: pedido_id
        type: string
        required: true
        description: ID do pedido
    responses:
      200:
        description: Pedido encontrado
      404:
        description: Pedido não encontrado
      500:
        description: Erro interno do servidor
    """
    try:
        result, status_code = buscar_pedido(db_serv, pedido_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500

@bd_pedido.route('/pedido/<pedido_id>/status', methods=['PUT'])
def atualizar_status(pedido_id):
    """
    Atualizar status do pedido
    ---
    tags:
      - Pedidos
    parameters:
      - in: path
        name: pedido_id
        type: string
        required: true
        description: ID do pedido
      - in: body
        name: status
        description: Novo status do pedido
        required: true
        schema:
          type: object
          properties:
            status:
              type: string
              enum: [pendente, confirmado, entregue, cancelado]
    responses:
      200:
        description: Status atualizado com sucesso
      404:
        description: Pedido não encontrado
      500:
        description: Erro interno do servidor
    """
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({"erro": "Status não fornecido"}), 400
        
        return jsonify({"erro": "Status não é armazenado em pedidos"}), 400
        
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500

@bd_pedido.route('/pedido/<pedido_id>', methods=['DELETE'])
def deletar_pedido_por_id(pedido_id):
    """
    Deletar pedido por ID
    ---
    tags:
      - Pedidos
    parameters:
      - in: path
        name: pedido_id
        type: string
        required: true
        description: ID do pedido
    responses:
      200:
        description: Pedido deletado com sucesso
      404:
        description: Pedido não encontrado
      500:
        description: Erro interno do servidor
    """
    try:
        result, status_code = deletar_pedido(db_serv, pedido_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"Erro": f"Erro interno do servidor: {str(e)}"}), 500
