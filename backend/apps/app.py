import os
from flask import Flask, redirect, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from flasgger import Swagger
from dotenv import load_dotenv

load_dotenv() 


app = Flask(__name__)
CORS(app)

app.config['HOST'] = os.environ.get('HOST', '0.0.0.0')
app.config['PORT'] = int(os.environ.get('PORT', 5002))
app.config['DEBUG'] = os.environ.get('DEBUG', 'True').lower() == 'true'
app.config['JSON_AS_ASCII'] = os.environ.get('JSON_AS_ASCII', 'False').lower() == 'false'
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/hamburgueria_db")

mongo = PyMongo(app)
db_serv = mongo.db

swagger = Swagger(app)

from apps.lanche.route_lanche import bd_Lanche
from apps.usuario.route_usuario import bd_usuario
from apps.login.route_login import bd_login
from apps.pedido.route_pedido import bd_pedido
from apps.payments.rotasPagamento import rotas_pagamento_bp

app.register_blueprint(bd_Lanche)
app.register_blueprint(bd_usuario, url_prefix='/usuario')
app.register_blueprint(bd_login)
app.register_blueprint(bd_pedido)
app.register_blueprint(rotas_pagamento_bp, url_prefix='/api/pagamento')


@app.get("/")
def root():
    return redirect("/apidocs")

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'erro': 'Rota não encontrada',
        'mensagem': 'Verifique se a URL está correta',
        'rotas_disponiveis': {
            'lanches': '/lanche',
            'usuarios': '/usuario',
            'login': '/login',
            'pedidos': '/pedidos',
            'pagamentos': '/api/pagamento/*'
        }
    }), 404

if __name__ == "__main__":
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])