from werkzeug.security import check_password_hash, generate_password_hash

class Usuario:
    collection_name = 'usuarios'

    def __init__(self, id=None, nome=None, email=None, telefone=None, endereco=None, senha_hash=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.telefone = telefone
        self.endereco = endereco
        self.senha_hash = senha_hash

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco
        }

    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    @staticmethod
    def from_dict(data):
        return Usuario(
            id=data.get('id'),
            nome=data.get('nome'),
            email=data.get('email'),
            telefone=data.get('telefone'),
            endereco=data.get('endereco'),
            senha_hash=data.get('senha_hash')
        )