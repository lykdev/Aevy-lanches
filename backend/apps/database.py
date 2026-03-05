def get_db():
    from flask_pymongo import PyMongo
    from flask import current_app
    
    try:
        mongo = current_app.extensions.get('pymongo')
        if mongo:
            return mongo
    except:
        pass
    
    try:
        from flask_pymongo import PyMongo
        from flask import Flask
        app = Flask(__name__)
        app.config["MONGO_URI"] = "mongodb://localhost:27017/hamburgueria_db"
        return PyMongo(app)
    except:
        return None
