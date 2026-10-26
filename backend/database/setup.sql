-- Cria (ou atualiza) os usuários e o banco do catálogo. Idempotente: pode rodar de novo, por exemplo para
-- trocar as senhas. Rode com um usuário administrador do PostgreSQL (psql 15 ou mais novo). Funciona com
-- superusuário (instalação local) e com o administrador de serviços gerenciados (CREATEROLE + CREATEDB):
--
--   CATALOG_OWNER_PASSWORD='...' CATALOG_API_PASSWORD='...' psql -X -d postgres -f backend/database/setup.sql
--
-- As senhas vêm de variáveis de ambiente para não ficarem no histórico do shell nem na lista de processos.
-- Como em todo ALTER ROLE ... PASSWORD, o servidor recebe a senha em texto e pode registrá-la no log se o
-- comando falhar ou se ele registrar todos os comandos (log_statement = ddl/all). Em servidor que não é o
-- seu, troque as senhas depois com \password no psql, que envia só o verificador SCRAM-SHA-256.
-- Opcionais (-v nome=valor): db_name (padrão course_catalog), owner_role (catalog_owner), api_role (catalog_api).
--
-- Resultado (privilégio mínimo):
--   owner_role  dono do banco; usado só pelo CourseCatalog.DbMigrator (migrations, seed e permissões).
--   api_role    usuário da API: conecta e lê. As sessões já começam somente leitura e com tempo máximo
--               por consulta. O SELECT nas tabelas é concedido pelo migrador, que cria as tabelas.

\set ON_ERROR_STOP on
\set QUIET on

\if :{?db_name}
\else
  \set db_name course_catalog
\endif
\if :{?owner_role}
\else
  \set owner_role catalog_owner
\endif
\if :{?api_role}
\else
  \set api_role catalog_api
\endif

\getenv owner_password CATALOG_OWNER_PASSWORD
\getenv api_password CATALOG_API_PASSWORD
\if :{?owner_password}
\else
  \set owner_password ''
\endif
\if :{?api_password}
\else
  \set api_password ''
\endif

SELECT length(:'owner_password') >= 16 AND length(:'api_password') >= 16 AS passwords_ok \gset
\if :passwords_ok
\else
  DO $$ BEGIN RAISE EXCEPTION 'Defina CATALOG_OWNER_PASSWORD e CATALOG_API_PASSWORD com pelo menos 16 caracteres.'; END $$;
\endif

SELECT current_setting('is_superuser') = 'on' AS is_superuser \gset

-- Usuários, sem nenhum privilégio administrativo
SELECT format('CREATE ROLE %I', :'owner_role')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'owner_role') \gexec
SELECT format('CREATE ROLE %I', :'api_role')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'api_role') \gexec

SELECT format('ALTER ROLE %I WITH LOGIN NOCREATEDB NOCREATEROLE PASSWORD %L', :'owner_role', :'owner_password') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN NOCREATEDB NOCREATEROLE CONNECTION LIMIT 20 PASSWORD %L',
  :'api_role', :'api_password') \gexec

-- Papéis novos já nascem sem SUPERUSER, REPLICATION e BYPASSRLS, e só um superusuário pode mexer nesses
-- atributos. Com superusuário, o script também os retira de papéis que já existiam.
\if :is_superuser
  SELECT format('ALTER ROLE %I WITH NOSUPERUSER NOREPLICATION NOBYPASSRLS', role_name)
  FROM unnest(ARRAY[:'owner_role', :'api_role']) AS role_name \gexec
\endif

-- Sessões da API: somente leitura por padrão, consulta de no máximo 5 s e transação parada de no máximo 10 s
SELECT format('ALTER ROLE %I SET default_transaction_read_only = on', :'api_role') \gexec
SELECT format('ALTER ROLE %I SET statement_timeout = %L', :'api_role', '5s') \gexec
SELECT format('ALTER ROLE %I SET idle_in_transaction_session_timeout = %L', :'api_role', '10s') \gexec

-- Sem superusuário, criar um banco com outro dono exige poder assumir esse papel (SET ROLE). No
-- PostgreSQL 16+, quem cria um papel já vira membro dele, mas sem o SET: por isso a checagem é de SET
-- (de filiação, nas versões anteriores, que não têm essa opção).
\if :is_superuser
\else
  SELECT format('GRANT %I TO CURRENT_USER', :'owner_role')
  WHERE NOT pg_has_role(current_user, :'owner_role',
    CASE WHEN current_setting('server_version_num')::int >= 160000 THEN 'SET' ELSE 'MEMBER' END) \gexec
\endif

-- Banco do catálogo. Só o dono e o usuário da API podem conectar (PUBLIC perde o acesso padrão).
SELECT format('CREATE DATABASE %I WITH OWNER %I ENCODING %L TEMPLATE template0', :'db_name', :'owner_role', 'UTF8')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name') \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db_name') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'db_name', :'api_role') \gexec

\echo 'Usuários e banco prontos. Próximo passo: rodar o CourseCatalog.DbMigrator (README, seção 6).'
