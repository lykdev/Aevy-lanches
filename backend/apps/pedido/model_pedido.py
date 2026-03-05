from datetime import datetime
import uuid

class Pedido:
    def __init__(self, usuario_id, usuario_nome, usuario_email, itens):
        self.usuario_id = usuario_id
        self.usuario_nome = usuario_nome
        self.usuario_email = usuario_email
        self.itens = itens
        self.data_criacao = datetime.now()

    def to_dict(self):
        return {
            "id": str(uuid.uuid4()),
            "usuario": self.usuario_id,
            "nome": self.usuario_nome,
            "email": self.usuario_email,
            "item": self.itens,
            "data_criacao": self.data_criacao.isoformat()
        }

    @staticmethod
    def from_dict(data):
        pedido = Pedido(
            usuario_id=data.get("usuario_id"),
            usuario_nome=data.get("usuario_nome"),
            usuario_email=data.get("usuario_email"),
            itens=data.get("itens", [])
        )
        
        if "id" in data:
            pedido._id = data["id"]
        
        if "data_criacao" in data:
            pedido.data_criacao = datetime.fromisoformat(data["data_criacao"])
            
        return pedido

def criar_pedido(db_serv, pedido_dict):
    try:
        pedido = Pedido.from_dict(pedido_dict)
        pedido_dict = pedido.to_dict()
        
        result = db_serv.pedidos.insert_one(pedido_dict)
        if result.inserted_id:
            pedido_dict.pop('_id', None)
            return {"mensagem": "Pedido criado com sucesso!", "pedido": pedido_dict}, 201
        else:
            return {"erro": "Erro ao criar pedido"}, 500
    except Exception as e:
        return {"erro": f"Erro ao criar pedido: {str(e)}"}, 500

def listar_pedidos(db_serv, usuario_id=None):
    try:
        if usuario_id:
            pedidos = list(db_serv.pedidos.find({"usuario": usuario_id}))
        else:
            pedidos = list(db_serv.pedidos.find())
        
        for pedido in pedidos:
            pedido.pop('_id', None)
            if 'id' in pedido:
                pedido['id'] = str(pedido['id'])
            
        return {"pedidos": pedidos}, 200
    except Exception as e:
        return {"erro": f"Erro ao listar pedidos: {str(e)}"}, 500

def buscar_pedido(db_serv, pedido_id):
    try:
        pedido = db_serv.pedidos.find_one({"id": pedido_id})
        if pedido:
            return pedido, 200
        else:
            return {"erro": "Pedido não encontrado"}, 404
    except Exception as e:
        return {"erro": f"Erro interno: {str(e)}"}, 500

def atualizar_status_pedido(db_serv, pedido_id, novo_status):
    try:
        return {"erro": "Status não é armazenado em pedidos"}, 400
        
        if result.modified_count > 0:
            return {"mensagem": "Status atualizado com sucesso!"}, 200
        else:
            return {"erro": "Pedido não encontrado ou status não alterado"}, 404
    except Exception as e:
        return {"erro": f"Erro interno: {str(e)}"}, 500

def deletar_pedido(db_serv, pedido_id):
    try:
        result = db_serv.pedidos.delete_one({"id": pedido_id})
        
        if result.deleted_count > 0:
            return {"mensagem": "Pedido deletado com sucesso!"}, 200
        else:
            return {"erro": "Pedido não encontrado"}, 404
    except Exception as e:
        return {"erro": f"Erro interno: {str(e)}"}, 500
