from flask import request, jsonify, Blueprint
from apps.usuario.model_usuario import Usuario
from apps.app import db_serv 

bd_login = Blueprint('login', __name__)

@bd_login.route('/login', methods=['POST'])
def logar():
    try:
        if not request.is_json:
            return jsonify({"erro": "Requisição deve ser JSON"}), 400
        
        dados = request.get_json()
        
        if not dados or 'email' not in dados or 'senha' not in dados:
            return jsonify({"erro": "Email e senha são obrigatórios"}), 400
        
        email = dados['email'].strip().lower()
        senha = dados['senha']
        
        usuario_encontrado = db_serv.usuario.find_one({"email": email})
        
        if usuario_encontrado and Usuario.verificar_senha(senha, usuario_encontrado['senha']):
            usuario_encontrado.pop('_id', None)
            usuario_encontrado.pop('senha', None)
            return jsonify({
                "mensagem": "Login realizado com sucesso!",
                "usuario": usuario_encontrado
            }), 200
        else:
            return jsonify({"erro": "Email ou senha incorretos"}), 401
            
    except Exception as e:
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500
