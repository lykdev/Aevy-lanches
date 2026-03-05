from flask import Blueprint, request, jsonify
from .pixQRCode import gerarQRCodePIX
from apps.app import db_serv
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rotas_pagamento_bp = Blueprint('rotas_pagamento', __name__)

def calcular_valor_total(itens):
    total = 0.0
    for item in itens:
        unit = 0.0
        v = item.get('precoTotalUnitario')
        if v is not None:
            try:
                unit = float(v)
            except:
                unit = 0.0
        if unit == 0.0:
            v = item.get('preco')
            if v is not None:
                try:
                    unit = float(v)
                except:
                    unit = 0.0
        if unit == 0.0:
            v = item.get('precoBase')
            if v is not None:
                try:
                    unit = float(v)
                except:
                    unit = 0.0
        quantidade = item.get('quantidade', 1)
        try:
            quantidade = int(quantidade) if quantidade is not None else 1
        except:
            quantidade = 1
        total += unit * quantidade
    return total

@rotas_pagamento_bp.route('/gerar-qrcode', methods=['POST'])
def gerar_qrcode_pagamento():
    logger.info("Requisição recebida na rota /gerar-qrcode")
    logger.info(f"Método: {request.method}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Body bruto: {request.get_data()}")
    
    try:
        dados = request.get_json()
        logger.info(f"Dados recebidos: {dados}")
        
        if not dados:
            logger.error("Dados do pagamento são obrigatórios")
            return jsonify({
                'sucesso': False,
                'erro': 'Dados do pagamento são obrigatórios'
            }), 400
        
        usuario_id = dados.get('usuario_id')
        itens = dados.get('itens', dados.get('carrinho', []))
        
        logger.info(f"Usuario ID: {usuario_id}, Itens: {itens}")
        
        if not usuario_id:
            logger.error("ID do usuário é obrigatório")
            return jsonify({
                'sucesso': False,
                'erro': 'ID do usuário é obrigatório'
            }), 400
        
        if not itens:
            logger.error("Itens não podem estar vazios")
            return jsonify({
                'sucesso': False,
                'erro': 'Itens não podem estar vazios'
            }), 400
        
        valor_total = calcular_valor_total(itens)
        logger.info(f"Valor total calculado: {valor_total}")
        
        if valor_total <= 0:
            logger.error(f"Valor total deve ser maior que zero. Valor recebido: {valor_total}")
            return jsonify({
                'sucesso': False,
                'erro': 'Valor total deve ser maior que zero'
            }), 400
        
        logger.info("Iniciando geração do QR Code PIX...")
        qrcode_data = gerarQRCodePIX(
            valor=valor_total,
            descricao=f"Pedido Aevy Burger - {len(itens)} item(s) - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            usuario_id=usuario_id
        )
        
        logger.info(f"Resultado do gerarQRCodePIX: {qrcode_data}")
        
        if not qrcode_data.get('sucesso'):
            logger.error(f"Erro no gerarQRCodePIX: {qrcode_data.get('erro', 'Erro desconhecido')}")
            return jsonify({
                'sucesso': False,
                'erro': 'Erro ao gerar QR Code PIX',
                'detalhes': qrcode_data.get('erro', 'Erro desconhecido')
            }), 500
        
        pedido_id = qrcode_data.get('pedido_id') or f"pedido_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        usuario_nome = dados.get('usuario_nome')
        usuario_email = dados.get('usuario_email')
        lookup_id = None
        try:
            lookup_id = int(usuario_id)
        except:
            lookup_id = None
        if (not usuario_nome or not usuario_email) and lookup_id is not None:
            udoc = db_serv.usuarios.find_one({'id': lookup_id})
            if udoc:
                usuario_nome = usuario_nome or udoc.get('nome')
                usuario_email = usuario_email or udoc.get('email')
        
        pagamento_data = {
            'pedido_id': pedido_id,
            'usuario_id': usuario_id,
            'usuario_nome': usuario_nome,
            'usuario_email': usuario_email,
            'itens': itens,
            'data_criacao': datetime.now().isoformat(),
            'valor': valor_total,
            'status': 'pendente'
        }
        
        db_serv.pagamentos.insert_one(pagamento_data)
        logger.info(f"Pedido #{pedido_id} salvo no MongoDB")
        
        logger.info(f"Pedido #{pedido_id} processado com sucesso para usuário {usuario_id} - Valor: R$ {valor_total:.2f} - Itens: {len(itens)}")
        
        return jsonify({
            'sucesso': True,
            'pedido_id': pedido_id,
            'qrcode': qrcode_data['qrcode'],
            'chave_pix': qrcode_data.get('chave_pix', ''),
            'valor_total': valor_total,
            'valor': valor_total,
            'status': 'pendente'
        })
        
    except Exception as e:
        logger.error(f"Erro ao gerar QR Code: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno ao gerar QR Code'
        }), 500

@rotas_pagamento_bp.route('/verificar/<pedido_id>', methods=['GET'])
def verificar_pagamento(pedido_id):
    try:
        logger.info(f"Verificando pagamento do pedido: {pedido_id}")
        pedido = db_serv.pagamentos.find_one({'pedido_id': pedido_id})
        if pedido:
            return jsonify({
                'sucesso': True,
                'pedido_id': pedido_id,
                'status': pedido.get('status', 'pendente'),
                'valor': pedido.get('valor', 0),
                'data_criacao': pedido.get('data_criacao'),
                'usuario_id': pedido.get('usuario_id')
            })
        else:
            logger.warning(f"Pedido {pedido_id} não encontrado no MongoDB")
            return jsonify({
                'sucesso': False,
                'erro': 'Pedido não encontrado'
            }), 404
        
    except Exception as e:
        logger.error(f"Erro ao verificar pagamento: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro ao verificar pagamento',
            'detalhes': str(e)
        }), 500

@rotas_pagamento_bp.route('/cancelar/<pedido_id>', methods=['POST'])
def cancelar_pagamento(pedido_id):
    try:
        logger.info(f"Cancelando pedido: {pedido_id}")
        resultado = db_serv.pagamentos.update_one(
            {'pedido_id': pedido_id},
            {'$set': {'status': 'cancelado', 'data_cancelamento': datetime.now().isoformat()}}
        )
        
        if resultado.matched_count > 0:
            logger.info(f"Pedido {pedido_id} cancelado com sucesso no MongoDB")
            return jsonify({
                'sucesso': True,
                'mensagem': 'Pedido cancelado com sucesso',
                'pedido_id': pedido_id,
                'status': 'cancelado'
            })
        else:
            logger.warning(f"Pedido {pedido_id} não encontrado para cancelamento")
            return jsonify({
                'sucesso': False,
                'erro': 'Pedido não encontrado'
            }), 404
        
    except Exception as e:
        logger.error(f"Erro ao cancelar pedido: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro ao cancelar pedido'
        }), 500

@rotas_pagamento_bp.route('/confirmar/<pedido_id>', methods=['POST'])
def confirmar_pagamento(pedido_id):
    try:
        logger.info(f"Confirmando pagamento do pedido: {pedido_id}")
        resultado = db_serv.pagamentos.update_one(
            {'pedido_id': pedido_id, 'status': 'pendente'},
            {'$set': {'status': 'pago', 'data_conclusao': datetime.now().isoformat()}}
        )
        
        if resultado.matched_count > 0:
            logger.info(f"Pedido {pedido_id} confirmado com sucesso no MongoDB")
            return jsonify({
                'sucesso': True,
                'mensagem': 'Pagamento confirmado com sucesso',
                'pedido_id': pedido_id,
                'status': 'pago'
            })
        else:
            pedido = db_serv.pagamentos.find_one({'pedido_id': pedido_id})
            if pedido:
                if pedido.get('status') == 'pago':
                    return jsonify({
                        'sucesso': False,
                        'erro': 'Pagamento já foi confirmado'
                    }), 400
                elif pedido.get('status') == 'cancelado':
                    return jsonify({
                        'sucesso': False,
                        'erro': 'Não é possível confirmar um pedido cancelado'
                    }), 400
            else:
                logger.warning(f"Pedido {pedido_id} não encontrado para confirmação")
                return jsonify({
                    'sucesso': False,
                    'erro': 'Pedido não encontrado'
                }), 404
        
    except Exception as e:
        logger.error(f"Erro ao confirmar pagamento: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro ao confirmar pagamento'
        }), 500

@rotas_pagamento_bp.route('/historico/<usuario_id>', methods=['GET'])
def historico_pagamentos(usuario_id):
    try:
        pedidos_cursor = db_serv.pagamentos.find({'usuario_id': usuario_id}).sort('data_criacao', -1)
        pedidos = []
        
        for pedido in pedidos_cursor:
            pedidos.append({
                'pedido_id': pedido.get('pedido_id'),
                'valor': pedido.get('valor', 0),
                'status': pedido.get('status', 'pendente'),
                'data_criacao': pedido.get('data_criacao'),
                'data_conclusao': pedido.get('data_conclusao'),
                'data_cancelamento': pedido.get('data_cancelamento'),
                'itens': pedido.get('itens', [])
            })
        
        return jsonify({
            'sucesso': True,
            'total_pedidos': len(pedidos),
            'pedidos': pedidos
        })
        
    except Exception as e:
        logger.error(f"Erro ao buscar histórico: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro ao buscar histórico de pagamentos',
            'detalhes': str(e)
        }), 500
