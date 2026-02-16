from datetime import datetime
from ..database import get_db

class Pedido:
    """
    Modelo de Pedido para o sistema Aevy Burger
    """
    
    def __init__(self, usuario_id, itens, valor_total, status='pendente', qrcode_pix='', chave_pix='', criado_em=None, atualizado_em=None):
        self.usuario_id = usuario_id
        self.itens = itens
        self.valor_total = valor_total
        self.status = status
        self.qrcode_pix = qrcode_pix
        self.chave_pix = chave_pix
        self.criado_em = criado_em or datetime.utcnow()
        self.atualizado_em = atualizado_em or datetime.utcnow()
    
    def save(self):
        """Salva o pedido no banco de dados"""
        db = get_db()
        
        # Se estiver usando MongoDB
        if hasattr(db, 'db'):
            pedido_data = {
                'usuario_id': self.usuario_id,
                'itens': self.itens,
                'valor_total': self.valor_total,
                'status': self.status,
                'qrcode_pix': self.qrcode_pix,
                'chave_pix': self.chave_pix,
                'criado_em': self.criado_em,
                'atualizado_em': self.atualizado_em
            }
            
            result = db.db.pedidos.insert_one(pedido_data)
            self.id = result.inserted_id
            return self.id
        
        # Se estiver usando SQLAlchemy (MySQL/PostgreSQL)
        else:
            from sqlalchemy import text
            query = text("""
                INSERT INTO pedidos (usuario_id, itens, valor_total, status, qrcode_pix, chave_pix, criado_em, atualizado_em)
                VALUES (:usuario_id, :itens, :valor_total, :status, :qrcode_pix, :chave_pix, :criado_em, :atualizado_em)
            """)
            
            result = db.session.execute(query, {
                'usuario_id': self.usuario_id,
                'itens': str(self.itens),  # Converter para JSON string
                'valor_total': self.valor_total,
                'status': self.status,
                'qrcode_pix': self.qrcode_pix,
                'chave_pix': self.chave_pix,
                'criado_em': self.criado_em,
                'atualizado_em': self.atualizado_em
            })
            
            db.session.commit()
            self.id = result.lastrowid
            return self.id
    
    def update_status(self, novo_status):
        """Atualiza o status do pedido"""
        self.status = novo_status
        self.atualizado_em = datetime.utcnow()
        
        db = get_db()
        
        # MongoDB
        if hasattr(db, 'db'):
            db.db.pedidos.update_one(
                {'_id': self.id},
                {'$set': {'status': novo_status, 'atualizado_em': self.atualizado_em}}
            )
        
        # SQLAlchemy
        else:
            from sqlalchemy import text
            query = text("""
                UPDATE pedidos 
                SET status = :status, atualizado_em = :atualizado_em 
                WHERE id = :id
            """)
            
            db.session.execute(query, {
                'status': novo_status,
                'atualizado_em': self.atualizado_em,
                'id': self.id
            })
            
            db.session.commit()
    
    @classmethod
    def find_by_id(cls, pedido_id):
        """Busca pedido por ID"""
        db = get_db()
        
        # MongoDB
        if hasattr(db, 'db'):
            pedido_data = db.db.pedidos.find_one({'_id': pedido_id})
            if pedido_data:
                pedido = cls(
                    usuario_id=pedido_data['usuario_id'],
                    itens=pedido_data['itens'],
                    valor_total=pedido_data['valor_total'],
                    status=pedido_data['status'],
                    qrcode_pix=pedido_data.get('qrcode_pix', ''),
                    chave_pix=pedido_data.get('chave_pix', ''),
                    criado_em=pedido_data.get('criado_em'),
                    atualizado_em=pedido_data.get('atualizado_em')
                )
                pedido.id = pedido_data['_id']
                return pedido
        
        # SQLAlchemy
        else:
            from sqlalchemy import text
            query = text("SELECT * FROM pedidos WHERE id = :id")
            result = db.session.execute(query, {'id': pedido_id}).fetchone()
            
            if result:
                pedido = cls(
                    usuario_id=result.usuario_id,
                    itens=eval(result.itens) if result.itens else [],  # Converter de JSON string
                    valor_total=result.valor_total,
                    status=result.status,
                    qrcode_pix=result.qrcode_pix or '',
                    chave_pix=result.chave_pix or '',
                    criado_em=result.criado_em,
                    atualizado_em=result.atualizado_em
                )
                pedido.id = result.id
                return pedido
        
        return None
    
    @classmethod
    def find_by_usuario(cls, usuario_id):
        """Busca todos os pedidos de um usuário"""
        db = get_db()
        
        # MongoDB
        if hasattr(db, 'db'):
            pedidos_data = db.db.pedidos.find({'usuario_id': usuario_id}).sort('criado_em', -1)
            pedidos = []
            
            for pedido_data in pedidos_data:
                pedido = cls(
                    usuario_id=pedido_data['usuario_id'],
                    itens=pedido_data['itens'],
                    valor_total=pedido_data['valor_total'],
                    status=pedido_data['status'],
                    qrcode_pix=pedido_data.get('qrcode_pix', ''),
                    chave_pix=pedido_data.get('chave_pix', ''),
                    criado_em=pedido_data.get('criado_em'),
                    atualizado_em=pedido_data.get('atualizado_em')
                )
                pedido.id = pedido_data['_id']
                pedidos.append(pedido)
            
            return pedidos
        
        # SQLAlchemy
        else:
            from sqlalchemy import text
            query = text("SELECT * FROM pedidos WHERE usuario_id = :usuario_id ORDER BY criado_em DESC")
            results = db.session.execute(query, {'usuario_id': usuario_id}).fetchall()
            
            pedidos = []
            for result in results:
                pedido = cls(
                    usuario_id=result.usuario_id,
                    itens=eval(result.itens) if result.itens else [],
                    valor_total=result.valor_total,
                    status=result.status,
                    qrcode_pix=result.qrcode_pix or '',
                    chave_pix=result.chave_pix or '',
                    criado_em=result.criado_em,
                    atualizado_em=result.atualizado_em
                )
                pedido.id = result.id
                pedidos.append(pedido)
            
            return pedidos
    
    def to_dict(self):
        """Converte o pedido para dicionário"""
        return {
            'id': str(self.id) if hasattr(self, 'id') else None,
            'usuario_id': self.usuario_id,
            'itens': self.itens,
            'valor_total': self.valor_total,
            'status': self.status,
            'qrcode_pix': self.qrcode_pix,
            'chave_pix': self.chave_pix,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None
        }
