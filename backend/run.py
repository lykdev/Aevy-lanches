from apps.app import app
from flask_cors import CORS
if __name__ == '__main__':
    CORS(app)
    app.run(
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"]
    )

    if app.config["DEBUG"]:
        print("Servidor rodando em modo debug")
    else:
        print("Servidor rodando em modo produção")

    print(f"Servidor rodando em http://{app.config['HOST']}:{app.config['PORT']}")
