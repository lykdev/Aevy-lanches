export const API_BASE_URL = 'http://localhost:5002';

export const API_ENDPOINTS = {
  LANCHES: `${API_BASE_URL}/lanche`,
  
  USUARIO_CADASTRO: `${API_BASE_URL}/usuario/cadastro`,
  USUARIO_LISTAR: `${API_BASE_URL}/usuario/`,
  
  LOGIN: `${API_BASE_URL}/login`,
  
  PAGAMENTO_GERAR_QRCODE: `${API_BASE_URL}/api/pagamento/gerar-qrcode`,
  PAGAMENTO_VERIFICAR: (id) => `${API_BASE_URL}/api/pagamento/verificar/${id}`,
  PAGAMENTO_CONFIRMAR: (id) => `${API_BASE_URL}/api/pagamento/confirmar/${id}`,
  PAGAMENTO_CANCELAR: (id) => `${API_BASE_URL}/api/pagamento/cancelar/${id}`,
  PAGAMENTO_HISTORICO: (id) => `${API_BASE_URL}/api/pagamento/historico/${id}`,
  
  PEDIDO_CRIAR: `${API_BASE_URL}/pedido`,
  PEDIDOS_LISTAR: `${API_BASE_URL}/pedidos`,
  PEDIDO_BUSCAR: (id) => `${API_BASE_URL}/pedido/${id}`,
  PEDIDO_ATUALIZAR_STATUS: (id) => `${API_BASE_URL}/pedido/${id}/status`,
  PEDIDO_DELETAR: (id) => `${API_BASE_URL}/pedido/${id}`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
};
