from flask import jsonify
import usuario.model_usuario as modUso

# ==== Classe de exceção === #

class CampoLoginVazio(Exception):
    def __init__(self, msg="Erro, o corpo da requisição está vazio, email e senha devem ser preenchidos! "):
        self.msg = msg
        super().__init__(self.msg)

class CampoIncorreto(Exception):
    def __init__(self, msg="Email ou senha Incorretos!"):
        self.msg = msg
        super().__init__(msg)