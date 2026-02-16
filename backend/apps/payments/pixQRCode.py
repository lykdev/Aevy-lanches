import qrcode
import io
import base64
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv

load_dotenv()

def gerarQRCodePIX(valor, descricao="", usuario_id=""):
    try:
        valor_centavos = int(round(valor * 100))
        
        chave_pix = os.getenv('PIX_KEY', 'c21b92fd-e3f2-408a-980a-e52f78b0dc16')
        nome_empresa = os.getenv('PIX_NOME', 'Aevy Burger Restaurante')
        cidade = os.getenv('PIX_CIDADE', 'SAO PAULO')
        
        txid = gerar_txid()
        
        payload_pix = f"""00020101021226890014BR.GOV.BCB.PIX0136{chave_pix}5204000053039865404{valor_centavos:06d}5802BR59{nome_empresa[:25]}6009{cidade[:15]}62140510{txid}6304ABCD"""
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(payload_pix)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'sucesso': True,
            'qrcode': img_str,
            'chave_pix': chave_pix,
            'valor': valor,
            'descricao': descricao,
            'txid': txid,
            'payload_pix': payload_pix
        }
        
    except Exception as e:
        return {
            'sucesso': False,
            'erro': f'Erro ao gerar QR Code: {str(e)}'
        }

def gerar_chave_pix():
    """
    Gera uma chave PIX aleatória para demonstração
    Em produção, usar a chave real do estabelecimento
    """
    import random
    cpf = ''.join([str(random.randint(0, 9)) for _ in range(11)])
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:11]}"

def gerar_txid():
    """
    Gera um TXID (identificador de transação) único
    """
    return str(uuid.uuid4()).replace('-', '')[:20]

def calcular_crc(payload):
    """
    Calcula CRC16 para validação do payload PIX
    Simplificado para demonstração
    """
    return "ABCD"

def gerar_qrcode_simples(texto):
    """
    Gera QR Code simples para qualquer texto
    @param {string} texto - Texto para codificar
    @returns {string} QR Code em base64
    """
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(texto)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
        
    except Exception as e:
        print(f"Erro ao gerar QR Code simples: {str(e)}")
        return None
