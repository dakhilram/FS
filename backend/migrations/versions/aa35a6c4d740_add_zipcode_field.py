"""Add zipcode field

Revision ID: aa35a6c4d740
Revises: 982a43211c24
Create Date: 2025-04-08 15:50:57.825349

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aa35a6c4d740'
down_revision = '982a43211c24'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('zipcode', sa.String(length=10), nullable=True))
        batch_op.drop_column('alert_zipcode')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('alert_zipcode', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
        batch_op.drop_column('zipcode')

    # ### end Alembic commands ###
