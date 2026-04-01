# Sistema Avançado de Relatórios - Portal RH

## Visão Geral

O sistema de relatórios do Portal RH é uma aplicação Django dedicada que oferece funcionalidades avançadas de geração, execução e agendamento de relatórios para o sistema de recursos humanos.

## Funcionalidades Principais

### 1. Templates de Relatórios Customizáveis
- **ReportTemplate**: Modelos reutilizáveis para diferentes tipos de relatório
- Configuração flexível de filtros, campos e formatos de saída
- Sistema de permissões baseado em usuários e perfis
- Suporte a múltiplos formatos: JSON, PDF, Excel, CSV

### 2. Execução de Relatórios
- **ReportExecution**: Rastreamento completo das execuções
- Métricas de performance (tempo de execução, linhas processadas)
- Sistema de cache inteligente para otimização
- Gestão automática de expiração de arquivos

### 3. Agendamento Automático
- **ReportSchedule**: Execução automática de relatórios
- Frequências configuráveis (diário, semanal, mensal, personalizado)
- Notificações por email em caso de sucesso/falha
- Estatísticas de execução e taxa de sucesso

### 4. Sistema de Favoritos
- **ReportBookmark**: Salvamento de relatórios frequentes
- Parâmetros personalizados por usuário
- Acesso rápido a relatórios mais utilizados

### 5. Categorização
- **ReportCategory**: Organização de relatórios por categoria
- Interface visual com cores e ícones
- Filtragem e busca facilitada

## Tipos de Relatórios Suportados

### 1. Relatórios de Funcionários (`employees`)
- Lista completa de funcionários
- Filtros por departamento, cargo, status
- Métricas de salary médio e distribuição

### 2. Relatórios de Desligamentos (`terminations`)
- Histórico de desligamentos
- Análise por motivos de saída
- Tendências mensais

### 3. Relatórios de Avaliações (`evaluations`)
- Performance dos funcionários
- Distribuição de notas
- Comparativos por período

### 4. Relatórios de Férias (`leave_requests`)
- Solicitações de férias e licenças
- Status de aprovação
- Calendário de ausências

### 5. Relatórios de Admissões (`admissions`)
- Processos de admissão em andamento
- Taxa de conclusão
- Métricas de onboarding

### 6. Dashboard Executivo (`dashboard`)
- Resumo de métricas principais
- Gráficos e visualizações
- KPIs de RH

## Arquitetura Técnica

### Modelos de Dados

```python
# Principais modelos
- ReportCategory: Categorização de relatórios
- ReportTemplate: Templates customizáveis
- ReportExecution: Histórico de execuções
- ReportSchedule: Agendamentos automáticos
- ReportBookmark: Favoritos dos usuários
```

### Serviços

```python
# Services implementados
- ReportService: Lógica de geração de relatórios
- ExportService: Exportação para PDF/Excel/CSV
- CacheService: Gestão inteligente de cache
```

### APIs REST

```
# Endpoints principais
GET /api/v1/reports/categories/          # Listar categorias
GET /api/v1/reports/templates/           # Listar templates
POST /api/v1/reports/templates/{id}/execute/  # Executar relatório
GET /api/v1/reports/executions/         # Histórico de execuções
GET /api/v1/reports/dashboard/summary/   # Dashboard resumo
```

## Sistema de Cache

### Configuração Redis
```python
# Cache configurável no settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/0',
        'TIMEOUT': 300,  # 5 minutos
    }
}
```

### Estratégias de Cache
- **Relatórios JSON**: Cache de 5 minutos
- **Dashboard**: Cache de 5 minutos
- **Dados estáticos**: Cache de 1 hora
- **Invalidação automática**: Por tipo de relatório

## Sistema de Exportação

### PDF (ReportLab)
- Layout profissional com cabeçalhos
- Tabelas formatadas
- Suporte a gráficos (opcional)
- Limitação de 50 registros por página

### Excel (OpenPyXL)
- Planilhas formatadas
- Estilos automáticos
- Auto-ajuste de colunas
- Múltiplas abas (quando aplicável)

### CSV
- Formato padrão RFC 4180
- Encoding UTF-8
- Fallback manual se pandas não disponível

## Permissões e Segurança

### Sistema de Permissões
```python
# Níveis de acesso
- is_public: Acesso público (limitado)
- allowed_users: Usuários específicos
- allowed_roles: Perfis permitidos ['admin', 'rh', 'gestor', 'funcionario']
```

### Segurança
- Autenticação JWT obrigatória
- Validação de permissões por relatório
- Logs de execução completos
- Expiração automática de arquivos

## Instalação e Configuração

### 1. Dependências
```bash
pip install -r requirements.txt
```

### 2. Configuração do Redis (Opcional)
```bash
# Instalar Redis
sudo apt-get install redis-server

# Ou usar Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. Migrações
```bash
python manage.py makemigrations reports
python manage.py migrate
```

### 4. Dados Iniciais
```bash
python manage.py populate_reports
```

## Configurações Avançadas

### 1. Celery para Processamento Assíncrono
```python
# settings.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

### 2. Timeouts de Cache Personalizados
```python
# settings.py
CACHE_TIMEOUTS = {
    'reports': 300,      # 5 minutos
    'dashboard': 300,    # 5 minutos
    'user_data': 900,    # 15 minutos
    'static_data': 3600, # 1 hora
}
```

### 3. Configuração de Email para Agendamentos
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
```

## Uso da API

### Executar Relatório
```javascript
// JavaScript/React example
const executeReport = async (templateId, parameters) => {
  const response = await fetch(`/api/v1/reports/templates/${templateId}/execute/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parameters: parameters,
      format: 'excel'
    })
  });

  return response.json();
};
```

### Dashboard Summary
```javascript
// Obter dados do dashboard
const getDashboardData = async () => {
  const response = await fetch('/api/v1/reports/dashboard/summary/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  return response.json();
};
```

## Monitoramento e Logs

### Métricas Disponíveis
- Tempo de execução de relatórios
- Taxa de sucesso por template
- Uso de cache (hit/miss ratio)
- Relatórios mais executados

### Logs do Sistema
- Execuções de relatório
- Erros de geração
- Acessos negados
- Performance de queries

## Extensibilidade

### Adicionando Novos Tipos de Relatório

1. **Adicionar enum no modelo**:
```python
class ReportTypeChoices(models.TextChoices):
    NEW_TYPE = 'new_type', 'Novo Tipo de Relatório'
```

2. **Implementar geração no ReportService**:
```python
def _generate_new_type_report(self, filters, user):
    # Implementar lógica específica
    pass
```

3. **Adicionar aos serializers e views**

### Customização de Exportação
- Herdar de `ExportService`
- Sobrescrever métodos específicos
- Adicionar novos formatos

## Troubleshooting

### Problemas Comuns

1. **Redis não conecta**:
   - Verificar se Redis está rodando
   - Usar cache local como fallback

2. **Bibliotecas de exportação não instaladas**:
   - Instalar: `pip install reportlab openpyxl pandas`
   - Sistema funciona com fallbacks básicos

3. **Timeout em relatórios grandes**:
   - Aumentar timeout no settings
   - Implementar paginação
   - Usar processamento assíncrono

4. **Permissões de arquivo**:
   - Verificar diretório de media
   - Configurar MEDIA_ROOT corretamente

## Roadmap Futuro

### Funcionalidades Planejadas
- [ ] Dashboard interativo com gráficos
- [ ] Relatórios com drill-down
- [ ] Exportação para PowerBI/Tableau
- [ ] Templates visuais (drag-and-drop)
- [ ] API GraphQL
- [ ] Notificações push
- [ ] Relatórios colaborativos
- [ ] Versionamento de templates

### Melhorias de Performance
- [ ] Query optimization
- [ ] Compressão de cache
- [ ] CDN para arquivos estáticos
- [ ] Sharding de banco de dados

---

## Contribuição

Para contribuir com o sistema de relatórios:

1. Fork do repositório
2. Criar branch para feature
3. Implementar testes
4. Documentar mudanças
5. Criar Pull Request

## Licença

Este sistema faz parte do Portal RH e segue a mesma licença do projeto principal.