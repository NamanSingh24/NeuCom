from dotenv import load_dotenv
load_dotenv()

import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

config = context.config
if config.config_file_name is not None:
	fileConfig(config.config_file_name)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
config.set_main_option("sqlalchemy.url", DATABASE_URL)
print("ALEMBIC_DATABASE_URL:", DATABASE_URL)

from Database.database import Base
from Modals.user import User  # noqa
from Modals.user_preference import UserPreferences  # noqa
target_metadata = Base.metadata

def run_migrations_offline():
	url = config.get_main_option("sqlalchemy.url")
	context.configure(
		url=url,
		target_metadata=target_metadata,
		literal_binds=True,
		dialect_opts={"paramstyle": "named"},
		include_schemas=True,
	)
	with context.begin_transaction():
		context.run_migrations()

def run_migrations_online():
	connectable = engine_from_config(
		config.get_section(config.config_ini_section),
		prefix="sqlalchemy.",
		poolclass=pool.NullPool,
	)
	with connectable.connect() as connection:
		context.configure(connection=connection, target_metadata=target_metadata, include_schemas=True)
		with context.begin_transaction():
			context.run_migrations()

if context.is_offline_mode():
	run_migrations_offline()
else:
	run_migrations_online()