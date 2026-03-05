from apps.app import app, db_serv

def seed_database():
    """Popula a coleção de lanches com dados de exemplo."""
    lanches_de_exemplo = [
        {
            "id": 1, "nome": "Java Burguer", "preco": 31.99,
            "descricao": "Pão com gergelim, um suculento hambúrguer de pura carne bovina, cheddar fatiado, molho barbecue, 6 deliciosas onion rings, tomate, alface e maionese."
        },
        {
            "id": 2, "nome": "Kotlin Burguer", "preco": 36.5,
            "descricao": "Pão com gergelim, dois suculentos hambúrgueres de pura carne bovina, duas fatias de cheddar, quatro fatias de picles, alface, tomate, cebola, maionese e ketchup."
        },
        {
            "id": 3, "nome": "Python Burguer", "preco": 33.99,
            "descricao": "Pão com gergelim, um saboroso hambúrguer de pura carne bovina, uma fatia de queijo cheddar, duas fatias de picles, ketchup e molho mostarda."
        },
        {
            "id": 4, "nome": "SQL Burguer", "preco": 39.99,
            "descricao": "Um hambúrguer (carne 100% bovina), bacon, alface americana, cebola, queijo processado sabor cheddar, tomate, maionese, ketchup, mostarda e pão com gergelim."
        },
        {
            "id": 5, "nome": "PHP Burguer", "preco": 30.99,
            "descricao": "Dois hambúrgueres (carne 100% bovina), queijo processado sabor cheddar, cebola, fatias de bacon, ketchup, mostarda e pão com gergelim."
        },
        {
            "id": 6, "nome": "JS Burguer", "preco": 36.99,
            "descricao": "Os novos sanduíches contêm dois hambúrgueres de carne 100% bovina, com um peso total de 227,6g. Além da carne, a receita inclui a exclusiva maionese com sabor de carne defumada, fatias de bacon, queijo processado, molho especial e cebola ao molho shoyu."
        }
    ]

    print("Inserindo dados de exemplo de lanches...")
    for dados_lanche in lanches_de_exemplo:
        lanche_existente = db_serv.lanches.find_one({"id": dados_lanche["id"]})
        if not lanche_existente:
            db_serv.lanches.insert_one(dados_lanche)
            print(f"Adicionado: {dados_lanche['nome']}")
            
    print("Dados de exemplo inseridos com sucesso.")

def init():
    """
    Função principal que apaga, cria e popula as coleções do banco de dados MongoDB.
    ATENÇÃO: Este processo apaga todos os dados existentes!
    """
    with app.app_context():
        print("--- INICIANDO PROCESSO DE INICIALIZAÇÃO DO BANCO DE DADOS MONGODB ---")

        print("1. Apagando coleções antigas (se existirem)...")
        db_serv.lanches.drop()
        db_serv.usuarios.drop()
        print("   -> Coleções antigas apagadas.")

        print("2. Criando índices...")
        db_serv.usuarios.create_index("email", unique=True)
        db_serv.lanches.create_index("id", unique=True)
        print("   -> Índices criados com sucesso.")

        print("3. Populando o banco com dados iniciais...")
        seed_database()
        
        print("--- BANCO DE DADOS MONGODB PRONTO PARA USO! ---")
if __name__ == "__main__":
    init()