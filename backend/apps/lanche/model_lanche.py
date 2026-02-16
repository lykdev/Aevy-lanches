from apps.app import db_serv

class Lanche:
    collection_name = "lanches"

    def __init__(self, id, nome, preco, descricao):
        self.id = id
        self.nome = nome
        self.preco = preco
        self.descricao = descricao

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "preco": self.preco,
            "descricao": self.descricao
        }
    
    @staticmethod
    def from_dict(data):
        return Lanche(
            id=data.get('id'),
            nome=data.get('nome'),
            preco=data.get('preco'),
            descricao=data.get('descricao')
        )
        

class LancheJaExiste(Exception):
    def __init__(self, msg="Erro, já existe um lanche com esse id!"):
        self.msg = msg
        super().__init__(self.msg)

class LancheNaoExiste(Exception):
    def __init__(self, msg="Erro, o lanche não existe!"):
        self.msg = msg
        super().__init__(msg)

class CadastroDeLancheFalhado(Exception):
    def __init__(self, msg="Erro ao processar o cadastro do lanche!"):
        self.msg = msg
        super().__init__(msg)

class LancheSemId(Exception):
    def __init__(self, msg="Erro! Preencha o campo 'Id' do lanche! "):
        self.msg = msg
        super().__init__(msg)

class LancheSemNome(Exception):
    def __init__(self, msg="Erro! Preencha o campo 'Nome' do lanche! "):
        self.msg = msg
        super().__init__(msg)

class LancheSemPreco(Exception):
    def __init__(self, msg="Erro! Preencha o compo 'Preço' do lanche!"):
        self.msg = msg
        super().__init__(msg)

class LancheSemDescricao(Exception):
    def __init__(self, msg="Erro! Preencha o campo 'Descrição' do lanche"):
        self.msg = msg
        super().__init__(msg)




def criarLanche(lanche_dict):
    db_serv.lanches.insert_one(lanche_dict)
    return {"Descrição": "Lanche criado com êxito!"}, 200


def listarLanche():
    lanches = list(db_serv.lanches.find({}))
    for lanche in lanches:
        lanche.pop('_id', None)
    return lanches


def lancheExiste(id):
    """
    Verifica se um lanche já existe, cujo argumento é o Id.
    Caso lanche retorne None então lanche is not None, receberá False, 
    caso o contrário True.
    """
    lanche = db_serv.lanches.find_one({"id": id})
    return lanche is not None
        

def deletarLanche(id_lanche):
    try:
        result = db_serv.lanches.delete_one({"id": id_lanche})

        if result.deleted_count == 0:
            return {"Mensagem": LancheNaoExiste().msg}, 404
        else:
            return {"Mensagem": "Lanche deletado com sucesso!"}, 200
    except Exception as e:
        return ({"Erro": str(e)}), 500